import { useCallback, useMemo } from 'react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { useNodes, useReactFlow } from '@xyflow/react';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface LabelNodeProps {
  id: string;
}

export default function FunctionNode({ id }: LabelNodeProps) {
  const { setNodes } = useReactFlow();
  const nodes = useNodes() as FlowNode[];

  const handleNameChange = useCallback((value: string) => {
    const hasNumbers = /\d/.test(value);
    if (hasNumbers) {
      return;
    }
    nodeUtils.updateNodeInput(id, 'name', 'input-name', 'string', value, setNodes);
  }, [id, setNodes]);

  // Define input for the name field using the new helper
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-name',
      label: 'Name',
      defaultValue: '',
      placeholder: 'Enter Function name...'
    })
  ], []);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['FUNCTION'].metadata}
      inputs={inputs}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-name') {
          handleNameChange(value);
        }
      }}
      hideTopHandle={true}
      hideInputHandles={true}
      hideOutputHandle={true}
    />
  );
}