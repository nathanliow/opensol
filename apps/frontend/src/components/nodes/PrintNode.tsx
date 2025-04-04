import { memo, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from './TemplateNode';
import { InputDefinition } from '../../types/InputTypes';
import { nodeTypesData } from '../../types/NodeTypes';

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
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;

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
      type: 'textarea',
      defaultValue: data.template || '',
      placeholder: 'Enter template (use $output$ for value)',
      description: 'Template text, use $output$ to insert the input value',
      rows: 3
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