import { FlowNode, FlowEdge } from './types';
import { BlockFunctionTemplate, BlockFunctionTemplateParameters } from '../../../../../frontend/src/components/services/blockTemplateService';
import { nodeUtils } from '@/utils/nodeUtils';
import { ApiKey, ApiKeyType } from '@/types/KeyTypes';
import { NetworkType } from '@/types/NetworkTypes';
import { InputValueType } from '@/types/InputTypes';

export class FlowCompiler {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private templates: Record<string, BlockFunctionTemplate>;
  private nodeOutputVarNames: Map<string, string> = new Map();
  private typeCounters: Record<string, number> = {};
  private imports: {
    importName: string;
    importPath: string;
  }[] = []; // function to path mapping (ex: getUserSolBalance -> @opensol/templates)
  private printOutputs: string[] = [];
  private getFunctions: Map<string, string> = new Map();
  private apiKeys: Record<ApiKeyType, ApiKey> = {"helius": { key: "", tier: null }, "openai": { key: "", tier: null }, "birdeye": { key: "", tier: null }};
  private network: NetworkType = 'devnet';
  private noImports: boolean = false;
  private functionName: string = 'execute'; // Default function name
  private isGeneratingDisplayCode: boolean = false; // Flag to track which code we're generating

  constructor(
    nodes: FlowNode[], 
    edges: FlowEdge[], 
    templates: Record<string, BlockFunctionTemplate>,
    apiKeys: Record<ApiKeyType, ApiKey> = {"helius": { key: "", tier: null }, "openai": { key: "", tier: null }, "birdeye": { key: "", tier: null }},
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
        ${functionBody}
      } catch (error) {
        console.error('Error in ${templateName}:', error);
        throw error;
      }
    }`;
    this.getFunctions.set(templateName, functionCode);
    return functionCode;
  }

  private getNodeOutputType(nodeId: string): string {
    const node = nodeUtils.getFlowNode(this.nodes, nodeId);
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

  private getNodeInputVarNames(nodeId: string): Record<string, string> {
    const inputs: Record<string, string> = {};
    const incoming = this.edges.filter(e => e.target === nodeId);

    incoming.forEach(edge => {
      const sourceVar = this.nodeOutputVarNames.get(edge.source);
      if (sourceVar) {
        const paramName = edge.targetHandle?.startsWith('input-')
          ? edge.targetHandle.replace('input-', '')
          : edge.targetHandle || '';
        inputs[paramName] = sourceVar;
      }
    });

    return inputs;
  }

  private generatePrintCode(node: FlowNode, inputVar: InputValueType): string {
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
        return `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
      }
      
      const formattedTemplate = template.replace(/\$output\$/g, `\${${outputExpr}}`).replace(/`/g, '\\`');
      return `printOutput += \`${formattedTemplate}\\n\`;`;
    } else {
      // Handle non-string template values
      return `printOutput += \`${String(template).replace(/`/g, '\\`')}\\n\`;`;
    }
  }

  private getNextVarName(nodeType: string): string {
    if (this.typeCounters[nodeType] === undefined) {
      this.typeCounters[nodeType] = 0;
    } else {
      this.typeCounters[nodeType]++;
    }
    
    const counter = this.typeCounters[nodeType];
    
    switch (nodeType) {
      case 'CONST':
        return `const_${counter}`;
      case 'STRING':
        return `str_${counter}`;
      case 'OBJECT':
        return `obj_${counter}`;
      case 'PRINT':
        return `print_${counter}`;
      case 'CONDITIONAL':
        return `condition_${counter}`;
      case 'MINT':
        return `mint_${counter}`;
      case 'TRANSFER':
        return `transfer_${counter}`;
      case 'MATH':
        return `math_${counter}`;
      case 'GET':
        return `get_${counter}`;
      case 'HELIUS':
        return `helius_${counter}`;
      case 'BIRDEYE':
        return `birdeye_${counter}`;
      default:
        return `result_${counter}`;
    }
  }

  private generateNodeCode(node: FlowNode): string {
    if (node.type === 'FUNCTION') {
      // Extract function name from the node data
      const functionName = node.data.inputs?.['name']?.value;
      if (functionName && typeof functionName === 'string' && functionName.trim() !== 'Untitled Function') {
        const trimmedName = functionName.trim();
        if (trimmedName.includes(' ')) {
          // Convert to camelCase: "Example Function" -> "exampleFunction"
          const words = trimmedName.split(' ');
          this.functionName = words[0].toLowerCase() + 
            words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
        } else {
          this.functionName = trimmedName;
        }
      } else {
        this.functionName = 'execute';
      }
      
      // Register the node output as null - no variable created for function nodes
      this.nodeOutputVarNames.set(node.id, 'null');
      return ''; // No code generated for function node
    }
    
    const varName = this.getNextVarName(node.type);
    this.nodeOutputVarNames.set(node.id, varName);

    switch (node.type) {
      case 'GET':
      case 'HELIUS':
      case 'BIRDEYE':
      case 'MATH': {
        const templateName = node.data.inputs?.['function']?.value || '';
        if (!templateName || typeof templateName !== 'string') return '';
        const functionName = this.setFunctionImport(this.templates[templateName]);
        // Generate function body if needed (for inlining)
        this.maybeGenerateFunctionBody(templateName, true);

        const templateParams = this.getTemplateParams(templateName);
        const nodeInputs = nodeUtils.getFlowNode(this.nodes, node.id)?.data.inputs;
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
          const paramName = param.name;
          // Skip apiKey and network since we're handling those automatically
          if (paramName !== 'apiKey' && paramName !== 'network' && nodeInputs && nodeInputs[paramName]) {
            parameters[paramName] = nodeInputs[paramName].value;
          }
        });

        const paramsString = Object.entries(parameters)
          .map(([key, value]) => this.formatParam(key, value, requiredKeys))
          .join(', ');

        // Add nodeId to track results for Helius/GET nodes
        if (node.type === 'HELIUS' || node.type === 'GET') {
          let code = `const ${varName} = await ${functionName}({ ${paramsString} });`;
          
          // Only add updateNodeOutput call when generating function code (not display code)
          if (!this.isGeneratingDisplayCode) {
            code += `\nupdateNodeOutput(${JSON.stringify(node.id)}, ${varName});`;
          }
          
          return code;
        } else {
          return `const ${varName} = await ${functionName}({ ${paramsString} });`;
        }
      }

      case 'MINT': {        
        const name = node.data.inputs?.['name']?.value || '';
        const symbol = node.data.inputs?.['symbol']?.value || '';
        const description = node.data.inputs?.['description']?.value || '';
        const image = node.data.inputs?.['image']?.value || '';
        const supply = node.data.inputs?.['supply']?.value || 1000000000;

        return [
          `// Upload image first if it's a URL`,
          `let finalImageUrl_${varName} = ${JSON.stringify(image)};`,
          `if (typeof finalImageUrl_${varName} === 'string' && (finalImageUrl_${varName}.startsWith('http') || finalImageUrl_${varName}.startsWith('blob:'))) {`,
          `  try {`,
          `    const imageFile = await createFileFromUrl(finalImageUrl_${varName});`,
          `    if (imageFile) {`,
          `      finalImageUrl_${varName} = await uploadImageToPinata(imageFile);`,
          `    }`,
          `  } catch (error) {`,
          `    console.error('Error uploading image to Pinata:', error);`,
          `  }`,
          `}`,
          ``,
          `// Create and upload metadata`,
          `let finalMetadataUri_${varName} = "";`,
          `if (!finalMetadataUri_${varName}) {`,
          `  try {`,
          `    const metadata = {`,
          `      name: ${JSON.stringify(name)},`,
          `      symbol: ${JSON.stringify(symbol)},`,
          `      description: ${JSON.stringify(description)},`,
          `      image: finalImageUrl_${varName},`,
          `      showName: true,`,
          `      createdOn: "openSOL"`,
          `    };`,
          `    finalMetadataUri_${varName} = await uploadMetadataToPinata(metadata);`,
          `  } catch (error) {`,
          `    console.error('Error uploading metadata to Pinata:', error);`,
          `  }`,
          `}`,
          ``,
          `const ${varName} = await mintToken(`,
          `  ${JSON.stringify(name)},`,
          `  ${JSON.stringify(symbol)},`, 
          `  ${JSON.stringify(description)},`, 
          `  finalImageUrl_${varName},`,
          `  9,`, 
          `  ${supply},`, 
          `  finalMetadataUri_${varName},`,
          `  ${JSON.stringify(node.id || '')},`,
          `);`
        ].join('\n');
      }

      case 'TRANSFER': {
        const tokenAddress = node.data.inputs?.['tokenAddress']?.value || '';
        const amount = node.data.inputs?.['amount']?.value || '';
        const recipient = node.data.inputs?.['recipient']?.value || '';

        return [
          `const ${varName} = await transferToken(`,
          `  ${JSON.stringify(tokenAddress)},`, 
          `  ${JSON.stringify(amount)},`, 
          `  ${JSON.stringify(recipient)},`,
          `  ${JSON.stringify(node.id || '')},`,
          `);`
        ].join('\n');
      }

      case 'STRING': {
        return `const ${varName} = ${JSON.stringify(node.data.inputs?.['value']?.value || '')};`;
      }

      case 'PRINT': {
        const inputVar = Object.values(this.getNodeInputVarNames(node.id))[0];
        if (!inputVar) {
          throw new Error(`Print node ${node.id} has no input`);
        }
        const printCode = this.generatePrintCode(node, inputVar);
        this.printOutputs.push(printCode);
        return `const ${varName} = ${inputVar};`;
      }

      case 'CONDITIONAL': {
        const inputs = this.getNodeInputVarNames(node.id);
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
          if (targetNode && !this.nodeOutputVarNames.has(thenTarget)) {
            // Process the target node first
            const code = this.generateNodeCode(targetNode);
            if (code) {
              this.nodeOutputVarNames.set(thenTarget, code.split(' = ')[0].replace('const ', ''));
            }
          }
          thenCode = this.nodeOutputVarNames.get(thenTarget) ?? 'null';
        }
        
        if (elseEdges.length > 0) {
          const elseTarget = elseEdges[0].target;
          // Ensure the target node is processed
          const targetNode = this.nodes.find(n => n.id === elseTarget);
          if (targetNode && !this.nodeOutputVarNames.has(elseTarget)) {
            // Process the target node first
            const code = this.generateNodeCode(targetNode);
            if (code) {
              this.nodeOutputVarNames.set(elseTarget, code.split(' = ')[0].replace('const ', ''));
            }
          }
          elseCode = this.nodeOutputVarNames.get(elseTarget) ?? 'null';
        }
        
        // Generate code with ternary operator or if/else block based on complexity
        const conditionStr = typeof conditionInput === 'string' && (conditionInput.includes('&&') || conditionInput.includes('||')) 
          ? `(${conditionInput})` 
          : conditionInput;
        
        if (thenCode === 'null' && elseCode === 'null') {
          // If both branches are null, just evaluate the condition
          return `const ${varName} = Boolean(${conditionStr});`;
        } else {
          // Create a proper if/else block for better readability
          return [
            `let ${varName};`,
            `if (${conditionStr}) {`,
            `  ${varName} = ${thenCode};`,
            `} else {`,
            `  ${varName} = ${elseCode};`,
            `}`
          ].join('\n');
        }
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
        return `const ${varName} = ${JSON.stringify(formattedValue)};`;
      }

      case 'OBJECT': {
        const inputs = this.getNodeInputVarNames(node.id);
        const inputVar = inputs['object'] || Object.values(inputs)[0];
        return `const ${varName} = ${inputVar};`;
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

    // Define API keys with consistent indentation
    const apiKeyLines = [];
    for (const key of Object.keys(this.apiKeys)) {
      if (this.apiKeys[key as ApiKeyType].key !== '') {
        if (hideApiKey) {
          apiKeyLines.push(`const ${key.toUpperCase()}_API_KEY = process.env.${key.toUpperCase()}_API_KEY;`);
        } else if (this.apiKeys[key as ApiKeyType]) {
          apiKeyLines.push(`const ${key.toUpperCase()}_API_KEY = ${JSON.stringify(this.apiKeys[key as ApiKeyType])};`);
        }
      }
    }
    
    // Format API key definitions with consistent indentation
    const defineApiKey = apiKeyLines.length > 0
      ? apiKeyLines.map(line => `  ${line}`).join('\n')
      : '';

    const codeLines = [
      `async function ${this.functionName}() {`,
      defineApiKey,
      `  NODE_CODE_HERE`,
      ``,
      `  let printOutput = '';`,
      `  PRINT_OUTPUT_HERE`,
      ``,
      `  if (printOutput === '') {`,
      `    return "No output to print";`,
      `  }`,
      `  return printOutput;`,
      `}`
    ].filter(line => line !== ''); // Remove empty lines when no API key exists
    
    const codeBlock = codeLines.join('\n');

    const finalCodeLines = [
      functionImports,
      inlineFunctions ? functionBodies : '',
      codeBlock
    ].filter(part => part.trim() !== '');
    
    return finalCodeLines.join('\n\n');
  }

  /**
   * Compiles the flow by traversing the nodes in topological order,
   * generating code for each node and splicing in print statements.
   * Returns an object containing the executable function,
   * the full inline function code ("functionCode"), and a version for display ("displayCode").
   */
  compile(): { functionName: string; execute: () => Promise<any>; functionCode: string; displayCode: string } {
    this.nodeOutputVarNames.clear();
    this.typeCounters = {}; 
    this.functionName = 'execute'; // Reset to default
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
        nodeCodeLines.push(code);
      }

      // Visit child nodes
      this.edges.filter(e => e.source === nodeId).forEach(e => visitNode(e.target));
    };

    rootNodes.forEach(n => visitNode(n.id));

    // Process multi-line code snippets with proper indentation
    const indentedNodeCode = nodeCodeLines
      .map(code => {
        // For empty code, return nothing
        if (!code.trim()) return '';
        
        // Split each code block into lines and properly indent
        const lines = code.split('\n');
        
        // Always use exactly 2 spaces for the first line (top-level declarations)
        return lines
          .map((line, i) => {
            // Skip empty lines
            if (!line.trim()) return line;
            // First line always gets exactly 2 spaces for consistent top-level indentation
            // Subsequent lines get 4 spaces
            return i === 0 ? `  ${line.trim()}` : `    ${line}`;
          })
          .join('\n');
      })
      .filter(Boolean) // Remove empty strings
      .join('\n\n');

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
      if (!this.imports.some(imp => imp.importName === 'createFileFromUrl')) {
        this.imports.push({
          importName: 'createFileFromUrl',
          importPath: '@opensol/utils/createFileFromUrl'
        });
      }
    }

    if (this.nodes.some(n => n.type === 'TRANSFER')) {
      this.imports.push({
        importName: 'transferToken',
        importPath: '@opensol/blockchain/transfer'
      });
    }

    // Generate inline function code for execution (API key shown, no imports)
    const savedNoImports = this.noImports;
    this.noImports = true;
    this.isGeneratingDisplayCode = false; // Generating function code for execution
    const functionCodeRaw = this.generateFinalCode(true, false);
    const functionCode = functionCodeRaw
      .replace('NODE_CODE_HERE', indentedNodeCode)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);

    // Generate display code (imports shown, API key hidden)
    this.noImports = false;
    this.isGeneratingDisplayCode = true; // Generating display code
    
    // Need to regenerate node code with updateNodeOutput calls removed
    this.nodeOutputVarNames.clear();
    this.typeCounters = {};
    const savedPrintOutputs = [...this.printOutputs]; // Save print outputs
    this.printOutputs = [];
    
    // Regenerate node code for display
    const displayNodeCodeLines: string[] = [];
    visited.clear();
    
    const visitNodeForDisplay = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit dependencies first
      this.edges.filter(e => e.target === nodeId).forEach(e => visitNodeForDisplay(e.source));

      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found.`);
      }
      const code = this.generateNodeCode(node);
      if (code) {
        displayNodeCodeLines.push(code);
      }

      // Visit child nodes
      this.edges.filter(e => e.source === nodeId).forEach(e => visitNodeForDisplay(e.target));
    };

    rootNodes.forEach(n => visitNodeForDisplay(n.id));
    
    // Process multi-line code snippets with proper indentation for display code
    const displayNodeCodeJoined = displayNodeCodeLines
      .map(code => {
        // For empty code, return nothing
        if (!code.trim()) return '';
        
        // Split each code block into lines and properly indent
        const lines = code.split('\n');
        return lines
          .map((line, i) => {
            // Skip empty lines
            if (!line.trim()) return line;
            // First line gets 2 spaces, subsequent lines get 4 spaces (2 extra)
            return i === 0 ? `  ${line}` : `    ${line}`;
          })
          .join('\n');
      })
      .filter(Boolean) // Remove empty strings
      .join('\n\n');
    
    const displayCodeRaw = this.generateFinalCode(false, true);
    const displayCode = displayCodeRaw
      .replace('NODE_CODE_HERE', displayNodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', savedPrintOutputs.join('\n')); // Use original print outputs
    
    // Restore original noImports value
    this.noImports = savedNoImports;

    // Wrap the function code to build a real executable function.
    const wrappedFunctionCode = `
${functionCode}
return { execute: ${this.functionName}, FlowCompilerOutput: ${this.functionName} };
`;
    const runtimeFn = new Function(wrappedFunctionCode)() as {
      execute: () => Promise<any>;
      FlowCompilerOutput: () => Promise<any>;
    };
    console.log('functionCode', functionCode);
    console.log('displayCode', displayCode);
    return {
      functionName: this.functionName,
      execute: runtimeFn.execute,
      functionCode,
      displayCode
    };
  }
}
