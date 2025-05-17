import { useCallback, useMemo } from 'react';
import { useNodes, useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface ConditionalNodeProps {
  id: string;
}

const ConditionalNode = ({ id }: ConditionalNodeProps) => {
  const { setNodes } = useReactFlow();
  const nodes = useNodes() as FlowNode[];
  
  const handleConditionChange = useCallback((value: string) => {
    nodeUtils.updateNodeInput(id, 'condition', 'input-condition', 'string', value, setNodes);
  }, [id, setNodes]);

  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-condition',
      label: 'Condition',
      description: 'Boolean expression to evaluate',
      placeholder: 'Enter condition expression',
      defaultValue: '',
      required: true
    })
  ], []);

  // Define the main output
  const output: OutputDefinition = {
    id: 'output',
    label: 'Output',
    type: 'any',
    description: 'Result of the conditional execution'
  };

  // Define custom handles for the then/else branches
  const customHandles: CustomHandle[] = useMemo(() => [
    {
      id: 'then',
      label: 'Then',
      description: 'Execute when condition is true',
      position: 'right',
      type: 'source',
    },
    {
      id: 'else',
      label: 'Else',
      description: 'Execute when condition is false',
      position: 'right',
      type: 'source',
    }
  ], []);

  return (
    <TemplateNode
      id={id}
      metadata={nodeTypes['CONDITIONAL'].metadata}
      inputs={inputs}
      output={output}
      data={nodeUtils.getNodeData(nodes, id)}
      onInputChange={(inputId, value) => {
        if (inputId === 'input-condition') {
          handleConditionChange(value);
        }
      }}
      customHandles={customHandles}
    />
  );
};

export default ConditionalNode;
