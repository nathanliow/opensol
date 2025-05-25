import { memo, useCallback, useMemo, useEffect, useState } from 'react';
import { useNodes, useReactFlow, useEdges } from '@xyflow/react';
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
  const edges = useEdges();
  
  // State for template value
  const [templateValue, setTemplateValue] = useState('');
  
  // Get node data to initialize state
  const nodeData = nodeUtils.getNodeData(nodes, id);
  
  // Initialize template value from node data
  useEffect(() => {
    const storedTemplate = nodeUtils.getValue(nodeData.inputs, 'input-template', '');
    setTemplateValue(storedTemplate);
  }, [nodeData]);
  
  const handleTemplateChange = useCallback((value: string, fromConnection: boolean = false) => {
    // Update local state
    setTemplateValue(value);
    
    // Update node data
    nodeUtils.updateNodeInput(id, 'template', 'input-template', 'string', value, setNodes);
    
    // Update output with the template value (could be processed further if needed)
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
      rows: 3,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'template'),
      handleId: 'input-template'
    })
  ], [edges, nodes, id]);

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
      onInputChange={(inputId, value, fromConnection = false) => {
        if (inputId === 'input-template') {
          handleTemplateChange(value, fromConnection);
        }
      }}
    />
  );
}