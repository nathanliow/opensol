import { useCallback, useState, memo } from 'react';
import TemplateNode from '../TemplateNode';
import { InputDefinition, createInputDefinition } from '../../../types/InputTypes';
import { nodeTypesMetadata } from '../../../types/NodeTypes';
import { useTokenMint } from '../../../lib/tokenMint';
import { useConfig } from '../../../contexts/ConfigContext';
import { pinata } from '@/pinataConfig';
import { OutputDefinition } from '@/types/OutputTypes';

interface MintNodeProps {
  id: string;
  data: {
    label?: string;
    name?: string;
    symbol?: string;
    description?: string;
    image?: string;
    decimals?: number;
    network?: 'devnet' | 'mainnet-beta' | 'testnet';
    mintAddress?: string;
    mintStatus?: string;
    signature?: string;
    metadataUri?: string;
    imageIpfsUrl?: string;
  };
}

// Define the output
const output: OutputDefinition = {
  id: 'output',
  label: 'Token',
  type: 'object',
  description: 'The minted token information'
};

export default function MintNode({ id, data }: MintNodeProps) {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  
  // Local state to ensure UI updates
  const [name, setName] = useState(data.name || '');
  const [symbol, setSymbol] = useState(data.symbol || '');
  const [description, setDescription] = useState(data.description || '');
  const [decimals, setDecimals] = useState(data.decimals || 9);
  
  const { mintToken } = useTokenMint();
  const { network } = useConfig();
  
  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);
    setSelectedImageFile(file);
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    data.image = previewUrl;
  }, [data]);
  
  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedImageFile(null);
    data.image = undefined;
    data.imageIpfsUrl = undefined;
  }, [data]);
  
  // Define inputs for token minting using the new helper functions
  const inputs: InputDefinition[] = [
    createInputDefinition.text({
      id: 'input-name',
      label: 'Token Name',
      defaultValue: name,
      placeholder: 'Enter token name',
      required: true
    }),
    
    createInputDefinition.text({
      id: 'input-symbol',
      label: 'Symbol',
      defaultValue: symbol,
      placeholder: 'Enter token symbol',
      maxLength: 10,
      required: true
    }),
    
    createInputDefinition.text({
      id: 'input-description',
      label: 'Description',
      defaultValue: description,
      placeholder: 'Enter token description'
    }),
    
    createInputDefinition.number({
      id: 'input-decimals',
      label: 'Decimals',
      defaultValue: decimals,
      min: 0,
      max: 9
    }),
    
    createInputDefinition.file({
      id: 'input-image',
      label: 'Token Image',
      accept: 'image/*',
      previewType: 'image',
      previewUrl: data.imageIpfsUrl || data.image,
      maxSize: 5 * 1024 * 1024, // 5MB
      onFileSelect: handleFileSelect,
      onFileRemove: handleFileRemove,
      required: true
    })
  ];
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Mint parameter ${inputId} changed to ${value}`);
    
    // Update local state for UI
    switch(inputId) {
      case 'name':
        setName(value);
        break;
      case 'symbol':
        setSymbol(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'decimals':
        setDecimals(value);
        break;
      case 'image':
        // The file is handled by the onFileSelect callback
        break;
    }
    
    // Update data object directly (similar to HeliusNode) with type-safe access
    if (inputId === 'name') data.name = value;
    else if (inputId === 'symbol') data.symbol = value;
    else if (inputId === 'description') data.description = value;
    else if (inputId === 'decimals') data.decimals = value;
  }, [data]);

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
      console.log(upload);

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
      console.log(upload);
      
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
      // Check if we have a selected image file
      if (!selectedImageFile && !data.imageIpfsUrl) {
        setError('Please select an image first');
        setIsLoading(false);
        setUploading(false);
        return;
      }
      
      // If we have a selected image that hasn't been uploaded yet
      let imageIpfsUrl = data.imageIpfsUrl;
      if (selectedImageFile && !data.imageIpfsUrl) {
        try {
          // Upload image to Pinata IPFS
          imageIpfsUrl = await uploadImageToPinata(selectedImageFile);
          
          // Update state with the IPFS URL
          data.imageIpfsUrl = imageIpfsUrl;
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
        if (!name || !symbol) {
          setError('Missing required fields for metadata');
          setIsLoading(false);
          setIsUploadingMetadata(false);
          return;
        }
        
        // Create metadata JSON object
        const metadata = {
          name: name,
          symbol: symbol,
          description: description || '',
          image: imageIpfsUrl as string,
          showName: true,
          createdOn: "openSOL"
        };
          
        // Upload the metadata JSON to IPFS
        const metadataIpfsUrl = await uploadMetadataToPinata(metadata);
        
        console.log('Metadata uploaded to IPFS:', metadataIpfsUrl);
        console.log('Metadata content:', metadata);
        
        // Store the metadata IPFS URL
        data.metadataUri = metadataIpfsUrl;
        
        // Convert network format if needed ('mainnet' to 'mainnet-beta')
        const solanaNetwork = network === 'mainnet' ? 'mainnet-beta' : network;
        
        const res = await mintToken(
          name || '',
          symbol || '',
          description || '',
          imageIpfsUrl || '', // Use IPFS image URL
          decimals || 9,
          solanaNetwork,
          100, // Default amount
          metadataIpfsUrl // Use the IPFS metadata URI
        );

        if (res.success) {
          data.mintAddress = res.mintAddress;
          data.signature = res.signature;
          data.mintStatus = 'success';
        } else {
          setError(res.error || 'Unknown error occurred');
          data.mintStatus = 'error';
        }
      } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        setError('Failed to upload metadata to IPFS');
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error occurred';
      setError(errorMessage);
      data.mintStatus = 'error';
    } finally {
      setIsLoading(false);
      setUploading(false);
      setIsUploadingMetadata(false);
    }
  };
  
  // Show token mint result if minting is complete
  const renderMintResult = () => {
    if (!data.mintAddress) return null;
    
    return (
      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md mt-2">
        <h3 className="text-sm font-semibold mb-1">Token Minted!</h3>
        <p className="text-xs truncate">Address: {data.mintAddress}</p>
        {data.signature && (
          <p className="text-xs truncate mt-1">Transaction: {data.signature}</p>
        )}
        {data.metadataUri && (
          <p className="text-xs truncate mt-1">
            <a 
              href={data.metadataUri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Metadata
            </a>
          </p>
        )}
        {data.imageIpfsUrl && (
          <div className="mt-2 flex justify-center">
            <img 
              src={data.imageIpfsUrl} 
              alt={name || 'Token'} 
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
  
  const additionalContent = (
    <div className="px-3 pb-3">      
      {/* Mint button */}
      <div className="mt-4">
        <button
          onClick={handleMintToken}
          disabled={isLoading || !name || !symbol || (!selectedImageFile && !data.imageIpfsUrl)}
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
        metadata={nodeTypesMetadata['MINT']}
        inputs={inputs}
        output={output}
        data={data}
        onInputChange={handleInputChange}
        additionalContent={additionalContent}
      />
    </>
  );
};