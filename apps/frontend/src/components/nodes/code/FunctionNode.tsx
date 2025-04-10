import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition } from '../../../types/InputTypes';
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

  // Define input for the name field
  const inputs: InputDefinition[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      defaultValue: data.name || 'Untitled Function',
      placeholder: 'Enter Function name...'
    }
  ], [data.name]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['FUNCTION']}
      inputs={inputs}
      data={data}
      onInputChange={(inputId, value) => {
        if (inputId === 'name') {
          handleNameChange(value);
        }
      }}
      hideTopHandle={true}
      hideInputHandles={true}
    />
  );
}