import { memo, useCallback, useEffect } from 'react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { useNodeData } from '../../../hooks/useNodeData';
import { OutputDefinition } from '@/types/OutputTypes';

// Define the node's input/output schema using the new helper functions
const inputs: InputDefinition[] = [
  createInputDefinition.text({
    id: 'input-text',
    label: 'Text',
    defaultValue: 'Hello World',
    placeholder: 'Enter text here'
  }),
  
  createInputDefinition.number({
    id: 'input-number',
    label: 'Number',
    defaultValue: 42,
    placeholder: 'Enter a number',
    min: 0,
    max: 100
  }),
  
  createInputDefinition.dropdown({
    id: 'input-options',
    label: 'Options',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ],
    defaultValue: 'option1',
    searchable: true
  })
];

// Define the output
const output: OutputDefinition = {
  id: 'output',
  label: 'Output',
  type: 'string',
  description: 'Combined output of text and number'
};

// ExampleNode component using the refactored TemplateNode
function ExampleNode({ id, data }: { id: string; data: any }) {
  // Use the useNodeData hook to manage the node's data and connections
  const {
    data: nodeData,
    updateInputValue,
    updateOutputValue,
    enhanceInputDefinitions
  } = useNodeData(id);

  // Enhance the input definitions with connection information
  const enhancedInputs = enhanceInputDefinitions(inputs);

  // Handle input changes
  const onInputChange = useCallback((inputId: string, value: any) => {
    updateInputValue(inputId, value);
  }, [updateInputValue]);

  // Compute output value whenever inputs change
  useEffect(() => {
    const text = nodeData.text || '';
    const number = nodeData.number || 0;
    const option = nodeData.options || 'option1';
    
    // Example computation: combine all input values
    const result = `${text} (${number}) - ${option}`;
    
    // Update the output value
    updateOutputValue(result);
  }, [nodeData.text, nodeData.number, nodeData.options, updateOutputValue]);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata.EXAMPLE}
      inputs={enhancedInputs}
      output={output}
      data={nodeData}
      onInputChange={onInputChange}
    />
  );
}

export default memo(ExampleNode); 