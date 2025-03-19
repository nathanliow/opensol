import { useCallback } from 'react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/inputTypes';
import { nodeTypesData } from '../../types/nodeTypes';

interface LabelNodeProps {
  id: string;
  data: { 
    name?: string;
  };
}
 
export default function LabelNode({ id, data }: LabelNodeProps) {
  const nodeType = nodeTypesData['LABEL'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;
  
  // Define inputs for the label node
  const inputs: InputDefinition[] = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      defaultValue: data.name || 'Untitled Logic'
    }
  ];
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    if (inputId === 'name') {
      // Update the node data
      data.name = value;
    }
  }, [data]);
  
  return (
    <TemplateNode
      id={id}
      title="LABEL"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
      hideInputHandles={true} // No input handles for label node
    />
  );
}