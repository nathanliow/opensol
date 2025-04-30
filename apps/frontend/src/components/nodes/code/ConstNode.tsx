import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';

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
  
  // Default values
  const dataType = data.dataType || 'string';
  const value = data.value !== undefined ? data.value : '';
  
  // Define output with OutputDefinition
  const output: OutputDefinition = useMemo(() => ({
    id: 'output',
    label: 'Output',
    type: dataType as 'string' | 'number' | 'boolean' | 'any',
    description: `Constant ${dataType} value`
  }), [dataType]);

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

  const inputs: InputDefinition[] = useMemo(() => {
    // First input is always the data type dropdown
    const typeInput = createInputDefinition.dropdown({
      id: 'dataType',
      label: 'Type',
      options: dataTypes,
      defaultValue: dataType
    });

    // Second input depends on the selected data type
    let valueInput: InputDefinition;
    
    switch (dataType) {
      case 'number':
        valueInput = createInputDefinition.number({
          id: 'value',
          label: 'Value',
          defaultValue: typeof value === 'number' ? value : 0
        });
        break;
      case 'boolean':
        valueInput = createInputDefinition.dropdown({
          id: 'value',
          label: 'Value',
          options: [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' }
          ],
          defaultValue: String(value)
        });
        break;
      default: // string
        valueInput = createInputDefinition.text({
          id: 'value',
          label: 'Value',
          defaultValue: String(value || '')
        });
        break;
    }
    
    return [typeInput, valueInput];
  }, [dataType, value]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['CONST']}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
      output={output}
    />
  );
}