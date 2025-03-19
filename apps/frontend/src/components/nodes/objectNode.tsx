import { useCallback } from 'react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/inputTypes';
import { nodeTypesData } from '../../types/nodeTypes';

interface ObjectNodeProps {
  id: string;
  data: {
    label?: string;
    object?: Record<string, any>;
  };
}

export default function ObjectNode({ id, data }: ObjectNodeProps) {
  const nodeType = nodeTypesData['OBJECT'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;

  // Default object if none provided
  const objectData = data.object || {
    id: "123",
    name: "Sample Object",
    status: "active",
    createdAt: "2023-05-15",
    count: 42,
  };
  
  // Create inputs for each object property
  const inputs: InputDefinition[] = Object.keys(objectData).map(key => ({
    id: key,
    label: key,
    type: 'display' as const,
    defaultValue: typeof objectData[key] === 'object' 
      ? JSON.stringify(objectData[key]) 
      : String(objectData[key])
  }));
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Object property ${inputId} changed to ${value}`);
    // Update logic would go here
  }, []);
  
  return (
    <TemplateNode
      id={id}
      title="OBJECT"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={objectData}
      onInputChange={handleInputChange}
    />
  );
}
