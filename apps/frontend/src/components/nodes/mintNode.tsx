import { useCallback } from 'react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/InputTypes';
import { nodeTypesData } from '../../types/NodeTypes';

interface MintNodeProps {
  id: string;
  data: {
    label?: string;
    name?: string;
    symbol?: string;
    supply?: string;
  };
}

export default function MintNode({ id, data }: MintNodeProps) {
  const nodeType = nodeTypesData['MINT'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;
  
  // Define inputs for token minting
  const inputs: InputDefinition[] = [
    {
      id: 'name',
      label: 'Token Name',
      type: 'text',
      defaultValue: data.name || ''
    },
    {
      id: 'symbol',
      label: 'Symbol',
      type: 'text',
      defaultValue: data.symbol || ''
    },
    {
      id: 'supply',
      label: 'Supply',
      type: 'number',
      defaultValue: data.supply || '1000000'
    }
  ];
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Mint parameter ${inputId} changed to ${value}`);
    // Update logic would go here
  }, []);
  
  return (
    <TemplateNode
      id={id}
      title="MINT"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
    />
  );
}
