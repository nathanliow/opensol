import { useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { CustomHandle } from '../../../types/HandleTypes';

interface ConditionalNodeProps {
  id: string;
  data: {
    label?: string;
    parameters?: Record<string, any>;
  };
}

const ConditionalNode = ({ id, data }: ConditionalNodeProps) => {
  const inputs: InputDefinition[] = useMemo(() => [
    {
      id: 'condition',
      label: 'Condition',
      description: 'Boolean expression to evaluate',
      type: 'text',
      placeholder: 'Enter condition expression',
      required: true,
    }
  ], []);

  const outputs: CustomHandle[] = useMemo(() => [
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
    },
    {
      id: 'output',
      label: 'Output',
      description: 'Combined output after conditional execution',
      position: 'bottom',
      type: 'source',
    }
  ], []);

  return (
    <TemplateNode
      metadata={nodeTypesMetadata['CONDITIONAL']}
      inputs={inputs}
      data={data}
      customHandles={outputs}
    />
  );
};

export default ConditionalNode;
