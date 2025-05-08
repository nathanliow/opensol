import { useCallback, useState, memo, useMemo } from 'react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, InputValueTypeString, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypes } from '../../../types/NodeTypes';
import { useTokenMint } from '../../../lib/tokenMint';
import { useConfig } from '../../../contexts/ConfigContext';
import { pinata } from '@/pinataConfig';
import { OutputDefinition } from '@/types/OutputTypes';
import { nodeUtils } from '@/utils/nodeUtils';

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
  const nodes = useNodes();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [mintAddress, setMintAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [imageIpfsUrl, setImageIpfsUrl] = useState('');
  
  const { mintToken } = useTokenMint();
  const { network } = useConfig();
  
  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);
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
      id: 'input-decimals',
      label: 'Decimals',
      defaultValue: decimals,
      min: 0,
      max: 9,
      getConnectedValue: nodeUtils.createConnectionGetter(edges, nodes, id, 'decimals'),
      handleId: 'input-decimals'
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
  ], [name, symbol, description, decimals, edges, nodes, id, handleFileSelect, handleFileRemove]);
  
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
      case 'input-decimals':
        setDecimals(value);
        valueType = 'number';
        nodeUtils.updateNodeInput(id, 'decimals', inputId, valueType, value, setNodes);
        break;
      case 'input-image':
        // The file is handled by the onFileSelect callback
        break;
    }
  }, [id, setNodes, inputs]);

  const uploadImageToPinata = async (file: File): Promise<string> => {
    try {
      const urlRequest = await fetch("/api/pinata/url");
      if (!urlRequest.ok) {
        throw new Error('Failed to get Pinata upload credentials'); 
      }
      
      const urlResponse = await urlRequest.json();
      
      const upload = await pinata.upload.public
        .file(file)
        .url(urlResponse.url); // Upload the file with the signed URL

      return "https://rose-rear-cobra-866.mypinata.cloud/ipfs/" + upload.cid;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  }
  
  const uploadMetadataToPinata = async (jsonMetadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    showName: boolean;
    createdOn: string;
  }): Promise<string> => {
    try {
      const urlRequest = await fetch("/api/pinata/url");
      if (!urlRequest.ok) {
        throw new Error('Failed to get Pinata upload credentials');
      }
      
      const urlResponse = await urlRequest.json();
      
      const upload = await pinata.upload.public
        .json(jsonMetadata)
        .url(urlResponse.url); // Upload the file with the signed URL
      
      return "https://rose-rear-cobra-866.mypinata.cloud/ipfs/" + upload.cid;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  };

  const handleMintToken = async () => {
    setIsLoading(true);
    setError(null);
    setUploading(true);
    
    try {
      // Get values from local state or connected inputs
      const nameInputDef = inputs.find(i => i.id === 'input-name');
      const symbolInputDef = inputs.find(i => i.id === 'input-symbol');
      const descriptionInputDef = inputs.find(i => i.id === 'input-description');
      const decimalsInputDef = inputs.find(i => i.id === 'input-decimals');
      
      const nameValue = nodeUtils.isInputConnected(nameInputDef!) ? 
        nodeUtils.getConnectedValue(nameInputDef!) : name;
      const symbolValue = nodeUtils.isInputConnected(symbolInputDef!) ? 
        nodeUtils.getConnectedValue(symbolInputDef!) : symbol;
      const descriptionValue = nodeUtils.isInputConnected(descriptionInputDef!) ? 
        nodeUtils.getConnectedValue(descriptionInputDef!) : description;
      const decimalsValue = nodeUtils.isInputConnected(decimalsInputDef!) ? 
        nodeUtils.getConnectedValue(decimalsInputDef!) : decimals;
      
      // Check if we have a selected image file
      if (!selectedImageFile) {
        setError('Please select an image first');
        setIsLoading(false);
        setUploading(false);
        return;
      }
      
      let imageIpfsUrl = '';
      if (selectedImageFile) {
        try {
          // Upload image to Pinata IPFS
          imageIpfsUrl = await uploadImageToPinata(selectedImageFile);
          
          // Update state with the IPFS URL
          nodeUtils.updateNodeInput(id, 'imageIpfsUrl', 'input-image-ipfs', 'string', imageIpfsUrl, setNodes);
        } catch (error) {
          console.error('Image upload error:', error);
          setError('Failed to upload image to IPFS');
          setIsLoading(false);
          setUploading(false);
          return;
        }
      }
      
      setUploading(false);
      setIsUploadingMetadata(true);
      
      // Create and upload metadata with the image IPFS URL
      try {
        if (!nameValue || !symbolValue) {
          setError('Missing required fields for metadata');
          setIsLoading(false);
          setIsUploadingMetadata(false);
          return;
        }
        
        // Create metadata JSON object
        const metadata = {
          name: nameValue,
          symbol: symbolValue,
          description: descriptionValue || '',
          image: imageIpfsUrl as string,
          showName: true,
          createdOn: "openSOL"
        };
          
        const metadataIpfsUrl = await uploadMetadataToPinata(metadata);
        
        nodeUtils.updateNodeInput(id, 'metadataUri', 'input-metadata-uri', 'string', metadataIpfsUrl, setNodes);

        const solanaNetwork = network === 'mainnet' ? 'mainnet-beta' : network;
        
        const res = await mintToken(
          nameValue || '',
          symbolValue || '',
          descriptionValue || '',
          imageIpfsUrl || '', // Use IPFS image URL
          decimalsValue || 9,
          solanaNetwork,
          100, // Default amount
          metadataIpfsUrl // Use the IPFS metadata URI
        );

        if (res.success) {    
          setMintAddress(res.mintAddress || '');
          setSignature(res.signature || '');
          setMetadataUri(metadataIpfsUrl || '');
          setImageIpfsUrl(imageIpfsUrl || '');
          // Update the node's output with the minted token data
          const outputData = {
            mintAddress: res.mintAddress,
            signature: res.signature,
            name: nameValue,
            symbol: symbolValue,
            description: descriptionValue,
            decimals: decimalsValue,
            imageUrl: imageIpfsUrl,
            metadataUri: metadataIpfsUrl
          };
          
          // Update the node output so other nodes can access this data
          nodeUtils.updateNodeOutput(id, 'object', outputData, setNodes);
        } else {
          setError(res.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        setError('Failed to upload metadata to IPFS');
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setUploading(false);
      setIsUploadingMetadata(false);
    }
  };
  
  // Show token mint result if minting is complete
  const renderMintResult = () => {
    if (!mintAddress) return null;
    
    // Get the current name value (either from local state or connected)
    const nameInputDef = inputs.find(i => i.id === 'input-name');
    const displayName = nodeUtils.isInputConnected(nameInputDef!) ? 
      nodeUtils.getConnectedValue(nameInputDef!) : name;
    
    return (
      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md mt-2">
        <h3 className="text-sm font-semibold mb-1">Token Minted!</h3>
        <p className="text-xs truncate">Address: {mintAddress}</p>
        {signature && (
          <p className="text-xs truncate mt-1">Transaction: {signature}</p>
        )}
        {metadataUri && (
          <p className="text-xs truncate mt-1">
            <a 
              href={metadataUri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Metadata
            </a>
          </p>
        )}
        {imageIpfsUrl && (
          <div className="mt-2 flex justify-center">
            <img 
              src={imageIpfsUrl} 
              alt={displayName || 'Token'} 
              className="w-24 h-24 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md mt-2">
        <p className="text-xs text-red-700 dark:text-red-200">Error: {error}</p>
      </div>
    );
  };
  
  // Check if required inputs are provided (either directly or via connections)
  const hasRequiredInputs = useCallback(() => {
    const nameInputDef = inputs.find(i => i.id === 'input-name');
    const symbolInputDef = inputs.find(i => i.id === 'input-symbol');
    
    const hasName = name || (nameInputDef && nodeUtils.isInputConnected(nameInputDef));
    const hasSymbol = symbol || (symbolInputDef && nodeUtils.isInputConnected(symbolInputDef));
    const hasImage = selectedImageFile;
    
    return hasName && hasSymbol && hasImage;
  }, [name, symbol, selectedImageFile, inputs]);

  const additionalContent = (
    <div className="px-3 pb-3">            
      {/* Mint button */}
      <div className="mt-4">
        <button
          onClick={handleMintToken}
          disabled={isLoading || !hasRequiredInputs()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 
            (uploading ? 'Uploading Image...' : 
             isUploadingMetadata ? 'Uploading Metadata...' : 
             'Minting...') : 
            'Mint Token'}
        </button>
      </div>
      
      {/* Error display */}
      {renderError()}
      
      {/* Mint result */}
      {renderMintResult()}
    </div>
  );
  
  return (
    <>
      <TemplateNode
        id={id}
        metadata={nodeTypes['MINT'].metadata}
        inputs={inputs}
        output={output}
        data={nodeUtils.getNodeData(nodes, id)}
        onInputChange={handleInputChange}
        additionalContent={additionalContent}
      />
    </>
  );
};