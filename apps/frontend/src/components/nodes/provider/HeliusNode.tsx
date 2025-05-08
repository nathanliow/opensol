import { useCallback, useState, useMemo } from 'react';
import { useEdges, useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { useConfig } from '../../../contexts/ConfigContext';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';

interface HeliusNodeProps {
  id: string;
}

export default function HeliusNode({ id }: HeliusNodeProps) {
  const { setNodes } = useReactFlow();
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const blockFunctionTemplates = blockTemplateService.getTemplatesByType('HELIUS');
  const edges = useEdges();
  const nodes = useNodes();
  const { network, getApiKey } = useConfig();

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    const newParameters: Record<string, string> = { 
      network: network || 'devnet'  
    }; 
    setParameters(newParameters);

    // Update node data
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
    // Extract the actual parameter name
    const paramMatch = inputId.match(/^input-(.+)$/);
    if (paramMatch) {
      const actualParamName = paramMatch[1];
      
      const newParameters: Record<string, string> = { 
        ...parameters, 
        network: network || 'devnet',
        [actualParamName]: value
      };
      
      setParameters(newParameters);
      
      // Update node data using nodeUtils
      nodeUtils.updateNodeInput(id, actualParamName, inputId, 'string', value, setNodes);
    }
  }, [parameters, network, id, setNodes]);

  // Convert function options into dropdown options
  const functionOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Function' },
      ...blockFunctionTemplates.map(functionTemplate => ({
        value: functionTemplate.metadata.name,
        label: functionTemplate.metadata.name
      }))
    ];
  }, [blockFunctionTemplates]);

  // Create dynamic inputs based on selected function
  const inputs: InputDefinition[] = useMemo(() => {
    // Base function dropdown
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
      const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (functionTemplate) {
        const paramInputs = functionTemplate.metadata.parameters
          .filter(param => param.name !== 'apiKey' && param.name !== 'network')
          .map(param => {
            return createInputDefinition.text({
              id: `input-${param.name}`,
              label: param.name,
              defaultValue: parameters[param.name] || '',
              description: param.description,
              getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, param.name),
              handleId: `input-${param.name}`,
            });
          });
          
        return [...baseInputs, ...paramInputs];
      }
    }
    
    return baseInputs;
  }, [blockFunctionTemplates, selectedFunction, parameters, functionOptions, edges, nodes, id]);

  // Get output type from selected template
  const output: OutputDefinition = useMemo(() => {
    if (selectedFunction) {
      const functionTemplate = blockFunctionTemplates.find(t => t.metadata.name === selectedFunction);
      if (functionTemplate?.metadata.output) {
        return {
          id: 'output',
          label: 'Result',
          type: functionTemplate.metadata.output.type as any,
          description: functionTemplate.metadata.output.description
        };
      }
    }
    return {
      id: 'output',
      label: 'Result',
      type: 'object',
      description: 'Helius API result'
    };
  }, [selectedFunction, blockFunctionTemplates]);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['HELIUS'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value, fromConnection) => {
        if (inputId === 'input-function') {
          handleFunctionChange(value);
        } else {
          handleParameterChange(inputId, value, fromConnection);
        }
      }}
      output={output}
    />
  );
}
