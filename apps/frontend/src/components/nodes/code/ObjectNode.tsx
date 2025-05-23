import { useCallback, useMemo } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';
import ObjectDisplay from '../../ui/ObjectDisplay';

interface ObjectNodeProps {
  id: string;
}

export default function ObjectNode({ id }: ObjectNodeProps) {
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
    return {};
  }, [edges, nodes, id]);
  
  // Create a custom component for displaying the object
  const objectDisplayInput = useMemo(() => {
    return createInputDefinition.display({
      id: 'object-display',
      label: 'Object Data',
      component: <ObjectDisplay data={object} maxHeight="300px" />,
    });
  }, [object]);
  
  // Combine inputs
  const allInputs = useMemo(() => {
    return [...inputs, objectDisplayInput];
  }, [inputs, objectDisplayInput]);
  
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
      nodeUtils.updateNodeOutput(id, 'object', value, setNodes);
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
