import { useCallback, useState, useMemo } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';
import { FlowNode } from '../../../../../backend/src/packages/compiler/src/types';

interface MintNodeProps {
  id: string;
}

// Define the output
const output: OutputDefinition = {
  id: 'output',
  label: 'Token',
  type: 'object',
  description: 'The minted token information'
};

export default function MintNode({ id }: MintNodeProps) {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes() as FlowNode[];
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [supply, setSupply] = useState(1000000000);
    
  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedImageFile(file);
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    nodeUtils.updateNodeInput(id, 'image', 'input-image', 'string', previewUrl, setNodes);
  }, [id, setNodes]);
  
  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedImageFile(null);
    nodeUtils.updateNodeInput(id, 'image', 'input-image', 'null', null, setNodes);
    nodeUtils.updateNodeInput(id, 'imageIpfsUrl', 'input-image-ipfs', 'null', null, setNodes);
  }, [id, setNodes]);
  
  // Define inputs for token minting using the new helper functions
  const inputs: InputDefinition[] = useMemo(() => [
    createInputDefinition.text({
      id: 'input-name',
      label: 'Token Name',
      defaultValue: name,
      placeholder: 'Enter token name',
      required: true,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'name'),
      handleId: 'input-name'
    }),
    
    createInputDefinition.text({
      id: 'input-symbol',
      label: 'Symbol',
      defaultValue: symbol,
      placeholder: 'Enter token symbol',
      maxLength: 10,
      required: true,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'symbol'),
      handleId: 'input-symbol'
    }),
    
    createInputDefinition.text({
      id: 'input-description',
      label: 'Description',
      defaultValue: description,
      placeholder: 'Enter token description',
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'description'),
      handleId: 'input-description'
    }),
    
    createInputDefinition.number({
      id: 'input-supply',
      label: 'Supply',
      defaultValue: supply,
      min: 0,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'supply'),
      handleId: 'input-supply'
    }),
    
    createInputDefinition.file({
      id: 'input-image',
      label: 'Token Image',
      accept: 'image/*',
      previewType: 'image',
      previewUrl: '',
      maxSize: 5 * 1024 * 1024, // 5MB
      onFileSelect: handleFileSelect,
      onFileRemove: handleFileRemove,
      required: true,
      handleId: 'input-image'
    })
  ], [name, symbol, description, supply, edges, nodes, id, handleFileSelect, handleFileRemove]);
  
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
      case 'input-name':
        setName(value);
        nodeUtils.updateNodeInput(id, 'name', inputId, valueType, value, setNodes);
        break;
      case 'input-symbol':
        setSymbol(value);
        nodeUtils.updateNodeInput(id, 'symbol', inputId, valueType, value, setNodes);
        break;
      case 'input-description':
        setDescription(value);
        nodeUtils.updateNodeInput(id, 'description', inputId, valueType, value, setNodes);
        break;
      case 'input-supply':
        setSupply(value);
        valueType = 'number';
        nodeUtils.updateNodeInput(id, 'supply', inputId, valueType, value, setNodes);
        break;
      case 'input-image':
        // The file is handled by the onFileSelect callback
        break;
    }
  }, [id, setNodes, inputs]);

  return (
    <>
      <TemplateNode
        id={id}
        metadata={nodeTypes['MINT'].metadata}
        inputs={inputs}
        output={output}
        data={nodeUtils.getNodeData(nodes, id)}
        onInputChange={handleInputChange}
      />
    </>
  );
};