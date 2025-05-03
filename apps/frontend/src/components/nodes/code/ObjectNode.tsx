import { useCallback } from 'react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';

interface ObjectNodeProps {
  id: string;
  data: {
    label?: string;
    object?: Record<string, any>;
  };
}

export default function ObjectNode({ id, data }: ObjectNodeProps) {
  // Default object if none provided
  const objectData = data.object || {
    id: "123",
    name: "Sample Object",
    status: "active",
    createdAt: "2023-05-15",
    count: 42,
  };
  
  // Create inputs for each object property using the new helper
  const inputs: InputDefinition[] = Object.keys(objectData).map(key => 
    createInputDefinition.display({
      id: `input-${key}`,
      label: key,
      defaultValue: typeof objectData[key] === 'object' 
        ? JSON.stringify(objectData[key]) 
        : String(objectData[key]),
      format: (value) => String(value)
    })
  );
  
  // Define the output
  const output: OutputDefinition = {
    id: 'output',
    label: 'Object',
    type: 'object',
    description: 'Object containing the displayed properties'
  };
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Object property ${inputId} changed to ${value}`);
    // Update logic would go here
  }, []);
  
  return (
    <TemplateNode
      metadata={nodeTypesMetadata['OBJECT']}
      inputs={inputs}
      output={output}
      data={objectData}
      onInputChange={handleInputChange}
    />
  );
}
