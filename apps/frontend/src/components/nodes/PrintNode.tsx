import { memo, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/inputTypes';
import { nodeTypesData } from '../../types/nodeTypes';

interface PrintNodeData {
  label: string;
  template: string;
  parameters?: Record<string, any>;
}

interface PrintNodeProps {
  id: string;
  data: PrintNodeData;
}

const PrintNode = memo(({ id, data }: PrintNodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeType = nodeTypesData['PRINT'];
  const backgroundColor = nodeType?.backgroundColor || 'bg-white';
  const borderColor = nodeType?.borderColor || 'border-black';
  const primaryColor = nodeType?.primaryColor || 'white';
  const secondaryColor = nodeType?.secondaryColor || 'white';
  const textColor = nodeType?.textColor || 'text-black';

  const handleTemplateChange = useCallback((value: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                template: value
              }
            }
          : node
      )
    );
  }, [id, setNodes]);

  // Define inputs for template node
  const inputs: InputDefinition[] = useMemo(() => [
    {
      id: 'template',
      label: 'Template',
      type: 'text',
      defaultValue: data.template || '',
      placeholder: 'Enter template (use $output$ for value)',
      description: 'Template text, use $output$ to insert the input value'
    },
    {
      id: 'display',
      label: 'Preview',
      type: 'display',
      defaultValue: data.template || '',
    }
  ], [data.template]);

  return (
    <TemplateNode
      id={id}
      title="PRINT"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={(inputId, value) => {
        if (inputId === 'template') {
          handleTemplateChange(value);
        }
      }}
    />
  );
});

PrintNode.displayName = 'PrintNode';

export default PrintNode;