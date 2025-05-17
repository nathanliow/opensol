import { useCallback, useState, useMemo } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface TransferNodeProps {
  id: string;
}

// Define the output
const output: OutputDefinition = {
  id: 'output',
  label: 'Token',
  type: 'object',
  description: 'The minted token information'
};

export default function TransferNode({ id }: TransferNodeProps) {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState('');

  // Define inputs for token minting using the new helper functions
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-tokenAddress',
      label: 'Token Address',
      defaultValue: tokenAddress,
      placeholder: 'Enter token address',
      required: true,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'tokenAddress'),
      handleId: 'input-tokenAddress'
    }),   
    createInputDefinition.number({
      id: 'input-amount',
      label: 'Amount',
      defaultValue: amount,
      placeholder: 'Enter amount',
      required: true,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'amount'),
      handleId: 'input-amount'
    }),
    createInputDefinition.text({
      id: 'input-recipient',
      label: 'Recipient',
      defaultValue: recipient,
      placeholder: 'Enter recipient address',
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'recipient'),
      handleId: 'input-recipient'
    }),
  ], [tokenAddress, amount, recipient, edges, nodes, id]);
  
  const handleInputChange = useCallback((inputId: string, value: any, fromConnection: boolean = false) => {
    // Find the input definition
    const input = inputs.find(i => i.id === inputId);
    
    // If this input is connected to another node, don't update the value
    // when manually changed, but do update when triggered by connection
    if (input && nodeUtils.isInputConnected(input) && !fromConnection) {
      return;
    }
    
    let valueType: InputValueTypeString = 'string';
    
    switch(inputId) {
      case 'input-tokenAddress':
        setTokenAddress(value);
        nodeUtils.updateNodeInput(id, 'tokenAddress', inputId, valueType, value, setNodes);
        break;
      case 'input-amount':
        setAmount(value);
        nodeUtils.updateNodeInput(id, 'amount', inputId, valueType, value, setNodes);
        break;
      case 'input-recipient':
        setRecipient(value);
        nodeUtils.updateNodeInput(id, 'recipient', inputId, valueType, value, setNodes);
        break;
    }
  }, [id, setNodes, inputs]);

  return (
    <>
      <TemplateNode
        id={id}
        metadata={nodeTypes['TRANSFER'].metadata}
        inputs={inputs}
        output={output}
        data={nodeUtils.getNodeData(nodes, id)}
        onInputChange={handleInputChange}
      />
    </>
  );
};