import { useCallback, useState, ChangeEvent } from 'react';
import TemplateNode from '../TemplateNode';
import { InputDefinition } from '../../../types/InputTypes';
import { nodeTypesData } from '../../../types/NodeTypes';

interface MintNodeProps {
  id: string;
  data: {
    label?: string;
    name?: string;
    symbol?: string;
    description?: string;
    image?: string;
    mintAddress?: string;
    mintStatus?: string;
  };
  setNodeData: (id: string, data: any) => void;
}

export default function MintNode({ id, data, setNodeData }: MintNodeProps) {
  const nodeType = nodeTypesData['MINT'];
  const backgroundColor = nodeType?.backgroundColor;
  const borderColor = nodeType?.borderColor;
  const primaryColor = nodeType?.primaryColor;
  const secondaryColor = nodeType?.secondaryColor;
  const textColor = nodeType?.textColor;
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Define inputs for token minting
  const inputs: InputDefinition[] = [
    {
      id: 'name',
      label: 'Token Name',
      type: 'text',
      defaultValue: data.name || ''
    },
    {
      id: 'symbol',
      label: 'Symbol',
      type: 'text',
      defaultValue: data.symbol || ''
    },
    {
      id: 'description',
      label: 'Description',
      type: 'text',
      defaultValue: data.description || ''
    },
    {
      id: 'image',
      label: 'Image URL',
      type: 'text',
      defaultValue: data.image || '',
      // Custom component to handle disabled state
      getConnectedValue: uploading ? () => 'Uploading...' : undefined
    }
  ];
  
  const handleInputChange = useCallback((inputId: string, value: any) => {
    console.log(`Mint parameter ${inputId} changed to ${value}`);
    setNodeData(id, { 
      ...data, 
      [inputId]: value 
    });
  }, [id, data, setNodeData]);
  
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept image files
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // In a real implementation, this would upload to Filebase or another service
      // For demo purposes, we're creating a data URL
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result as string;
        // In a real implementation, here's where we'd upload to Filebase and get a URL
        // For now, we'll just use the data URL as a placeholder
        handleInputChange('image', imageDataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Error reading the file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError('Failed to upload image');
      setUploading(false);
    }
  };
  
  // Show token mint result if minting is complete
  const renderMintResult = () => {
    if (!data.mintAddress) return null;
    
    return (
      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md mt-2">
        <h3 className="text-sm font-semibold mb-1">Token Minted!</h3>
        <p className="text-xs truncate">Address: {data.mintAddress}</p>
        {data.image && (
          <div className="mt-2 flex justify-center">
            <img 
              src={data.image} 
              alt={data.name || 'Token'} 
              className="w-24 h-24 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>
    );
  };
  
  // Additional content to show below the standard inputs
  const additionalContent = (
    <div className="px-3 pb-3">
      {/* Image upload input */}
      <div className="mt-2">
        <label className="block text-xs font-medium mb-1">
          Upload Token Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:py-1 file:px-4 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploadError && (
          <p className="mt-1 text-xs text-red-500">{uploadError}</p>
        )}
        {uploading && (
          <p className="mt-1 text-xs text-blue-500">Uploading...</p>
        )}
      </div>
      
      {/* Mint result */}
      {renderMintResult()}
    </div>
  );
  
  return (
    <TemplateNode
      id={id}
      title="MINT"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textColor={textColor}
      inputs={inputs}
      data={data}
      onInputChange={handleInputChange}
      output={{
        type: 'object',
        description: 'Minted token with address and metadata'
      }}
    />
  );
}
