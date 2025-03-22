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
  private functionCode: string | undefined;

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
        const { address, apiKey, network } = params;
        ${functionBody.replace(/const\s*{\s*address\s*,\s*apiKey\s*,\s*network\s*}\s*=\s*params\s*;/, '')}
      } catch (error) {
        console.error('Error in ${templateName}:', error);
        throw error;
      }
    }`;

    this.getFunctions.set(functionName, functionCode);
    this.templateToFunctionName.set(templateName, functionName);
    return functionName;
  }

  private getNodeOutputType(nodeId: string): string {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return 'any';

    switch (node.type) {
      case 'GET':
      case 'HELIUS': {
        const template = this.templates[node.data.selectedFunction];
        return template?.metadata.output?.type || 'any';
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
    const edges = this.edges.filter(e => e.target === nodeId);
    
    
    edges.forEach(edge => {
      const sourceVar = this.nodeOutputs.get(edge.source);
      
      if (sourceVar) {
        // Handle both param-* handles and regular handles like 'flow'
        const paramName = edge.targetHandle?.startsWith('param-') 
          ? edge.targetHandle.replace('param-', '')
          : (edge.targetHandle || 'flow');
        
        inputs[paramName] = sourceVar;
      }
    });
    
    return inputs;
  }

  private generatePrintCode(node: FlowNode, inputVar: string): string {
    const sourceNodeId = this.edges.find(e => e.target === node.id)?.source;
    if (!sourceNodeId) return '';  // Don't print anything if no input

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

    // Get template, default to empty string if not set
    const template = node.data.template || '';
    
    // Only output if template contains $output$
    if (!template.includes('$output$')) {
      return `printOutput += \`${template}\\n\`;\n`;
    }
    
    // Replace $output$ in template with the actual output expression
    const formattedTemplate = template.replace(/\$output\$/g, '${' + outputExpr + '}');
    return `printOutput += \`${formattedTemplate}\\n\`;\n`;
  }

  private generateNodeCode(node: FlowNode): string {
    const varName = `result_${this.varCounter++}`;
    this.nodeOutputs.set(node.id, varName);

    switch (node.type) {
      case 'GET':
      case 'HELIUS': {
        const functionName = this.generateGetFunction(node);
        const parameters = { ...node.data.parameters };
        const inputs = this.getNodeInputs(node.id);
        
        const paramsObj = { ...parameters };
        Object.entries(inputs).forEach(([paramName, value]) => {
          // Only include param-* inputs, skip custom handles like top-target and flow
          if (paramName !== 'top-target' && paramName !== 'flow' && paramName !== 'bottom-source') {
            paramsObj[paramName] = value;
          }
        });

        // Add API key from constant
        paramsObj['apiKey'] = 'HELIUS_API_KEY';
        
        const paramsString = Object.entries(paramsObj)
          .map(([key, value]) => {
            if (key === 'apiKey') {
              return `${key}: ${value}`;
            }
            if (typeof value === 'string' && (value.startsWith('result_') || value.startsWith('const_'))) {
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
        
        // Debug Math inputs
        
        const paramsObj = { ...parameters };
        Object.entries(inputs).forEach(([handle, value]) => {
          // Extract param name from handle or use handle directly
          const paramName = handle.startsWith('param-') ? handle.replace('param-', '') : handle;
          paramsObj[paramName] = value;
        });
        
        const paramsString = Object.entries(paramsObj)
          .map(([key, value]) => {
            if (typeof value === 'string' && (value.startsWith('result_') || value.startsWith('const_'))) {
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
        
        const template = node.data.template || '';
        
        if (!template.includes('$output$')) {
          return `printOutput += \`${template}\\n\`;\n`;
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
        const value = node.data.value;
        const dataType = node.data.dataType || 'string';
        
        let formattedValue;
        switch (dataType) {
          case 'number':
            formattedValue = Number(value);
            break;
          case 'boolean':
            formattedValue = value === 'true' || value === true;
            break;
          default: 
            formattedValue = String(value);
        }

        const constName = `const_${this.varCounter}`;
        this.nodeOutputs.set(node.id, constName);
        return `const ${constName} = ${JSON.stringify(formattedValue)};`;
      }

      default:
        return '';
    }
  }

  private generateDisplayCode(): string {
    const functionNames = new Set<string>();

    this.nodes.forEach(node => {
      if (node.type === 'GET' || node.type === 'HELIUS' || node.type === 'MATH') {
        const functionName = this.generateGetFunction(node);
        functionNames.add(functionName);
      }
    });

    const importStatements = Array.from(functionNames).map(fn => 
      `import { ${fn} } from '@opensol/templates';`
    ).join('\n');

    // Extract just the execute function from the full code
    let executeFunction = this.functionCode?.split('\n\nasync function execute')[1];
    if (!executeFunction) return '';

    executeFunction = 'async function execute' + executeFunction;

    // Replace API key with env var
    executeFunction = executeFunction.replace(
      /const HELIUS_API_KEY = "[^"]+";/,
      'const HELIUS_API_KEY = process.env.HELIUS_API_KEY;'
    );

    // Replace function name if needed
    const functionNode = this.nodes.find(n => n.type === 'FUNCTION');
    if (functionNode?.data?.name) {
      const formattedFunctionName = functionNode.data.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      executeFunction = executeFunction.replace(
        'async function execute',
        `async function ${formattedFunctionName}`
      );
    }

    return `${importStatements}\n\n${executeFunction}`;
  }

  private generateExecuteFunction(): string {
    const lines: string[] = [];
    lines.push('async function execute() {');
    lines.push('  const HELIUS_API_KEY = process.env.HELIUS_API_KEY;');

    this.nodes.forEach(node => {
      const varName = `result_${this.varCounter++}`;
      this.nodeOutputs.set(node.id, varName);

      switch (node.type) {
        case 'GET':
        case 'HELIUS':
        case 'MATH': {
          const functionName = this.generateGetFunction(node);
          const parameters = node.data.parameters || {};
          const inputs = this.getNodeInputs(node.id);
          
          const paramsObj = { ...parameters };
          Object.entries(inputs).forEach(([handle, value]) => {
            const paramName = handle.startsWith('param-') ? handle.replace('param-', '') : handle;
            paramsObj[paramName] = value;
          });
          
          if (node.type === 'GET' || node.type === 'HELIUS') {
            paramsObj['apiKey'] = 'HELIUS_API_KEY';
          }
          
          const paramsString = Object.entries(paramsObj)
            .map(([key, value]) => {
              if (key === 'apiKey') {
                return `${key}: ${value}`;
              }
              if (typeof value === 'string' && (value.startsWith('result_') || value.startsWith('const_'))) {
                return `${key}: ${value}`;
              }
              return `${key}: ${JSON.stringify(value)}`;
            })
            .join(', ');

          lines.push(`  const ${varName} = await ${functionName}({ ${paramsString} });`);
          break;
        }

        case 'STRING':
          lines.push(`  const ${varName} = ${JSON.stringify(node.data.value)};`);
          break;

        case 'CONST':
          lines.push(`  const ${varName} = ${JSON.stringify(node.data.value)};`);
          break;

        case 'PRINT':
          const inputVar = this.getNodeInputs(node.id)['flow'] || 'null';
          const template = node.data.template || '$output$';
          this.printOutputs.push(this.generatePrintCode(node, inputVar));
          lines.push(`  const ${varName} = ${inputVar};`);
          break;

        default:
          lines.push(`  const ${varName} = null;`);
      }
    });

    if (this.printOutputs.length > 0) {
      lines.push('  let printOutput = \'\';');
      this.printOutputs.forEach(output => {
        lines.push(`  ${output}`);
      });
    }

    lines.push('\n  return { output: printOutput };');
    lines.push('}');

    return lines.join('\n');
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

    const getFunctionsSection = Array.from(this.getFunctions.values()).join('\n\n');

    // Store function code for use in display code generation
    this.functionCode = `${getFunctionsSection}\n\n${this.generateExecuteFunction()}`;
    
    const fn = new Function(`return ${this.functionCode}`)();
    const displayCode = this.generateDisplayCode();
    
    return { 
      execute: fn,
      functionCode: this.functionCode,
      displayCode
    };
  }
}