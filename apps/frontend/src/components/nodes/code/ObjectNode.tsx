import { useCallback, useMemo, useEffect } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface ObjectNodeProps {
  id: string;
  data: {
    label?: string;
    object?: Record<string, any>;
  };
}

export default function ObjectNode({ id, data }: ObjectNodeProps) {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  
  // Create a single object input
  const inputs: InputDefinition[] = useMemo(() => {
    const connectionGetter = nodeUtils.createConnectionGetter(edges, nodes, id, 'object');
    
    return [
      createInputDefinition.text({
        id: 'input-object',
        label: 'Object',
        description: 'Connect an object to display its properties',
        getConnectedValue: connectionGetter,
        handleId: 'input-object',
      })
    ];
  }, [edges, nodes, id]);
  
  // Get the connected object value
  const object = useMemo(() => {
    const connectionGetter = nodeUtils.createConnectionGetter(edges, nodes, id, 'object');
    const value = connectionGetter();
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, any>;
    }
    
    // Fall back to the data.object if available, or an empty object
    return data.object || {};
  }, [edges, nodes, id, data.object]);
  
  // Display properties from connected object
  const displayInputs: InputDefinition[] = useMemo(() => {
    return Object.keys(object).map(key => 
      createInputDefinition.display({
        id: `${key}`,
        label: key,
        defaultValue: typeof object[key] === 'string' 
          ? object[key] 
          : String(object[key]),
        format: (value) => String(value)
      })
    );
  }, [object]);
  
  // Combine inputs
  const allInputs = useMemo(() => {
    return [...inputs, ...displayInputs];
  }, [inputs, displayInputs]);
  
  // Define the output
  const output: OutputDefinition = {
    id: 'output',
    label: 'Object',
    type: 'object',
    description: 'Object containing the displayed properties'
  };
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    if (inputId === 'input-object' && value && typeof value === 'object') {
      // Update the node with the connected object
      nodeUtils.updateNodeInput(id, 'object', inputId, 'object', value, setNodes);
    }
  }, [id, setNodes]);
  
  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['OBJECT'].metadata}
      inputs={allInputs}
      output={output}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={handleInputChange}
    />
  );
}
