import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/InputTypes';
import { nodeTypesData } from '../../types/NodeTypes';
import { CustomHandle } from '../../types/HandleTypes';

// Available data types for constants
const dataTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
];

interface ConstNodeProps {
  id: string;
  data: {
    label?: string;
    dataType?: string;
    value?: string | number | boolean;
  };
}

export default function ConstNode({ id, data }: ConstNodeProps) {
  const { setNodes } = useReactFlow();
  const nodeType = nodeTypesData['CONST'];
  const backgroundColor = nodeType?.backgroundColor || 'bg-[#1E293B]';
  const borderColor = nodeType?.borderColor || 'border-gray-700';
  const primaryColor = nodeType?.primaryColor || 'slate-700';
  const secondaryColor = nodeType?.secondaryColor || 'slate-800';
  const textColor = nodeType?.textColor || 'text-white';
  
  // Default values
  const dataType = data.dataType || 'string';
  const value = data.value !== undefined ? data.value : '';
  
  // Define custom handle (output at bottom)
  const customHandles: CustomHandle[] = useMemo(() => [
    {
      type: 'source',
      position: 'bottom',
      id: 'value',
      isValidConnection: (connection: { targetHandle: string; }) => {
        return connection.targetHandle?.startsWith('param-');
      }
    }
  ], []);
  
  // Determine input type based on selected data type
  const getInputType = useMemo(() => {
    switch (dataType) {
      case 'number':
        return 'number';
      case 'boolean':
        return 'dropdown';
      default:
        return 'text';
    }
  }, [dataType]);
  
  // Define inputs for constant configuration
  const inputs: InputDefinition[] = useMemo(() => [
    {
      id: 'dataType',
      label: 'Type',
      type: 'dropdown',
      options: dataTypes,
      defaultValue: dataType
    },
    {
      id: 'value',
      label: 'Value',
      type: getInputType,
      options: dataType === 'boolean' ? [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' }
      ] : undefined,
      defaultValue: String(value)
    }
  ], [dataType, value, getInputType]);
  
  const handleInputChange = useCallback((inputId: string, newValue: any) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                [inputId]: inputId === 'value' 
                  ? (dataType === 'number' ? Number(newValue)
                    : dataType === 'boolean' ? newValue === 'true'
                    : newValue)
                  : newValue
              }
            }
          : node
      )
    );
  }, [id, setNodes, dataType]);
  
  return (
    <TemplateNode
      id={id}
      title="CONST"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
      hideInputHandles={true}
      customHandles={customHandles}
    />
  );
}