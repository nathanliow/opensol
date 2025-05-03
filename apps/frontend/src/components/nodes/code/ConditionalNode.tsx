import { useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';
import { OutputDefinition } from '@/types/OutputTypes';

interface ConditionalNodeProps {
  id: string;
  data: {
    label?: string;
    parameters?: Record<string, any>;
  };
}

const ConditionalNode = ({ id, data }: ConditionalNodeProps) => {
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-condition',
      label: 'Condition',
      description: 'Boolean expression to evaluate',
      placeholder: 'Enter condition expression',
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
      metadata={nodeTypesMetadata['CONDITIONAL']}
      inputs={inputs}
      output={output}
      data={data}
      customHandles={customHandles}
    />
  );
};

export default ConditionalNode;
