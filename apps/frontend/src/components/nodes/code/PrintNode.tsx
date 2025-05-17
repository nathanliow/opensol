import { memo, useCallback, useMemo } from 'react';
import { useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface PrintNodeProps {
  id: string;
}

export default function PrintNode({ id }: PrintNodeProps) {
  const { setNodes } = useReactFlow();
  const nodes = useNodes() as FlowNode[];
  
  const handleTemplateChange = useCallback((value: string) => {
    nodeUtils.updateNodeInput(id, 'template', 'input-template', 'string', value, setNodes);
    nodeUtils.updateNodeOutput(id, 'string', value, setNodes);
  }, [id, setNodes]);

  // Define inputs for template node using the new helper function
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.textarea({
      id: 'input-template',
      label: 'Template',
      defaultValue: '',
      placeholder: 'Enter template (use $output$ for value)',
      description: 'Template text, use $output$ to insert the input value',
      rows: 3
    })
  ], []);

  // Define the output
  const output: OutputDefinition = {
    id: 'output',
    label: 'Formatted Text',
    type: 'string',
    description: 'The formatted template text'
  };

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['PRINT'].metadata}
      inputs={inputs}
      output={output}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-template') {
          handleTemplateChange(value);
        }
      }}
    />
  );
}