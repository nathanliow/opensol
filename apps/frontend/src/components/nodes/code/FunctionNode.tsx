import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';

interface LabelNodeProps {
  id: string;
  data: { 
    name: string;
  };
}

export default function FunctionNode({ id, data }: LabelNodeProps) {
  const { setNodes } = useReactFlow();

  const handleNameChange = useCallback((value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                name: value
              }
            }
          : node
      )
    );
  }, [id, setNodes]);

  // Define input for the name field using the new helper
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-name',
      label: 'Name',
      defaultValue: data.name || 'Untitled Function',
      placeholder: 'Enter Function name...'
    })
  ], [data.name]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['FUNCTION']}
      inputs={inputs}
      data={data}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-name') {
          handleNameChange(value);
        }
      }}
      hideTopHandle={true}
      hideInputHandles={true}
      hideOutputHandle={true}
    />
  );
}