import { FlowNode, FlowEdge } from './types';
import { 
  BlockFunctionTemplate, 
  BlockFunctionTemplateParameters
} from '@/components/services/blockTemplateService';
import { nodeUtils } from '@/utils/nodeUtils';
import { ApiKey, ApiKeyType } from '@/types/KeyTypes';
import { NetworkType } from '@/types/NetworkTypes';
import { 
  InputValueType, 
  InputValueTypeString 
} from '@/types/InputTypes';
import { functionExecuteStringMap } from '@/code-strings';

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
  private injectedFunctions: Map<string, string> = new Map(); // functions to inject into executed code
  private apiKeys: Record<ApiKeyType, ApiKey> = {"helius": { key: "", tier: null }, "openai": { key: "", tier: null }, "birdeye": { key: "", tier: null }};
  private network: NetworkType = 'devnet';
  private noImports: boolean = false;
  private functionName: string = 'execute'; // Default function name
  private isGeneratingDisplayCode: boolean = false; // Flag to track which code we're generating
  private processedNodes: Set<string> = new Set(); // Track processed nodes to avoid duplicates
  private currentIndentLevel: number = 0; // Track current indentation level

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

    // Handle node connection variables - check for all generated variable patterns
    if (typeof value === 'string' && (
      value.startsWith('result_') || 
      value.startsWith('const_') || 
      value.startsWith('str_') ||
      value.startsWith('obj_') ||
      value.startsWith('print_') ||
      value.startsWith('condition_') ||
      value.startsWith('mint_') ||
      value.startsWith('transfer_') ||
      value.startsWith('math_') ||
      value.startsWith('get_') ||
      value.startsWith('helius_') ||
      value.startsWith('birdeye_')
    )) {
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
  private generateFunctionCode(templateName: string, inlineFunctions: boolean): string {
    if (!inlineFunctions) {
      return '';
    }
    if (this.injectedFunctions.has(templateName)) {
      return '';
    }
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found for function: ${templateName}`);
    }

    const functionCode = functionExecuteStringMap[templateName];

    this.injectedFunctions.set(templateName, functionCode);
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
      case 'REPEAT':
        return `repeat_${counter}`;
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
      case 'SOLANA':
        return `solana_${counter}`;
      default:
        return `result_${counter}`;
    }
  }

  /**
   * Generate code for conditional branches with proper flow path processing
   */
  private generateConditionalBranchCode(branchNodeId: string, indentLevel: number): { code: string; printStatements: string[] } {
    const codeLines: string[] = [];
    const printStatements: string[] = [];
    const visited = new Set<string>();
    
    const processNode = (nodeId: string): void => {
      if (visited.has(nodeId) || this.processedNodes.has(nodeId)) return;
      
      visited.add(nodeId);
      this.processedNodes.add(nodeId);
      
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Process data dependencies first (input connections) within this scope
      const dataDependencies = this.edges.filter(e => 
        e.target === nodeId && 
        e.targetHandle?.startsWith('input-') &&
        !['flow-then', 'flow-else', 'flow-loop'].includes(e.sourceHandle || '')
      );
      
      dataDependencies.forEach(edge => {
        processNode(edge.source);
      });
      
      // Set current indent level for this node
      const savedIndentLevel = this.currentIndentLevel;
      this.currentIndentLevel = indentLevel;
      
      // Handle print nodes specially to capture their print statements
      if (node.type === 'PRINT') {
        const dataInputs = this.getNodeInputVarNames(node.id);
        
        // Check if this node already has a variable name assigned
        let varName = this.nodeOutputVarNames.get(node.id);
        if (!varName) {
          varName = this.getNextVarName(node.type);
          this.nodeOutputVarNames.set(node.id, varName);
        }
        
        // Check for flow connection
        const flowEdge = this.edges.find(e => 
          e.target === node.id && 
          (e.targetHandle === 'flow-top' || e.targetHandle === 'flow-bottom')
        );
        
        let template: string = '';
        let isTemplateConnected = false;
        
        if (dataInputs['template']) {
          isTemplateConnected = true;
          template = dataInputs['template'];
        } else {
          template = String(node.data.inputs?.['template']?.value || '');
        }
        
        let printCode = '';
        if (flowEdge) {
          const flowSourceVar = this.nodeOutputVarNames.get(flowEdge.source);
          if (flowSourceVar) {
            const sourceType = this.getNodeOutputType(flowEdge.source);
            let outputExpr = '';
            
            switch (sourceType) {
              case 'object':
                outputExpr = `JSON.stringify(${flowSourceVar}, null, 2)`;
                break;
              case 'string':
              case 'number':
              case 'boolean':
                outputExpr = `String(${flowSourceVar})`;
                break;
              case 'string[]':
              case 'number[]':
              case 'boolean[]':
                outputExpr = `JSON.stringify(${flowSourceVar})`;
                break;
              default:
                outputExpr = `(typeof ${flowSourceVar} === 'object' ? JSON.stringify(${flowSourceVar}, null, 2) : String(${flowSourceVar}))`;
            }
            
            // Handle template replacement
            if (isTemplateConnected) {
              printCode = `printOutput += \`\${${template}.replace(/\\$output\\$/g, ${outputExpr})}\\n\`;`;
            } else {
              // Template is a literal string
              if (template.includes('$output$')) {
                const formattedTemplate = template.replace(/\$output\$/g, `\${${outputExpr}}`).replace(/`/g, '\\`');
                printCode = `printOutput += \`${formattedTemplate}\\n\`;`;
              } else {
                printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
              }
            }
            
            // Generate the variable assignment
            const nodeCode = `const ${varName} = ${flowSourceVar};`;
            const indentedCode = '  '.repeat(indentLevel) + nodeCode;
            codeLines.push(indentedCode);
            
            // Add the print statement
            const indentedPrintCode = '  '.repeat(indentLevel) + printCode;
            printStatements.push(indentedPrintCode);
          } else {
            // Fallback if no flow source variable found
            const nodeCode = `const ${varName} = ${JSON.stringify(template)};`;
            const indentedCode = '  '.repeat(indentLevel) + nodeCode;
            codeLines.push(indentedCode);
            
            printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
            const indentedPrintCode = '  '.repeat(indentLevel) + printCode;
            printStatements.push(indentedPrintCode);
          }
        } else {
          // No flow connection, check for data input connections
          const inputVar = Object.values(dataInputs)[0];
          if (inputVar) {
            // Generate the variable assignment
            const nodeCode = `const ${varName} = ${inputVar};`;
            const indentedCode = '  '.repeat(indentLevel) + nodeCode;
            codeLines.push(indentedCode);
            
            // Generate the print statement
            printCode = this.generatePrintCode(node, inputVar);
            const indentedPrintCode = '  '.repeat(indentLevel) + printCode;
            printStatements.push(indentedPrintCode);
          } else {
            // Handle print node with no input connections (direct template value)
            const nodeCode = `const ${varName} = ${JSON.stringify(template)};`;
            const indentedCode = '  '.repeat(indentLevel) + nodeCode;
            codeLines.push(indentedCode);
            
            // Generate the print statement for template-only print nodes
            if (isTemplateConnected) {
              printCode = `printOutput += \`\${${template}}\\n\`;`;
            } else {
              if (typeof template === 'string') {
                if (!template.includes('$output$')) {
                  printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
                } else {
                  printCode = `printOutput += \`${template.replace(/\$output\$/g, `\${String(${varName})}`).replace(/`/g, '\\`')}\\n\`;`;
                }
              } else {
                printCode = `printOutput += \`${String(template).replace(/`/g, '\\`')}\\n\`;`;
              }
            }
            const indentedPrintCode = '  '.repeat(indentLevel) + printCode;
            printStatements.push(indentedPrintCode);
          }
        }
        
        if (this.currentIndentLevel === 0) {
          this.printOutputs.push(printCode);
        }
        
        // Don't generate a separate variable assignment since PRINT nodes 
        // are handled specially and don't need additional const declarations
        // The print statement itself is what matters for loop/conditional bodies
      } else {
        // Generate code normally for non-print nodes
        const code = this.generateNodeCode(node);
        if (code) {
          // Apply indentation to each line of generated code
          const indentedCode = code.split('\n').map(line => {
            if (!line.trim()) return line;
            return '  '.repeat(indentLevel) + line;
          }).join('\n');
          codeLines.push(indentedCode);
        }
      }
      
      // Restore previous indent level
      this.currentIndentLevel = savedIndentLevel;
      
      // Follow flow connections (but not flow-then/flow-else/flow-loop which are handled by conditionals and repeats)
      const flowEdges = this.edges.filter(e => 
        e.source === nodeId && 
        (e.sourceHandle === 'flow-bottom' || e.sourceHandle === 'flow-top') &&
        (e.targetHandle === 'flow-top' || e.targetHandle === 'flow-bottom')
      );
      
      flowEdges.forEach(edge => {
        processNode(edge.target);
      });
    };
    
    processNode(branchNodeId);
    
    return {
      code: codeLines.join('\n'),
      printStatements
    };
  }

  private generateNodeCode(node: FlowNode): string {
    if (node.type === 'FUNCTION') {
      // Extract function name from the node data
      const functionName = node.data.inputs?.['name']?.value;
      if (functionName && typeof functionName === 'string' && functionName.trim() !== 'Untitled Function') {
        const trimmedName = functionName.trim();
        if (trimmedName.includes(' ')) {
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
        this.generateFunctionCode(templateName, true);

        const templateParams = this.getTemplateParams(templateName);
        const nodeInputs = nodeUtils.getFlowNode(this.nodes, node.id)?.data.inputs;
        const connectedInputs = this.getNodeInputVarNames(node.id); 
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
          if (paramName !== 'apiKey' && paramName !== 'network') {
            if (connectedInputs[paramName]) {
              parameters[paramName] = connectedInputs[paramName];
            } else if (nodeInputs && nodeInputs[paramName]) {
              parameters[paramName] = nodeInputs[paramName].value;
            }
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

      case 'SOLANA': {
        const templateName = node.data.inputs?.['function']?.value || '';
        if (!templateName || typeof templateName !== 'string') return '';
        
        const template = this.templates[templateName];
        if (!template) return '';

        const templateParams = this.getTemplateParams(templateName);
        const nodeInputs = nodeUtils.getFlowNode(this.nodes, node.id)?.data.inputs;
        const connectedInputs = this.getNodeInputVarNames(node.id); 
        const parameters: Record<string, any> = {};
        
        templateParams.forEach(param => {
          const paramName = param.name;
          if (paramName !== 'connection') {
            if (connectedInputs[paramName]) {
              parameters[paramName] = connectedInputs[paramName];
            } else if (nodeInputs && nodeInputs[paramName]) {
              parameters[paramName] = nodeInputs[paramName].value;
            }
          }
        });

        if (this.isGeneratingDisplayCode) {
          // For display code, generate direct function call and add import
          const functionName = this.setFunctionImport(template);
          
          // Add connection parameter for display code
          const displayParameters = { connection: 'connection', ...parameters };
          const paramsString = Object.entries(displayParameters)
            .map(([key, value]) => this.formatParam(key, value))
            .join(', ');

          return `const ${varName} = await ${functionName}({ ${paramsString} });`;
        } else {
          // For function code, use executeSolanaOperation - do NOT inject function code
          // since executeSolanaOperation handles dynamic imports correctly
          const paramsString = Object.entries(parameters)
            .map(([key, value]) => this.formatParam(key, value))
            .join(', ');

          let code = `const ${varName} = await executeSolanaOperation('${templateName}', { ${paramsString} });`;
          
          // Add updateNodeOutput call for tracking results
          code += `\nif (${varName}.success && ${varName}.data) {`;
          code += `\n  updateNodeOutput(${JSON.stringify(node.id)}, ${varName}.data);`;
          code += `\n} else {`;
          code += `\n  updateNodeOutput(${JSON.stringify(node.id)}, ${varName});`;
          code += `\n}`;

          return code;
        }
      }

      case 'MINT': {        
        const name = node.data.inputs?.['name']?.value || '';
        const symbol = node.data.inputs?.['symbol']?.value || '';
        const description = node.data.inputs?.['description']?.value || '';
        const image = node.data.inputs?.['image']?.value || '';
        const supply = node.data.inputs?.['supply']?.value || 1000000000;

        if (this.isGeneratingDisplayCode) {
           // For display code, generate direct function call and add import
           this.setFunctionImport(null, 'mintToken', '@opensol/blockchain/mint/mintToken');
           this.setFunctionImport(null, 'createFileFromUrl', '@opensol/utils/createFileFromUrl');
           this.setFunctionImport(null, 'uploadImageToPinata', '@opensol/ipfs/uploadImageToPinata');
           this.setFunctionImport(null, 'uploadMetadataToPinata', '@opensol/ipfs/uploadMetadataToPinata');
           
           let code = [
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
            `let finalMetadataUri_${varName} = null;`,
            `let metadataUploadAttempted_${varName} = false;`,
            `if (!metadataUploadAttempted_${varName}) {`,
            `  metadataUploadAttempted_${varName} = true;`,
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
            `    finalMetadataUri_${varName} = "";`,
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
            `  ${JSON.stringify(node.id || '')}`,
            `);`
          ].join('\n');

          return code;
        } else {
          // For function code, use executeSolanaOperation
          let code = [
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
            `let finalMetadataUri_${varName} = null;`,
            `let metadataUploadAttempted_${varName} = false;`,
            `if (!metadataUploadAttempted_${varName}) {`,
            `  metadataUploadAttempted_${varName} = true;`,
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
            `    finalMetadataUri_${varName} = "";`,
            `  }`,
            `}`,
            ``,
            `const ${varName} = await executeSolanaOperation('mintToken', {`,
            `  name: ${JSON.stringify(name)},`,
            `  symbol: ${JSON.stringify(symbol)},`, 
            `  description: ${JSON.stringify(description)},`, 
            `  imageUri: finalImageUrl_${varName},`,
            `  decimals: 9,`, 
            `  supply: ${supply},`, 
            `  metadataUri: finalMetadataUri_${varName},`,
            `  nodeId: ${JSON.stringify(node.id || '')},`,
            `}, { requiresSigning: true });`
          ].join('\n');

          code += `\nif (${varName}.success && ${varName}.data) {`;
          code += `\n  updateNodeOutput(${JSON.stringify(node.id)}, ${varName}.data);`;
          code += `\n}`;

          return code;
        }
      }

      case 'TRANSFER': {
        const tokenAddress = node.data.inputs?.['tokenAddress']?.value || '';
        const amount = node.data.inputs?.['amount']?.value || '';
        const recipient = node.data.inputs?.['recipient']?.value || '';

        if (this.isGeneratingDisplayCode) {
          // For display code, generate direct function call and add import
          this.setFunctionImport(null, 'transferToken', '@opensol/blockchain/transfer/transferToken');
          
          let code = [
            `const ${varName} = await transferToken(`,
            `  ${JSON.stringify(tokenAddress)},`,
            `  ${JSON.stringify(amount)},`,
            `  ${JSON.stringify(recipient)},`,
            `  ${JSON.stringify(node.id || '')}`,
            `);`
          ].join('\n');

          return code;
        } else {
          // For function code, use executeSolanaOperation
          let code = [
            `const ${varName} = await executeSolanaOperation('transferToken', {`,
            `  tokenAddress: ${JSON.stringify(tokenAddress)},`, 
            `  amount: ${JSON.stringify(amount)},`, 
            `  recipientAddress: ${JSON.stringify(recipient)},`,
            `  nodeId: ${JSON.stringify(node.id || '')},`,
            `}, { requiresSigning: true });`
          ].join('\n');

          code += `\nif (${varName}.success && ${varName}.data) {`;
          code += `\n  updateNodeOutput(${JSON.stringify(node.id)}, ${varName}.data);`;
          code += `\n}`;

          return code;
        }
      }

      case 'STRING': {
        return `const ${varName} = ${JSON.stringify(node.data.inputs?.['value']?.value || '')};`;
      }

      case 'PRINT': {
        const dataInputs = this.getNodeInputVarNames(node.id);
        
        // Check if this node already has a variable name assigned (from loop/conditional processing)
        let printVarName = this.nodeOutputVarNames.get(node.id);
        if (!printVarName) {
          printVarName = this.getNextVarName(node.type);
          this.nodeOutputVarNames.set(node.id, printVarName);
        }
        
        // Check for flow connection
        const flowEdge = this.edges.find(e => 
          e.target === node.id && 
          (e.targetHandle === 'flow-top' || e.targetHandle === 'flow-bottom')
        );
        
        let template: string = '';
        let isTemplateConnected = false;
        
        if (dataInputs['template']) {
          isTemplateConnected = true;
          template = dataInputs['template'];
        } else {
          template = String(node.data.inputs?.['template']?.value || '');
        }
        
        let printCode = '';
        if (flowEdge) {
          const flowSourceVar = this.nodeOutputVarNames.get(flowEdge.source);
          if (flowSourceVar) {
            const sourceType = this.getNodeOutputType(flowEdge.source);
            let outputExpr = '';
            
            switch (sourceType) {
              case 'object':
                outputExpr = `JSON.stringify(${flowSourceVar}, null, 2)`;
                break;
              case 'string':
              case 'number':
              case 'boolean':
                outputExpr = `String(${flowSourceVar})`;
                break;
              case 'string[]':
              case 'number[]':
              case 'boolean[]':
                outputExpr = `JSON.stringify(${flowSourceVar})`;
                break;
              default:
                outputExpr = `(typeof ${flowSourceVar} === 'object' ? JSON.stringify(${flowSourceVar}, null, 2) : String(${flowSourceVar}))`;
            }
            
            // Handle template replacement
            if (isTemplateConnected) {
              printCode = `printOutput += \`\${${template}.replace(/\\$output\\$/g, ${outputExpr})}\\n\`;`;
            } else {
              // Template is a literal string
              if (template.includes('$output$')) {
                const formattedTemplate = template.replace(/\$output\$/g, `\${${outputExpr}}`).replace(/`/g, '\\`');
                printCode = `printOutput += \`${formattedTemplate}\\n\`;`;
              } else {
                printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
              }
            }
          } else {
            // Fallback if no flow source variable found
            printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
          }
        } else {
          // No flow connection, check for data input connections
          const inputVar = Object.values(dataInputs)[0];
          if (inputVar) {
            // Generate the print statement
            printCode = this.generatePrintCode(node, inputVar);
          } else {
            // Handle print node with no input connections (direct template value)
            if (isTemplateConnected) {
              printCode = `printOutput += \`\${${template}}\\n\`;`;
            } else {
              if (typeof template === 'string') {
                if (!template.includes('$output$')) {
                  printCode = `printOutput += \`${template.replace(/`/g, '\\`')}\\n\`;`;
                } else {
                  printCode = `printOutput += \`${template.replace(/\$output\$/g, `\${String(${printVarName})}`).replace(/`/g, '\\`')}\\n\`;`;
                }
              } else {
                printCode = `printOutput += \`${String(template).replace(/`/g, '\\`')}\\n\`;`;
              }
            }
          }
        }
        
        if (this.currentIndentLevel === 0) {
          this.printOutputs.push(printCode);
        }
        
        const templateVar = isTemplateConnected ? template : `"${template}"`;
        return `const ${printVarName} = ${templateVar};`;
      }

      case 'CONDITIONAL': {
        const inputs = this.getNodeInputVarNames(node.id);
        const nodeInputs = node.data.inputs;
        
        // Get the three inputs: x, operator, y and their types
        const xInput = inputs['x'];
        const yInput = inputs['y'];
        const xValue = xInput || String(nodeInputs?.['x']?.value || '');
        const operator = nodeInputs?.['operator']?.value || '>';
        const yValue = yInput || String(nodeInputs?.['y']?.value || '');
        const xType = nodeInputs?.['x']?.type as InputValueTypeString || 'string';
        const yType = nodeInputs?.['y']?.type as InputValueTypeString || 'string';
        
        const convertValue = (value: any, type: InputValueTypeString, isConnected: boolean): string => {
          if (isConnected) {
            switch (type) {
              case 'number':
                return `Number(${value})`;
              case 'boolean':
                return `Boolean(${value})`;
              case 'object':
                return `(typeof ${value} === 'object' ? ${value} : JSON.parse(String(${value})))`;
              default:
                return `String(${value})`;
            }
          } else {
            const stringValue = String(value || '');
            switch (type) {
              case 'number':
                const numValue = Number(stringValue);
                return isNaN(numValue) ? '0' : String(numValue);
              case 'boolean':
                return String(stringValue === 'true' || stringValue === 'true');
              case 'object':
                try {
                  return JSON.stringify(stringValue ? JSON.parse(stringValue) : {});
                } catch {
                  return JSON.stringify({});
                }
              default:
                return JSON.stringify(stringValue);
            }
          }
        };
        
        // Convert values based on their types
        const xConverted = convertValue((xInput || String(xValue)) as any, xType, !!xInput);
        const yConverted = convertValue((yInput || String(yValue)) as any, yType, !!yInput);
        
        // Build the condition expression based on the operator
        let conditionExpression: string;
        
        switch (operator) {
          case 'includes':
            conditionExpression = `${xConverted} && ${xConverted}.includes && ${xConverted}.includes(${yConverted})`;
            break;
          case 'startsWith':
            conditionExpression = `${xConverted} && ${xConverted}.startsWith && ${xConverted}.startsWith(${yConverted})`;
            break;
          case 'endsWith':
            conditionExpression = `${xConverted} && ${xConverted}.endsWith && ${xConverted}.endsWith(${yConverted})`;
            break;
          case '&&':
            conditionExpression = `(${xConverted}) && (${yConverted})`;
            break;
          case '||':
            conditionExpression = `(${xConverted}) || (${yConverted})`;
            break;
          default:
            // Standard comparison operators: >, <, >=, <=, ===, !==
            conditionExpression = `${xConverted} ${operator} ${yConverted}`;
        }

        // Find connected nodes for then/else branches
        const thenEdges = this.edges.filter(e => e.source === node.id && e.sourceHandle === 'flow-then');
        const elseEdges = this.edges.filter(e => e.source === node.id && e.sourceHandle === 'flow-else');
        
        // Generate code with proper if/else blocks and flow path processing
        const conditionStr = conditionExpression.includes('&&') || conditionExpression.includes('||') 
          ? `(${conditionExpression})` 
          : conditionExpression;
        
        let codeLines = [`let ${varName};`];
        
        if (thenEdges.length > 0 || elseEdges.length > 0) {
          codeLines.push(`if (${conditionStr}) {`);
          
          // Process then branch
          if (thenEdges.length > 0) {
            const thenNodeId = thenEdges[0].target;
            const { code: thenCode, printStatements: thenPrintStatements } = this.generateConditionalBranchCode(thenNodeId, this.currentIndentLevel + 1);
            
            if (thenCode) {
              codeLines.push(thenCode);
            }
            
            // Add print statements
            thenPrintStatements.forEach(printStmt => {
              codeLines.push(printStmt);
            });
            
            // Find the result variable from the then branch
            const thenVarMatch = thenCode.match(/(?:const|let)\s+(\w+)/);
            if (thenVarMatch) {
              codeLines.push(`  ${varName} = ${thenVarMatch[1]};`);
            } else {
              codeLines.push(`  ${varName} = true;`);
            }
          } else {
            codeLines.push(`  ${varName} = true;`);
          }
          
          codeLines.push(`} else {`);
          
          // Process else branch
          if (elseEdges.length > 0) {
            const elseNodeId = elseEdges[0].target;
            const { code: elseCode, printStatements: elsePrintStatements } = this.generateConditionalBranchCode(elseNodeId, this.currentIndentLevel + 1);
            
            if (elseCode) {
              codeLines.push(elseCode);
            }
            
            // Add print statements
            elsePrintStatements.forEach(printStmt => {
              codeLines.push(printStmt);
            });
            
            // Find the result variable from the else branch
            const elseVarMatch = elseCode.match(/(?:const|let)\s+(\w+)/);
            if (elseVarMatch) {
              codeLines.push(`  ${varName} = ${elseVarMatch[1]};`);
            } else {
              codeLines.push(`  ${varName} = false;`);
            }
          } else {
            codeLines.push(`  ${varName} = false;`);
          }
          
          codeLines.push(`}`);
        } else {
          // If no connected nodes, just evaluate the condition
          codeLines.push(`${varName} = Boolean(${conditionStr});`);
        }
        
        let code = codeLines.join('\n');
        
        // Only add updateNodeOutput call when generating function code (not display code)
        if (!this.isGeneratingDisplayCode) {
          code += `\nupdateNodeOutput(${JSON.stringify(node.id)}, { condition: Boolean(${conditionStr}), result: ${varName} });`;
        }
        
        return code;
      }

      case 'REPEAT': {
        const inputs = this.getNodeInputVarNames(node.id);
        const nodeInputs = node.data.inputs;
        
        const loopType = nodeInputs?.['loopType']?.value || 'for';
        const iteratorName = nodeInputs?.['iteratorName']?.value || 'i';
        
        let loopHeader = '';
        let arrayVar = '';
        
        if (loopType === 'for') {
          const countInput = inputs['count'];
          const countValue = countInput || String(nodeInputs?.['count']?.value || '10');
          const countConverted = countInput ? `Number(${countInput})` : Number(countValue);
          
          loopHeader = `for (let ${iteratorName} = 0; ${iteratorName} < ${countConverted}; ${iteratorName}++)`;
        } else {
          const arrayInput = inputs['array'];
          let arrayValue = arrayInput || String(nodeInputs?.['array']?.value || '[]');
          
          if (arrayInput) {
            arrayVar = `${varName}_array`;
            loopHeader = `const ${arrayVar} = Array.isArray(${arrayInput}) ? ${arrayInput} : JSON.parse(String(${arrayInput}) || '[]');\n`;
            loopHeader += `for (const ${iteratorName} of ${arrayVar})`;
          } else {
            try {
              const parsedArray = JSON.parse(arrayValue);
              if (Array.isArray(parsedArray)) {
                arrayVar = `${varName}_array`;
                loopHeader = `const ${arrayVar} = ${JSON.stringify(parsedArray)};\n`;
                loopHeader += `for (const ${iteratorName} of ${arrayVar})`;
              } else {
                throw new Error('Not an array');
              }
            } catch {
              // Fallback: treat as string and try to parse at runtime
              arrayVar = `${varName}_array`;
              loopHeader = `const ${arrayVar} = JSON.parse(${JSON.stringify(arrayValue)} || '[]');\n`;
              loopHeader += `for (const ${iteratorName} of ${arrayVar})`;
            }
          }
        }
        
        // Find connected nodes for loop body
        const loopEdges = this.edges.filter(e => e.source === node.id && e.sourceHandle === 'flow-loop');
        
        let codeLines = [`let ${varName} = [];`];
        
        if (loopEdges.length > 0) {
          if (arrayVar) {
            codeLines.push(loopHeader.split('\n')[0]); 
            codeLines.push(loopHeader.split('\n')[1] + ' {'); 
          } else {
            codeLines.push(loopHeader + ' {');
          }
          
          const loopBodyNodeId = loopEdges[0].target;
          const { code: loopBodyCode, printStatements: loopPrintStatements } = this.generateConditionalBranchCode(loopBodyNodeId, this.currentIndentLevel + 1);
          
          if (loopBodyCode) {
            codeLines.push(loopBodyCode);
          }
          
          // Add print statements
          loopPrintStatements.forEach(printStmt => {
            codeLines.push(printStmt);
          });
          
          const loopBodyNode = this.nodes.find(n => n.id === loopBodyNodeId);
          if (loopBodyNode && loopBodyNode.type !== 'PRINT') {
            const loopVarMatch = loopBodyCode.match(/(?:const|let)\s+(\w+)/);
            if (loopVarMatch) {
              codeLines.push(`  ${varName}.push(${loopVarMatch[1]});`);
            } else {
              codeLines.push(`  ${varName}.push(${iteratorName});`);
            }
          } else {
            codeLines.push(`  ${varName}.push(${iteratorName});`);
          }
          
          codeLines.push(`}`);
        } else {
          if (loopType === 'for') {
            const countInput = inputs['count'];
            const countValue = countInput || String(nodeInputs?.['count']?.value || '10');
            const countConverted = countInput ? `Number(${countInput})` : Number(countValue);
            codeLines.push(`for (let ${iteratorName} = 0; ${iteratorName} < ${countConverted}; ${iteratorName}++) {`);
            codeLines.push(`  ${varName}.push(${iteratorName});`);
            codeLines.push(`}`);
          } else {
            if (arrayVar) {
              codeLines.push(loopHeader.split('\n')[0]); // Array declaration
              codeLines.push(loopHeader.split('\n')[1] + ' {'); // Loop start
            } else {
              codeLines.push(loopHeader + ' {');
            }
            codeLines.push(`  ${varName}.push(${iteratorName});`);
            codeLines.push(`}`);
          }
        }
        
        let code = codeLines.join('\n');
        
        if (!this.isGeneratingDisplayCode) {
          code += `\nupdateNodeOutput(${JSON.stringify(node.id)}, ${varName});`;
        }
        
        return code;
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
      functionBodies = Array.from(this.injectedFunctions.values()).join('\n\n');
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
      `async function ${this.functionName}Function() {`,
      defineApiKey,
      `  let printOutput = '';`,
      `  NODE_CODE_HERE`,
      ``,
      `  PRINT_OUTPUT_HERE`,
      ``,
      `  if (printOutput === '') {`,
      `    return "No output to print";`,
      `  }`,
      `  return printOutput;`,
      `}`
    ].filter(line => line !== '');
    
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
    this.functionName = 'execute';
    this.printOutputs = [];
    this.injectedFunctions.clear();
    this.imports = [];
    this.processedNodes.clear(); 
    this.currentIndentLevel = 0; 

    const rootNodes = this.nodes.filter(node => !this.edges.some(edge => edge.target === node.id));
    if (rootNodes.length === 0) {
      throw new Error('No root nodes found in flow');
    }

    const nodeCodeLines: string[] = [];
    const visited = new Set<string>();

    const visitNode = (nodeId: string) => {
      if (visited.has(nodeId) || this.processedNodes.has(nodeId)) return;
      visited.add(nodeId);

      const dataDependencies = this.edges.filter(e => 
        e.target === nodeId && 
        e.targetHandle?.startsWith('input-') &&
        !['flow-then', 'flow-else', 'flow-loop'].includes(e.sourceHandle || '')
      );
      
      dataDependencies.forEach(edge => {       
        const isInConditionalBranch = this.edges.some(e => 
          e.target === nodeId && (e.sourceHandle === 'flow-then' || e.sourceHandle === 'flow-else')
        );
        
        const isInLoopBranch = this.edges.some(e => 
          e.target === nodeId && e.sourceHandle === 'flow-loop'
        );
        
        if (!isInConditionalBranch && !isInLoopBranch) {
          visitNode(edge.source);
        }
      });

      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found.`);
      }
      const code = this.generateNodeCode(node);
      if (code) {
        nodeCodeLines.push(code);
      }

      this.edges
        .filter(e => e.source === nodeId && !['flow-then', 'flow-else', 'flow-loop'].includes(e.sourceHandle || ''))
        .forEach(e => visitNode(e.target));
    };

    rootNodes.forEach(n => visitNode(n.id));

    const indentedNodeCode = nodeCodeLines
      .map(code => {
        if (!code.trim()) return '';
        
        const lines = code.split('\n');
        
        return lines
          .map((line, i) => {
            if (!line.trim()) return line;
            return i === 0 ? `  ${line.trim()}` : `    ${line}`;
          })
          .join('\n');
      })
      .filter(Boolean)
      .join('\n\n');

    const printLinesJoined = this.printOutputs.map(line => `  ${line}`).join('\n');

    // Add imports based on whether we're generating display code or function code
    if (this.nodes.some(n => n.type === 'MINT' || n.type === 'TRANSFER' || n.type === 'SOLANA')) {
      if (!this.isGeneratingDisplayCode) {
        // For function code, add executeSolanaOperation
        this.imports.push({ 
          importName: 'executeSolanaOperation', 
          importPath: '@opensol/hooks/useSolanaOperations'
        });
      }
      
      // Always add these utility imports when MINT/TRANSFER nodes are present
      if (this.nodes.some(n => n.type === 'MINT' || n.type === 'TRANSFER')) {
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
    }

    const savedNoImports = this.noImports;
    this.noImports = true;
    this.isGeneratingDisplayCode = false; 
    const functionCodeRaw = this.generateFinalCode(true, false);
    const functionCode = functionCodeRaw
      .replace('NODE_CODE_HERE', indentedNodeCode)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);

    // Clear imports for display code generation
    this.imports = [];
    this.noImports = false;
    this.isGeneratingDisplayCode = true; 
    this.nodeOutputVarNames.clear();
    this.typeCounters = {};
    this.processedNodes.clear(); 
    this.currentIndentLevel = 0; 
    const savedPrintOutputs = [...this.printOutputs]; 
    this.printOutputs = [];
    
    const displayNodeCodeLines: string[] = [];
    visited.clear();
    
    const visitNodeForDisplay = (nodeId: string) => {
      if (visited.has(nodeId) || this.processedNodes.has(nodeId)) return;
      visited.add(nodeId);

      const dataDependencies = this.edges.filter(e => 
        e.target === nodeId && 
        e.targetHandle?.startsWith('input-') &&
        !['flow-then', 'flow-else', 'flow-loop'].includes(e.sourceHandle || '')
      );
      
      dataDependencies.forEach(edge => {
        const isInConditionalBranch = this.edges.some(e => 
          e.target === nodeId && (e.sourceHandle === 'flow-then' || e.sourceHandle === 'flow-else')
        );
        
        const isInLoopBranch = this.edges.some(e => 
          e.target === nodeId && e.sourceHandle === 'flow-loop'
        );
        
        if (!isInConditionalBranch && !isInLoopBranch) {
          visitNodeForDisplay(edge.source);
        }
      });

      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found.`);
      }
      const code = this.generateNodeCode(node);
      if (code) {
        displayNodeCodeLines.push(code);
      }

      // Visit child nodes, but skip nodes connected via flow-then/flow-else 
      // (they are processed within conditional blocks)
      this.edges
        .filter(e => e.source === nodeId && !['flow-then', 'flow-else', 'flow-loop'].includes(e.sourceHandle || ''))
        .forEach(e => visitNodeForDisplay(e.target));
    };

    rootNodes.forEach(n => visitNodeForDisplay(n.id));
    
    const displayNodeCodeJoined = displayNodeCodeLines
      .map(code => {
        // For empty code, return nothing
        if (!code.trim()) return '';
        
        const lines = code.split('\n');
        return lines
          .map((line, i) => {
            if (!line.trim()) return line;
            return i === 0 ? `  ${line}` : `    ${line}`;
          })
          .join('\n');
      })
      .filter(Boolean)
      .join('\n\n');
    
    const displayCodeRaw = this.generateFinalCode(false, true);
    const displayCode = displayCodeRaw
      .replace('NODE_CODE_HERE', displayNodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', savedPrintOutputs.join('\n')); 
    
    this.noImports = savedNoImports;

    const wrappedFunctionCode = `
${functionCode}
return { execute: ${this.functionName}Function, FlowCompilerOutput: ${this.functionName}Function };
`;
    
    console.log('=== GENERATED FUNCTION CODE ===');
    console.log(functionCode);
    console.log('=== GENERATED DISPLAY CODE ===');
    console.log(displayCode);
    console.log('=== WRAPPED FUNCTION CODE ===');
    console.log(wrappedFunctionCode);
    console.log('=== END GENERATED CODE ===');
    
    let runtimeFn;
    try {
      runtimeFn = new Function(wrappedFunctionCode)() as {
        execute: () => Promise<any>;
        FlowCompilerOutput: () => Promise<any>;
      };
    } catch (error) {
      console.error('=== COMPILATION ERROR ===');
      console.error('Error:', error);
      console.error('=== PROBLEMATIC CODE ===');
      console.error(wrappedFunctionCode);
      console.error('=== END ERROR DEBUG ===');
      throw error;
    }
    
    return {
      functionName: this.functionName,
      execute: runtimeFn.execute,
      functionCode,
      displayCode
    };
  }
}
