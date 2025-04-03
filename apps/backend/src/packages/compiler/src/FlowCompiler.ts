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

  /**
   * Helper function that formats parameters for code generation.
   * If the parameter is for "apiKey" and its value is exactly "HELIUS_API_KEY",
   * then output a variable reference (without quotes).
   */
  private formatParam(key: string, value: any): string {
    if (key === 'apiKey' && value === "HELIUS_API_KEY") {
      return `${key}: HELIUS_API_KEY`;
    }
    if (typeof value === 'string' && (value.startsWith('result_') || value.startsWith('const_'))) {
      return `${key}: ${value}`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  }

  private generateGetFunctionName(templateName: string): string {
    let functionName = this.templateToFunctionName.get(templateName);
    if (functionName) {
      return functionName;
    }
    functionName = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    this.templateToFunctionName.set(templateName, functionName);
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
    const functionName = this.generateGetFunctionName(templateName);
    const functionBody = template.execute
      .toString()
      .split('\n')
      .slice(1, -1)
      .join('\n');
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
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return 'any';

    switch (node.type) {
      case 'GET':
      case 'HELIUS': {
        const template = this.templates[node.data.selectedFunction];
        return template?.metadata?.output?.type ?? 'any';
      }
      case 'CONST': {
        return node.data.dataType || 'string';
      }
      case 'STRING': {
        return 'string';
      }
      default:
        return 'any';
    }
  }

  private validateNodeConnection(sourceId: string, targetId: string, targetParam: string): void {
    const sourceType = this.getNodeOutputType(sourceId);
    const targetNode = this.nodes.find(n => n.id === targetId);
    if (!targetNode) return;

    if (targetNode.type === 'GET' || targetNode.type === 'HELIUS') {
      const template = this.templates[targetNode.data.selectedFunction];
      if (!template) return;

      const param = template.metadata.parameters.find(p => p.name === targetParam);
      if (!param) return;

      if (sourceType !== param.type && sourceType !== 'any' && param.type !== 'any') {
        throw new Error(`Type mismatch: ${targetNode.type} node parameter '${targetParam}' expects ${param.type} but got ${sourceType} from source node`);
      }
    }
  }

  private getNodeInputs(nodeId: string): Record<string, string> {
    const inputs: Record<string, string> = {};
    const incoming = this.edges.filter(e => e.target === nodeId);

    incoming.forEach(edge => {
      const sourceVar = this.nodeOutputs.get(edge.source);
      if (sourceVar) {
        const paramName = edge.targetHandle?.startsWith('param-')
          ? edge.targetHandle.replace('param-', '')
          : edge.targetHandle || 'flow';
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

    const template = node.data.template || '';
    if (!template.includes('$output$')) {
      return `printOutput += \`${template}\\n\`;`;
    }

    const formattedTemplate = template.replace(/\$output\$/g, `\${${outputExpr}}`);
    return `printOutput += \`${formattedTemplate}\\n\`;`;
  }

  private generateNodeCode(node: FlowNode): string {
    const varName = `result_${this.varCounter++}`;
    this.nodeOutputs.set(node.id, varName);

    switch (node.type) {
      case 'GET':
      case 'HELIUS':
      case 'MATH':
      case 'MINT': {
        const templateName = node.data.selectedFunction || '';
        const functionName = this.generateGetFunctionName(templateName);
        // Generate function body if needed (for inlining)
        this.maybeGenerateFunctionBody(templateName, true);

        const parameters = { ...node.data.parameters };
        const inputs = this.getNodeInputs(node.id);
        Object.entries(inputs).forEach(([handle, value]) => {
          if (handle !== 'flow' && handle !== 'top-target' && handle !== 'bottom-source') {
            parameters[handle] = value;
          }
        });

        // For GET/HELIUS/MINT nodes, ensure the apiKey parameter is set.
        if (node.type === 'GET' || node.type === 'HELIUS' || node.type === 'MINT') {
          parameters['apiKey'] = "HELIUS_API_KEY";
        }

        const paramsString = Object.entries(parameters)
          .map(([key, value]) => this.formatParam(key, value))
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
        const printCode = this.generatePrintCode(node, inputVar);
        this.printOutputs.push(printCode);
        return `const ${varName} = ${inputVar};`;
      }

      case 'FUNCTION': {
        const inputs = this.getNodeInputs(node.id);
        const inputVar = inputs['flow'] || Object.values(inputs)[0];
        return inputVar ? `const ${varName} = ${inputVar};` : `const ${varName} = null;`;
      }

      case 'CONST': {
        const dataType = node.data.dataType || 'string';
        let formattedValue;
        if (dataType === 'number') {
          formattedValue = Number(node.data.value);
        } else if (dataType === 'boolean') {
          formattedValue = node.data.value === 'true' || node.data.value === true;
        } else {
          formattedValue = String(node.data.value);
        }
        const constName = `const_${this.varCounter++}`;
        this.nodeOutputs.set(node.id, constName);
        return `const ${constName} = ${JSON.stringify(formattedValue)};`;
      }

      default:
        return `// Node type ${node.type} is not handled yet.`;
    }
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

    const functionImports = !inlineFunctions
      ? Array.from(this.templateToFunctionName.values())
          .map(fn => `import { ${fn} } from '@opensol/templates';`)
          .join('\n')
      : '';

    let defineApiKey = '';
    if (hideApiKey) {
      defineApiKey = `const HELIUS_API_KEY = process.env.HELIUS_API_KEY;`;
    } else {
      const userKeyNode = this.nodes.find(n => {
        if ((n.type === 'GET' || n.type === 'HELIUS') && n.data?.parameters?.apiKey) {
          return true;
        }
        return false;
      });
      if (userKeyNode) {
        const providedKey = userKeyNode.data.parameters.apiKey;
        defineApiKey = `const HELIUS_API_KEY = ${JSON.stringify(providedKey)};`;
      } else {
        defineApiKey = `const HELIUS_API_KEY = process.env.HELIUS_API_KEY;`;
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
    this.templateToFunctionName.clear();

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

    // Generate inline function code (actual key shown)
    const functionCodeRaw = this.generateFinalCode(true, false);
    const functionCode = functionCodeRaw
      .replace('NODE_CODE_HERE', nodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);

    // Generate display code (helper functions imported, API key hidden)
    const displayCodeRaw = this.generateFinalCode(false, true);
    const displayCode = displayCodeRaw
      .replace('NODE_CODE_HERE', nodeCodeJoined)
      .replace('PRINT_OUTPUT_HERE', printLinesJoined);

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
    return {
      execute: runtimeFn.execute,
      functionCode,
      displayCode
    };
  }
}
