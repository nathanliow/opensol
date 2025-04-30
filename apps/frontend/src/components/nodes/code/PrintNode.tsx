import { memo, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';

interface PrintNodeData {
  label: string;
  template: string;
  parameters?: Record<string, any>;
}

interface PrintNodeProps {
  id: string;
  data: PrintNodeData;
}

export default function PrintNode({ id, data }: PrintNodeProps) {
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

  // Define inputs for template node using the new helper function
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.textarea({
      id: 'template',
      label: 'Template',
      defaultValue: data.template || '',
      placeholder: 'Enter template (use $output$ for value)',
      description: 'Template text, use $output$ to insert the input value',
      rows: 3
    })
  ], [data.template]);

  // Define the output
  const output: OutputDefinition = {
    id: 'output',
    label: 'Formatted Text',
    type: 'string',
    description: 'The formatted template text'
  };

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['PRINT']}
      inputs={inputs}
      output={output}
      data={data}
      onInputChange={(inputId, value) => {
        if (inputId === 'template') {
          handleTemplateChange(value);
        }
      }}
    />
  );
}