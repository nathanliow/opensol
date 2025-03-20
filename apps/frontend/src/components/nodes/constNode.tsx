import { useCallback, useMemo } from 'react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/inputTypes';
import { nodeTypesData } from '../../types/NodeTypes';

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
  const nodeType = nodeTypesData['CONST'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;
  
  // Default values
  const dataType = data.dataType || 'string';
  const value = data.value !== undefined ? data.value : '';
  
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
  
  // Options for boolean type
  const booleanOptions = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' }
  ];
  
  // Define inputs for constant configuration
  const inputs: InputDefinition[] = [
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
      options: dataType === 'boolean' ? booleanOptions : undefined,
      defaultValue: value
    }
  ];
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Constant ${inputId} changed to ${value}`);
    // Update logic would go here
  }, []);
  
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
      hideInputHandles={true} // Hide input handles since this is a source-only node
    />
  );
}