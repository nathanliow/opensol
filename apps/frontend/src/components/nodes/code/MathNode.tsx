import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { OutputDefinition } from '@/types/OutputTypes';

interface MathNodeData {
  label: string;
  selectedFunction?: string;
  parameters?: Record<string, string | number>;
}

interface MathNodeProps {
  id: string;
  data: MathNodeData;
}

export default function MathNode({ id, data }: MathNodeProps) {
  const [selectedFunction, setSelectedFunction] = useState<string>(data.selectedFunction || '');
  const [parameters, setParameters] = useState<Record<string, string | number>>(data.parameters || {});
  const blockTemplates = blockTemplateService.getTemplatesByType('MATH');
  const edges = useEdges();
  const nodes = useNodes();

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

  // Check for connected inputs and update parameters
  useEffect(() => {
    if (selectedFunction) {
      const template = blockTemplates.find(t => t.metadata.name === selectedFunction);
      if (template) {
        // Create a copy of the current parameters
        const newParameters = { ...parameters };
        
        // Check each parameter for connections
        template.metadata.parameters.forEach(param => {
          const connectedValue = getConnectedValue(param.name);
          
          // If there's a connected value, update the parameter
          if (connectedValue !== null && connectedValue !== undefined) {
            // Convert string numbers to actual numbers if necessary
            if (param.type === 'number' && typeof connectedValue === 'string' && !isNaN(Number(connectedValue))) {
              newParameters[param.name] = Number(connectedValue);
            } else {
              newParameters[param.name] = connectedValue as string | number;
            }
          }
        });
        
        // Update the state and data if parameters have changed
        if (JSON.stringify(newParameters) !== JSON.stringify(parameters)) {
          setParameters(newParameters);
          data.parameters = newParameters;
        }
      }
    }
  }, [selectedFunction, blockTemplates, parameters, getConnectedValue, data, edges, nodes]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    const newParameters = {}; 
    data.selectedFunction = value;
    data.parameters = newParameters;
  }, [data]);

  const handleParameterChange = useCallback((paramName: string, value: string | number) => {
    const newParameters = { ...parameters };
    
    // Convert string numbers to actual numbers
    if (typeof value === 'string' && !isNaN(Number(value))) {
      newParameters[paramName] = Number(value);
    } else {
      newParameters[paramName] = value;
    }
    
    setParameters(newParameters);
    data.parameters = newParameters;
  }, [parameters, data]);

  // Convert function options into dropdown options
  const functionOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Function' },
      ...blockTemplates.map(template => ({
        value: template.metadata.name,
        label: template.metadata.name
      }))
    ];
  }, [blockTemplates]);

  // Create dynamic inputs based on selected function
  const inputs: InputDefinition[] = useMemo(() => {
    // Base function dropdown input
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
      const template = blockTemplates.find(t => t.metadata.name === selectedFunction);
      if (template) {
        const paramInputs: InputDefinition[] = template.metadata.parameters.map(param => {
          const connectionGetter = () => getConnectedValue(param.name) as string | number | null;
          
          if (param.type === 'number') {
            return createInputDefinition.number({
              id: `input-${param.name}`,
              label: param.name,
              defaultValue: parameters[param.name] as number || 0,
              description: param.description,
              getConnectedValue: connectionGetter,
              handleId: `param-${param.name}`,
            });
          } else {
            return createInputDefinition.text({
              id: `input-${param.name}`,
              label: param.name,
              defaultValue: String(parameters[param.name] || ''),
              description: param.description,
              getConnectedValue: connectionGetter,
              handleId: `param-${param.name}`,
            });
          }
        });
        
        return [...baseInputs, ...paramInputs];
      }
    }
    
    return baseInputs;
  }, [blockTemplates, selectedFunction, parameters, getConnectedValue, functionOptions]);

  // Get output type from selected template
  const output: OutputDefinition = useMemo(() => {
    if (selectedFunction) {
      const template = blockTemplates.find(t => t.metadata.name === selectedFunction);
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
      type: 'any',
      description: 'Result of the math operation'
    };
  }, [selectedFunction, blockTemplates]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['MATH']}
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
