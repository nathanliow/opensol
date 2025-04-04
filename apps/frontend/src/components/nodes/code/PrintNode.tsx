import { memo, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';

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
      metadata={nodeTypesMetadata['PRINT']}
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