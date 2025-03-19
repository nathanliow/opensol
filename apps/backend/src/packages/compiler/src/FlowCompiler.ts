import { FlowNode, FlowEdge } from './types';
import { BlockTemplate } from '../../../../../frontend/src/components/services/blockTemplateService';

export class FlowCompiler {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private templates: Record<string, BlockTemplate>;
  private nodeOutputs: Map<string, string> = new Map();
  private varCounter: number = 0;
  private printOutputs: string[] = [];
  private getFunctions: Map<string, string> = new Map();
  private templateToFunctionName: Map<string, string> = new Map();

  constructor(nodes: FlowNode[], edges: FlowEdge[], templates: Record<string, BlockTemplate>) {
    this.nodes = nodes;
    this.edges = edges;
    this.templates = templates;
  }

  private generateGetFunction(node: FlowNode): string {
    const templateName = node.data.selectedFunction || '';
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template not found for function: ${templateName}`);
    }

    // Check if we already have a function for this template
    let functionName = this.templateToFunctionName.get(templateName);
    if (functionName) {
      return functionName;
    }

    // Create new function name based on template name
    functionName = `${templateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Extract the function body
    const functionBody = template.execute.toString()
      .split('\n')
      .slice(1, -1)
      .join('\n');

    // Generate function code that uses params directly
    const functionCode = `async function ${functionName}(params) {
  try {
    const { address, apiKey } = params;
    console.log('Received params:', params);
    console.log('Extracted address:', address);
    console.log('Extracted apiKey:', apiKey);
    ${functionBody.replace(/const\s*{\s*address\s*,\s*apiKey\s*}\s*=\s*params\s*;/, '')}
  } catch (error) {
    console.error('Error in ${templateName}:', error);
    throw error;
  }
}`;

    this.getFunctions.set(functionName, functionCode);
    this.templateToFunctionName.set(templateName, functionName);
    return functionName;
  }

  private generateNodeCode(node: FlowNode): string {
    const varName = `result_${this.varCounter++}`;
    this.nodeOutputs.set(node.id, varName);

    switch (node.type) {
      case 'GET': {
        const functionName = this.generateGetFunction(node);
        const parameters = node.data.parameters || {};
        
        // Create parameters object including apiKey
        const paramsObj = {
          ...parameters,
          apiKey: 'HELIUS_API_KEY'
        };
        
        // Convert parameters to a string representation
        const paramsString = Object.entries(paramsObj)
          .map(([key, value]) => {
            if (value === 'HELIUS_API_KEY') {
              return `${key}: ${value}`;
            }
            return `${key}: ${JSON.stringify(value)}`;
          })
          .join(', ');

        return `const ${varName} = await ${functionName}({ ${paramsString} });`;
      }

      case 'MATH': {
        const functionName = this.generateGetFunction(node);
        const parameters = node.data.parameters || {};
        const inputs = this.getNodeInputs(node.id);
        
        // Create parameters object using connected inputs
        const paramsObj = { ...parameters };
        Object.entries(inputs).forEach(([handle, value]) => {
          if (handle.startsWith('param-')) {
            const paramName = handle.replace('param-', '');
            paramsObj[paramName] = value;
          }
        });
        
        // Convert parameters to a string representation
        const paramsString = Object.entries(paramsObj)
          .map(([key, value]) => {
            // If value is a result variable from another node, use it directly
            if (typeof value === 'string' && value.startsWith('result_')) {
              return `${key}: ${value}`;
            }
            return `${key}: ${JSON.stringify(value)}`;
          })
          .join(', ');

        return `const ${varName} = await ${functionName}({ ${paramsString} });`;
      }

      case 'STRING': {
        return `const ${varName} = ${JSON.stringify(node.data.value)};`;
      }

      case 'PRINT': {
        const inputs = this.getNodeInputs(node.id);
        const inputVar = inputs['flow'] || Object.values(inputs)[0];
        if (!inputVar) {
          throw new Error(`Print node ${node.id} has no input`);
        }
        
        // Get template from node data or use default
        const template = node.data.template || '$output$';
        
        // Add to print outputs array with template
        const formattedTemplate = template.replace(/\$output\$/g, '${' + inputVar + '}');
        this.printOutputs.push(`printOutput += \`${formattedTemplate}\n\`;`);
        
        return `const ${varName} = ${inputVar};`;
      }

      case 'LABEL': {
        const inputs = this.getNodeInputs(node.id);
        const inputVar = inputs['flow'] || Object.values(inputs)[0];
        return inputVar ? `const ${varName} = ${inputVar};` : `const ${varName} = null;`;
      }

      default:
        return '';
    }
  }

  private getNodeInputs(nodeId: string): Record<string, string> {
    const inputs: Record<string, string> = {};
    this.edges
      .filter(edge => edge.target === nodeId)
      .forEach(edge => {
        const sourceOutput = this.nodeOutputs.get(edge.source);
        if (sourceOutput) {
          inputs[edge.targetHandle || 'flow'] = sourceOutput;
        }
      });
    return inputs;
  }

  compile(): { execute: () => Promise<any>, functionCode: string, displayCode: string } {
    this.nodeOutputs.clear();
    this.varCounter = 0;
    this.printOutputs = [];
    this.getFunctions.clear();
    this.templateToFunctionName.clear();

    const rootNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.target === node.id)
    );

    if (rootNodes.length === 0) {
      throw new Error('No root nodes found in flow');
    }

    const visited = new Set<string>();
    const codeLines: string[] = [];
    const constants: Record<string, string> = {};
    const displayConstants: Record<string, string> = {};

    // Extract API keys from GET nodes
    this.nodes.forEach(node => {
      if (node.type === 'GET' && node.data?.parameters?.apiKey) {
        constants['HELIUS_API_KEY'] = JSON.stringify(node.data.parameters.apiKey);
        displayConstants['HELIUS_API_KEY'] = 'process.env.HELIUS_API_KEY';
        delete node.data.parameters.apiKey;
      }
    });

    const processNode = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      this.edges
        .filter(edge => edge.target === nodeId)
        .forEach(edge => processNode(edge.source));

      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);
      
      const code = this.generateNodeCode(node);
      if (code) {
        codeLines.push(code);
      }

      this.edges
        .filter(edge => edge.source === nodeId)
        .forEach(edge => processNode(edge.target));
    };

    rootNodes.forEach(node => processNode(node.id));

    // Generate constants section
    const constantsSection = Object.entries(constants)
      .map(([key, value]) => `const ${key} = ${value};`)
      .join('\n  ');

    const displayConstantsSection = Object.entries(displayConstants)
      .map(([key, value]) => `const ${key} = ${value};`)
      .join('\n  ');

    // Add print output collection
    const printSection = `let printOutput = '';
  ${this.printOutputs.join('\n  ')}`;

    // Combine all GET functions
    const getFunctionsSection = Array.from(this.getFunctions.values()).join('\n\n  ');

    const functionCode = `${getFunctionsSection}

async function execute() {
  ${constantsSection}
  ${codeLines.join('\n  ')}
  ${printSection}
  return { output: printOutput };
}`;

    const displayCode = `${getFunctionsSection}

async function execute() {
  ${displayConstantsSection}
  ${codeLines.join('\n  ')}
  ${printSection}
  return { output: printOutput };
}`;

    const fn = new Function(`return ${functionCode}`)();
    console.log(functionCode)
    return { 
      execute: fn,
      functionCode,
      displayCode
    };
  }
}