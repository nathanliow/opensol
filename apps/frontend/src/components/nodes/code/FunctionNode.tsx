import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition } from '../../../types/InputTypes';
import { nodeTypesData } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';

interface LabelNodeProps {
  id: string;
  data: { 
    name: string;
  };
}

export default function FunctionNode({ id, data }: LabelNodeProps) {
  const { setNodes } = useReactFlow();
  const nodeType = nodeTypesData['FUNCTION'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;

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

  // Define custom handle (output at bottom)
  const customHandles: CustomHandle[] = useMemo(() => [
    {
      type: 'source',
      position: 'bottom',
      id: 'output',
      isValidConnection: (connection: { targetHandle: string; }) => {
        return connection.targetHandle === 'top-target';
      }
    }
  ], []);

  return (
    <TemplateNode
      id={id}
      title="FUNCTION"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={(inputId, value) => {
        if (inputId === 'name') {
          handleNameChange(value);
        }
      }}
      hideInputHandles={true}
      customHandles={customHandles}
    />
  );
}