import { FlowNode, FlowEdge } from './types';
import { BlockFunctionTemplate, BlockFunctionTemplateParameters } from '../../../../../frontend/src/components/services/blockTemplateService';
import { nodeUtils } from '@/utils/nodeUtils';
import { ApiKeyType } from '@/types/KeyTypes';
import { NetworkType } from '@/types/NetworkTypes';

export class FlowCompiler {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private templates: Record<string, BlockFunctionTemplate>;
  private nodeOutputs: Map<string, string> = new Map();
  private varCounter: number = 0;
  private imports: {
    importName: string;
    importPath: string;
  }[] = []; // function to path mapping (getUserSolBalance -> @opensol/templates)
  private printOutputs: string[] = [];
  private getFunctions: Map<string, string> = new Map();
  private apiKeys: Record<ApiKeyType, string> = {"helius": "", "openai": "", "birdeye": ""};
  private network: NetworkType = 'devnet';
  private noImports: boolean = false;

  constructor(
    nodes: FlowNode[], 
    edges: FlowEdge[], 
    templates: Record<string, BlockFunctionTemplate>,
    apiKeys: Record<ApiKeyType, string> = {"helius": "", "openai": "", "birdeye": ""},
    network: NetworkType = 'devnet',
    options: { noImports?: boolean } = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.templates = templates;
    this.apiKeys = apiKeys;
    this.network = network;
    this.noImports = options.noImports || false;
  }

  /**
   * Helper function that formats parameters for code generation.
   * If the parameter is a key type listed in the template's requiredKeys,
   * it will use the appropriate API key from the context.
   */
  private formatParam(key: string, value: any, requiredKeys?: ApiKeyType[]): string {
    // Handle API keys from context
    if (key === 'apiKey') {
      if (requiredKeys?.includes('helius' as ApiKeyType) && this.apiKeys['helius']) {
        return `${key}: HELIUS_API_KEY`;
      }
      if (requiredKeys?.includes('openai' as ApiKeyType) && this.apiKeys['openai']) {
        return `${key}: OPENAI_API_KEY`;
      }
      if (requiredKeys?.includes('birdeye' as ApiKeyType) && this.apiKeys['birdeye']) {
        return `${key}: BIRDEYE_API_KEY`;
      }
    }
    
    // Handle network from context
    if (key === 'network') {
      return `${key}: ${JSON.stringify(this.network)}`;
    }

    // Handle node connection variables
    if (typeof value === 'string' && (value.startsWith('result_') || value.startsWith('const_'))) {
      return `${key}: ${value}`;
    }
    
    return `${key}: ${JSON.stringify(value)}`;
  }

  private setFunctionImport(template?: BlockFunctionTemplate | null, functionName?: string, functionPath?: string): string {
    if (!functionName) {
      functionName = template?.metadata.name ?? '';
    }
    if (!functionPath) {
      functionPath = `@opensol/templates/${template?.metadata.blockCategory?.toLowerCase()}/${template?.metadata.blockType.toLowerCase()}`;
    }
    
    if (!this.noImports && !this.imports.find((importItem) => importItem.importName === functionName)) {
      this.imports.push({ 
        importName: functionName, 
        importPath: functionPath 
      });
    }
    
    return functionName;
  }

  /**
   * Generates the helper function body from the template's execute method.
   * When inlineFunctions is true, the function body is generated; otherwise, it is omitted.
   */
  private maybeGenerateFunctionBody(templateName: string, inlineFunctions: boolean): string {
    if (!inlineFunctions) {
      return '';
    }
    if (this.getFunctions.has(templateName)) {
      return '';
    }
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found for function: ${templateName}`);
    }
    const functionName = this.setFunctionImport(template);
    const functionBody = template.execute
      .toString()
      .split('\n')
      .slice(1, -1)
      .join('\n');
    
    // For the mintToken function, we don't need to create a function body
    // since we'll be injecting the real functions
    if (templateName === 'mintToken' && this.noImports) {
      return '';
    }
    
    const functionCode = `async function ${functionName}(params) {
      try {
        const { address, apiKey, network } = params;
        ${functionBody.replace(/const\s*{\s*address\s*,\s*apiKey\s*,\s*network\s*}\s*=\s*params\s*;/, '')}
      } catch (error) {
        console.error('Error in ${templateName}:', error);
        throw error;
      }
    }`;
    this.getFunctions.set(templateName, functionCode);
    return functionCode;
  }

  private getNodeOutputType(nodeId: string): string {
    const node = nodeUtils.getNode(this.nodes, nodeId);
    if (!node) return 'any';

    const selectedFunction = node.data.inputs?.['function']?.value;
    if (selectedFunction) {
      if (!selectedFunction || typeof selectedFunction !== 'string') return 'any';
      const template = this.templates[selectedFunction];

      return template?.metadata?.output?.type ?? 'any';
    }

    if (!node.data.output) return 'any';

    return node.data.output.type;
  }

  private getNodeInputs(nodeId: string): Record<string, string> {
    const inputs: Record<string, string> = {};
    const incoming = this.edges.filter(e => e.target === nodeId);

    incoming.forEach(edge => {
      const sourceVar = this.nodeOutputs.get(edge.source);
      if (sourceVar) {
        const paramName = edge.targetHandle?.startsWith('input-')
          ? edge.targetHandle.replace('input-', '')
          : edge.targetHandle || '';
        inputs[paramName] = sourceVar;
      }
    });

    return inputs;
  }

  private generatePrintCode(node: FlowNode, inputVar: string): string {
    if (!inputVar) return '';
    const sourceNodeId = this.edges.find(e => e.target === node.id)?.source;
    if (!sourceNodeId) return '';

    const sourceType = this.getNodeOutputType(sourceNodeId);
    let outputExpr = '';

    switch (sourceType) {
      case 'object':
        outputExpr = `JSON.stringify(${inputVar}, null, 2)`;
        break;
      case 'string':
      case 'number':
      case 'boolean':
        outputExpr = `String(${inputVar})`;
        break;
      case 'string[]':
      case 'number[]':
      case 'boolean[]':
        outputExpr = `JSON.stringify(${inputVar})`;
        break;
      default:
        outputExpr = `(typeof ${inputVar} === 'object' ? JSON.stringify(${inputVar}, null, 2) : String(${inputVar}))`;
    }
    const template = node.data.inputs?.['template']?.value || '';
    // Check if template is a string before using string methods
    if (typeof template === 'string') {
      if (!template.includes('$output$')) {
        return `printOutput += \`${template}\\n\`;`;
      }
      
      const formattedTemplate = template.replace(/\$output\$/g, `\${${outputExpr}}`);
      return `printOutput += \`${formattedTemplate}\\n\`;`;
    } else {
      // Handle non-string template values
      return `printOutput += \`${String(template)}\\n\`;`;
    }
  }

  private generateNodeCode(node: FlowNode): string {
    const varName = `result_${this.varCounter++}`;
    this.nodeOutputs.set(node.id, varName);

    switch (node.type) {
      case 'GET':
      case 'HELIUS':
      case 'MATH': {
        const templateName = node.data.inputs?.['function']?.value || '';
        if (!templateName || typeof templateName !== 'string') return '';
        const functionName = this.setFunctionImport(this.templates[templateName]);
        // Generate function body if needed (for inlining)
        this.maybeGenerateFunctionBody(templateName, true);

        const templateParams = this.getTemplateParams(templateName);
        const inputs = this.getNodeInputs(node.id);
        const parameters: Record<string, any> = {};
        const requiredKeys = this.getTemplateKeys(templateName);
        
        // Add network and API keys automatically if they're required
        for (const key of requiredKeys) {
          if (requiredKeys?.includes(key)) {
            parameters['apiKey'] = `${key.toUpperCase()}_API_KEY`; 
          }
        }

        parameters['network'] = this.network;
        
        templateParams.forEach(param => {
          const inputKey = param.name;
          const inputNodeKey = inputKey;
          // Skip apiKey and network since we're handling those automatically
          if (inputKey !== 'apiKey' && inputKey !== 'network' && inputs[inputNodeKey]) {
            parameters[inputKey] = inputs[inputNodeKey];
          }
        });

        const paramsString = Object.entries(parameters)
          .map(([key, value]) => this.formatParam(key, value, requiredKeys))
          .join(', ');

        return `const ${varName} = await ${functionName}({ ${paramsString} });`;
      }

      case 'MINT': {
        const inputs = this.getNodeInputs(node.id);
        
        // Get values directly from node data inputs
        const name = node.data.inputs?.['name']?.value || '';
        const symbol = node.data.inputs?.['symbol']?.value || '';
        const description = node.data.inputs?.['description']?.value || '';
        const image = node.data.inputs?.['image']?.value || '';
        const decimals = node.data.inputs?.['decimals']?.value || 9;
        
        // For mintToken, we're going to use an injected function
        return `const ${varName} = await mintToken(
  ${JSON.stringify(name)}, 
  ${JSON.stringify(symbol)}, 
  ${JSON.stringify(description)}, 
  ${JSON.stringify(image)},
  ${decimals}, 
  100, 
  ${JSON.stringify(node.data.inputs?.['metadataUri']?.value || '')}
);`;
      }

      case 'STRING': {
        return `const ${varName} = ${JSON.stringify(node.data.inputs?.['value']?.value || '')};`;
      }

      case 'PRINT': {
        const inputVar = Object.values(this.getNodeInputs(node.id))[0];
        if (!inputVar) {
          throw new Error(`Print node ${node.id} has no input`);
        }
        const printCode = this.generatePrintCode(node, inputVar);
        this.printOutputs.push(printCode);
        return `const ${varName} = ${inputVar};`;
      }

      case 'CONDITIONAL': {
        const inputs = this.getNodeInputs(node.id);
        const conditionInput = inputs['condition'];
        
        if (!conditionInput) {
          throw new Error(`Conditional node ${node.id} has no condition input`);
        }

        // Find connected nodes for then/else branches
        const thenEdges = this.edges.filter(e => e.source === node.id && e.sourceHandle === 'then');
        const elseEdges = this.edges.filter(e => e.source === node.id && e.sourceHandle === 'else');
        
        // Check if the then/else nodes have been processed
        let thenCode = 'null';
        let elseCode = 'null';
        
        if (thenEdges.length > 0) {
          const thenTarget = thenEdges[0].target;
          // Ensure the target node is processed
          const targetNode = this.nodes.find(n => n.id === thenTarget);
          if (targetNode && !this.nodeOutputs.has(thenTarget)) {
            // Process the target node first
            const code = this.generateNodeCode(targetNode);
            if (code) {
              this.nodeOutputs.set(thenTarget, code.split(' = ')[0].replace('const ', ''));
            }
          }
          thenCode = this.nodeOutputs.get(thenTarget) ?? 'null';
        }
        
        if (elseEdges.length > 0) {
          const elseTarget = elseEdges[0].target;
          // Ensure the target node is processed
          const targetNode = this.nodes.find(n => n.id === elseTarget);
          if (targetNode && !this.nodeOutputs.has(elseTarget)) {
            // Process the target node first
            const code = this.generateNodeCode(targetNode);
            if (code) {
              this.nodeOutputs.set(elseTarget, code.split(' = ')[0].replace('const ', ''));
            }
          }
          elseCode = this.nodeOutputs.get(elseTarget) ?? 'null';
        }
        
        // Generate code with ternary operator or if/else block based on complexity
        const conditionStr = conditionInput.includes('&&') || conditionInput.includes('||') 
          ? `(${conditionInput})` 
          : conditionInput;
        
        if (thenCode === 'null' && elseCode === 'null') {
          // If both branches are null, just evaluate the condition
          return `const ${varName} = Boolean(${conditionStr});`;
        } else {
          // Create a proper if/else block for better readability
          return `
let ${varName};
if (${conditionStr}) {
  ${varName} = ${thenCode};
} else {
  ${varName} = ${elseCode};
}`;
        }
      }

      case 'FUNCTION': {
        const inputs = this.getNodeInputs(node.id);
        const inputVar = inputs['flow'] || Object.values(inputs)[0];
        return inputVar ? `const ${varName} = ${inputVar};` : `const ${varName} = null;`;
      }

      case 'CONST': {
        const dataType = node.data.inputs?.['dataType']?.value || 'string';
        let formattedValue;
        if (dataType === 'number') {
          formattedValue = Number(node.data.inputs?.['value']?.value || 0);
        } else if (dataType === 'boolean') {
          const value = node.data.inputs?.['value']?.value;
          formattedValue = value === 'true' || value === true;
        } else {
          formattedValue = String(node.data.inputs?.['value']?.value || '');
        }
        const constName = `const_${this.varCounter++}`;
        this.nodeOutputs.set(node.id, constName);
        return `const ${constName} = ${JSON.stringify(formattedValue)};`;
      }

      default:
        return `// Node type ${node.type} is not handled yet.`;
    }
  }

  private getTemplateParams(templateName: string): BlockFunctionTemplateParameters[] {
    const template = this.templates[templateName];
    if (!template) return [];
    return template.metadata.parameters;
  }

  private getTemplateKeys(templateName: string): ApiKeyType[] {
    const template = this.templates[templateName];
    if (!template) return [];
    return template.metadata.requiredKeys || [];
  }

  /**
   * Generates the final code as a string.
   * The inlineFunctions flag controls whether helper functions are inlined or imported.
   * The hideApiKey flag determines whether to show the actual API key or reference process.env.
   */
  private generateFinalCode(inlineFunctions: boolean, hideApiKey: boolean): string {
    let functionBodies = '';
    if (inlineFunctions) {
      functionBodies = Array.from(this.getFunctions.values()).join('\n\n');
    }

    // Only include import statements in display code, not executable code
    const functionImports = (!this.noImports && !inlineFunctions) 
      ? this.imports.map(importItem => `import { ${importItem.importName} } from '${importItem.importPath}';`).join('\n')
      : '';

    let defineApiKey = '';
    for (const key of Object.keys(this.apiKeys)) {
      if (this.apiKeys[key as ApiKeyType] !== '') {
        if (hideApiKey) {
          defineApiKey += `const ${key.toUpperCase()}_API_KEY = process.env.${key.toUpperCase()}_API_KEY;\n`;
        } else if (this.apiKeys[key as ApiKeyType]) {
          defineApiKey += `const ${key.toUpperCase()}_API_KEY = ${JSON.stringify(this.apiKeys[key as ApiKeyType])};\n`;
        }
      }
    }

    let codeBlock = '';
    codeBlock += `async function execute() {\n`;
    codeBlock += `  ${defineApiKey}\n`;
    codeBlock += `
  NODE_CODE_HERE

  let printOutput = '';
  PRINT_OUTPUT_HERE

  return { output: printOutput };
}
`;

    const finalCode = `
${functionImports}

${inlineFunctions ? functionBodies : ''}

${codeBlock}
`;
    return finalCode.trim();
  }

  /**
   * Compiles the flow by traversing the nodes in topological order,
   * generating code for each node and splicing in print statements.
   * Returns an object containing the executable function,
   * the full inline function code ("functionCode"), and a version for display ("displayCode").
   */
  compile(): { execute: () => Promise<any>; functionCode: string; displayCode: string } {
    this.nodeOutputs.clear();
    this.varCounter = 0;
    this.printOutputs = [];
    this.getFunctions.clear();
    this.imports = [];

    const rootNodes = this.nodes.filter(node => !this.edges.some(edge => edge.target === node.id));
    if (rootNodes.length === 0) {
      throw new Error('No root nodes found in flow');
    }

    const nodeCodeLines: string[] = [];
    const visited = new Set<string>();

    const visitNode = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit dependencies first
      this.edges.filter(e => e.target === nodeId).forEach(e => visitNode(e.source));

      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found.`);
      }
      const code = this.generateNodeCode(node);
      if (code) {
        nodeCodeLines.push(`  ${code}`);
      }

      // Visit child nodes
      this.edges.filter(e => e.source === nodeId).forEach(e => visitNode(e.target));
    };

    rootNodes.forEach(n => visitNode(n.id));

    const nodeCodeJoined = nodeCodeLines.join('\n');
    const printLinesJoined = this.printOutputs.map(line => `  ${line}`).join('\n');

    // Imports for "MINT"
    if (this.nodes.some(n => n.type === 'MINT')) {
      this.imports.push({ 
        importName: 'mintToken', 
        importPath: '@opensol/blockchain/mint'
      });
      if (!this.imports.some(imp => imp.importName === 'uploadImageToPinata')) {
        this.imports.push({
          importName: 'uploadImageToPinata',
          importPath: '@opensol/ipfs/uploadImageToPinata'
        });
      }
      if (!this.imports.some(imp => imp.importName === 'uploadMetadataToPinata')) {
        this.imports.push({
          importName: 'uploadMetadataToPinata',
          importPath: '@opensol/ipfs/uploadMetadataToPinata'
        });
      }
    }

    // Generate inline function code for execution (API key shown, no imports)
    const savedNoImports = this.noImports;
    this.noImports = true;
    const functionCodeRaw = this.generateFinalCode(true, false);
    const functionCode = functionCodeRaw
      .replace('NODE_CODE_HERE', nodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);

    // Generate display code (imports shown, API key hidden)
    this.noImports = false;
    const displayCodeRaw = this.generateFinalCode(false, true);
    const displayCode = displayCodeRaw
      .replace('NODE_CODE_HERE', nodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);
    
    // Restore original noImports value
    this.noImports = savedNoImports;

    // Wrap the function code to build a real executable function.
    const wrappedFunctionCode = `
${functionCode}
return { execute, FlowCompilerOutput: execute };
`;
    const runtimeFn = new Function(wrappedFunctionCode)() as {
      execute: () => Promise<any>;
      FlowCompilerOutput: () => Promise<any>;
    };
    console.log('functionCode', functionCode);
    console.log('displayCode', displayCode);
    return {
      execute: runtimeFn.execute,
      functionCode,
      displayCode
    };
  }
}
