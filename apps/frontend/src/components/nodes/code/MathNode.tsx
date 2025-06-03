import { useCallback, useState, useMemo, useEffect } from 'react';
import { useEdges, useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import blockTemplateService from '../../services/blockTemplateService';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface MathNodeProps {
  id: string;
}

export default function MathNode({ id }: MathNodeProps) {
  const { setNodes } = useReactFlow();
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string | number>>({});
  const blockTemplates = blockTemplateService.getTemplatesByType('MATH');
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];

  const getConnectedValue = useCallback((paramName: string) => {
    const edge = edges.find(e => 
      e.target === id && 
      e.targetHandle === `input-${paramName}`
    );
    
    if (!edge) return null;
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) return null;
    
    return sourceNode.data.output?.value;
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
          // Update each parameter individually using nodeUtils
          Object.entries(newParameters).forEach(([paramName, paramValue]) => {
            const valueType = typeof paramValue === 'number' ? 'number' : 'string';
            nodeUtils.updateNodeInput(id, `${paramName}`, `input-${paramName}`, valueType, paramValue, setNodes);
          });
        }
      }
    }
  }, [selectedFunction, blockTemplates, parameters, getConnectedValue, id, edges, nodes, setNodes]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunction(value);
    setParameters({});
    nodeUtils.updateNodeInput(id, 'function', 'input-function', 'string', value, setNodes);
  }, [id, setNodes]);

  const handleParameterChange = useCallback((paramName: string, value: string | number) => {
    const newParameters = { ...parameters };
    let processedValue = value;
    let valueType: InputValueTypeString = 'string';
    
    // Convert string numbers to actual numbers
    if (typeof value === 'string' && !isNaN(Number(value))) {
      processedValue = Number(value);
      valueType = 'number';
    }
    
    newParameters[paramName] = processedValue;
    setParameters(newParameters);
    
    // Update node data using nodeUtils
    nodeUtils.updateNodeInput(id, `${paramName}`, `input-${paramName}`, valueType, processedValue, setNodes);
  }, [parameters, id, setNodes]);

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
              handleId: `input-${param.name}`,
            });
          } else {
            return createInputDefinition.text({
              id: `input-${param.name}`,
              label: param.name,
              defaultValue: String(parameters[param.name] || ''),
              description: param.description,
              getConnectedValue: connectionGetter,
              handleId: `input-${param.name}`,
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
      id={id}
      metadata={nodeTypes['MATH'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-function') {
          handleFunctionChange(value);
        } else {
          // Extract parameter name from input ID
          const paramMatch = inputId.match(/^input-(.+)$/);
          if (paramMatch) {
            handleParameterChange(paramMatch[1], value);
          }
        }
      }}
      output={output}
    />
  );
}
