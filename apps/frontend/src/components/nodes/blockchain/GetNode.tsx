import { useCallback, useState, useMemo } from 'react';
import { useEdges, useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { useConfig } from '../../../contexts/ConfigContext';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface GetNodeProps {
  id: string;
}

export default function GetNode({ id }: GetNodeProps) {
  const { setNodes } = useReactFlow();
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const blockFunctionTemplates = blockTemplateService.getTemplatesByType('GET');
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  const { network } = useConfig();
  
  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    const newParameters: Record<string, string> = { 
      network: network || 'devnet' 
    }; 
    setParameters(newParameters);
    
    nodeUtils.updateNodeInput(id, 'function', 'input-function', 'string', value, setNodes);
    nodeUtils.updateNodeInput(id, 'network', 'input-network', 'string', network || 'devnet', setNodes);
    const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === value);
    if (functionTemplate) {
      functionTemplate.metadata.parameters.forEach((param) => {
        if (param.name !== 'apiKey' && param.name !== 'network') {
          nodeUtils.updateNodeInput(id, param.name, `input-${param.name}`, 'string', '', setNodes);
        }
      });
    }
  }, [network, id, setNodes, blockFunctionTemplates]);

  const handleParameterChange = useCallback((inputId: string, value: string, fromConnection: boolean = false) => {
    // Extract parameter name from input ID (remove 'input-' prefix)
    const paramName = inputId.replace('input-', '');
    
    const newParameters: Record<string, string> = { 
      ...parameters, 
      network: network || 'devnet', 
      [paramName]: value
    };
    setParameters(newParameters);
    
    // Update node data using nodeUtils
    nodeUtils.updateNodeInput(id, paramName, inputId, 'string', value, setNodes);
  }, [parameters, network, id, setNodes]);

  // Convert function options into dropdown options
  const functionOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Function' },
      ...blockFunctionTemplates.map(template => ({
        value: template.metadata.name,
        label: template.metadata.name
      }))
    ];
  }, [blockFunctionTemplates]);

  const inputs: InputDefinition[] = useMemo(() => {
    const baseInputs: InputDefinition[] = [
      createInputDefinition.dropdown({
        id: 'input-function',
        label: 'Function',
        options: functionOptions,
        defaultValue: selectedFunction,
        searchable: true
      })
    ];
    
    if (selectedFunction) {
      const template = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (template) {
        const paramInputs: InputDefinition[] = template.metadata.parameters
          .filter(param => param.name !== 'apiKey' && param.name !== 'network')
          .map(param => {
            const connectionGetter = nodeUtils.createConnectionGetter(edges, nodes, id, param.name);
            
            return createInputDefinition.text({
              id: param.name,
              label: param.name,
              defaultValue: parameters[param.name] || '',
              description: param.description,
              getConnectedValue: connectionGetter,
              handleId: `input-${param.name}`,
            });
          });
          
        return [...baseInputs, ...paramInputs];
      }
    }
    
    return baseInputs;
  }, [blockFunctionTemplates, selectedFunction, parameters, edges, nodes, id, functionOptions]);

  // Get output type from selected template
  const output: OutputDefinition = useMemo(() => {
    if (selectedFunction) {
      const template = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (template?.metadata.output) {
        return {
          id: 'output',
          label: 'Result',
          type: template.metadata.output.type as any,
          description: template.metadata.output.description
        };
      }
    }
    return {
      id: 'output',
      label: 'Result',
      type: 'object',
      description: 'Blockchain data output'
    };
  }, [selectedFunction, blockFunctionTemplates]);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['GET'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-function') {
          handleFunctionChange(value);
        } else {
          handleParameterChange(inputId, value);
        }
      }}
      output={output}
    />
  );
}