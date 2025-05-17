import { useCallback, useMemo, useState } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition, OutputValueTypeString } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface ConstNodeProps {
  id: string;
}

export default function ConstNode({ id }: ConstNodeProps) {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  const [dataType, setDataType] = useState<string>('string');
  const [value, setValue] = useState<string | number | boolean>('');
  
  const handleTypeChange = useCallback((newValue: string) => {
    setDataType(newValue);
    setValue('');
    nodeUtils.updateNodeInput(id, 'dataType', 'input-dataType', 'string', newValue, setNodes);
    nodeUtils.updateNodeInput(id, 'value', 'input-value', dataType as InputValueTypeString, '', setNodes);
    nodeUtils.updateNodeOutput(id, newValue as OutputValueTypeString, '', setNodes);
  }, [setDataType, id, setNodes, dataType]);
  
  const handleValueChange = useCallback((inputId: string, newValue: string | number | boolean, fromConnection: boolean = false) => {
    // Parse the value based on data type
    let parsedValue = newValue;
    if (dataType === 'number' && typeof newValue === 'string') {
      parsedValue = parseFloat(newValue);
    } else if (dataType === 'boolean' && typeof newValue === 'string') {
      parsedValue = newValue === 'true';
    }
    
    setValue(parsedValue);
    nodeUtils.updateNodeInput(id, 'value', 'input-value', dataType as InputValueTypeString, parsedValue, setNodes);
    nodeUtils.updateNodeOutput(id, dataType as OutputValueTypeString, parsedValue, setNodes);
  }, [dataType, id, setNodes]);
  
  // Define output with OutputDefinition
  const output: OutputDefinition = useMemo(() => ({
    id: 'output',
    label: 'Output',
    type: dataType as OutputValueTypeString,
    description: `Constant ${dataType} value`
  }), [dataType]);

  const inputs: InputDefinition[] = useMemo(() => {
    // First input is always the data type dropdown
    const typeInput = createInputDefinition.dropdown({
      id: 'input-dataType',
      label: 'Type',
      options: [
        { value: 'string',  label: 'String' },
        { value: 'number',  label: 'Number' },
        { value: 'boolean', label: 'Boolean'}
      ],
      defaultValue: dataType
    });

    // Second input depends on the selected data type
    let valueInput: InputDefinition;
    
    switch (dataType) {
      case 'number':
        valueInput = createInputDefinition.number({
          id: 'input-value',
          label: 'Value',
          defaultValue: typeof value === 'number' ? value : 0,
          getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'value'),
          handleId: 'input-value'
        });
        break;
      case 'boolean':
        valueInput = createInputDefinition.dropdown({
          id: 'input-value',
          label: 'Value',
          options: [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' }
          ],
          defaultValue: String(value),
          getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'value'),
          handleId: 'input-value'
        });
        break;
      default: // string
        valueInput = createInputDefinition.text({
          id: 'input-value',
          label: 'Value',
          defaultValue: String(value || ''),
          getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'value'),
          handleId: 'input-value'
        });
        break;
    }
    
    return [typeInput, valueInput];
  }, [dataType, value, edges, nodes, id]);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['CONST'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value, fromConnection) => {
        if (inputId === 'input-dataType') {
          handleTypeChange(value);
        } else {
          handleValueChange(inputId, value, fromConnection);
        }
      }}
      output={output}
    />
  );
}