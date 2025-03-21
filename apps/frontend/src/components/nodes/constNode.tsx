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
  
  // Define output type based on data type
  const output = useMemo(() => ({
    type: dataType as 'string' | 'number' | 'boolean',
    description: `Constant ${dataType} value`
  }), [dataType]);
  
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

  const handleInputChange = useCallback((inputId: string, newValue: any) => {
    if (inputId === 'dataType') {
      // Reset value when changing type
      setNodes(nodes => nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              dataType: newValue,
              value: ''
            }
          };
        }
        return node;
      }));
    } else if (inputId === 'value') {
      let processedValue = newValue;
      
      // Convert value based on data type
      if (dataType === 'number') {
        processedValue = Number(newValue);
      } else if (dataType === 'boolean') {
        processedValue = Boolean(newValue);
      }
      
      setNodes(nodes => nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: processedValue
            }
          };
        }
        return node;
      }));
    }
  }, [id, setNodes, dataType]);

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
      defaultValue: value
    }
  ], [dataType, value, getInputType]);

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
      customHandles={customHandles}
      output={output}
    />
  );
}