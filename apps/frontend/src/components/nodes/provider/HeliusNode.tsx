import { memo, useCallback, useState, useMemo } from 'react';
import { useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { useConfig } from '../../../contexts/ConfigContext';
import { OutputDefinition } from '@/types/OutputTypes';

interface HeliusNodeData {
  label: string;
  selectedFunction?: string;
  parameters?: Record<string, string>;
}

interface HeliusNodeProps {
  id: string;
  data: HeliusNodeData;
}

export default function HeliusNode({ id, data }: HeliusNodeProps) {
  const [selectedFunction, setSelectedFunction] = useState<string>(data.selectedFunction || '');
  const [parameters, setParameters] = useState<Record<string, string>>(data.parameters || {});
  const blockFunctionTemplates = blockTemplateService.getTemplatesByType('HELIUS');
  const edges = useEdges();
  const nodes = useNodes();
  const { network, getApiKey } = useConfig();

  const getConnectedValue = useCallback((paramName: string) => {
    const edge = edges.find(e => 
      e.target === id && 
      e.targetHandle === `param-${paramName}`
    );
    
    if (!edge) return null;
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) return null;
    
    return sourceNode.data.value;
  }, [edges, id, nodes]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    const newParameters = { 
      network: network || 'devnet'  
    }; 
    data.selectedFunction = value;
    data.parameters = newParameters;
  }, [network, data]);

  const handleParameterChange = useCallback((paramName: string, value: string) => {
    const newParameters = { 
      ...parameters, 
      network: network || 'devnet'  
    };
    newParameters[paramName] = value;
    setParameters(newParameters);
    data.parameters = newParameters;
  }, [parameters, network, data]);

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
            const connectionGetter = () => getConnectedValue(param.name) as string | null;
            
            return createInputDefinition.text({
              id: `input-${param.name}`,
              label: param.name,
              defaultValue: parameters[param.name] || '',
              description: param.description,
              getConnectedValue: connectionGetter,
              handleId: `param-${param.name}`,
            });
          });
          
        return [...baseInputs, ...paramInputs];
      }
    }
    
    return baseInputs;
  }, [blockFunctionTemplates, selectedFunction, parameters, getConnectedValue, functionOptions]);

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
      metadata={nodeTypesMetadata['HELIUS']}
      inputs={inputs}
      data={data}
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
