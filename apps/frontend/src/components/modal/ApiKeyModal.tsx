import { useState, useEffect } from "react";
import { useConfig } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal = ({ isOpen, onClose }: ApiKeyModalProps) => {
  const { apiKeys, setApiKey } = useConfig();
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');

  useEffect(() => {
    // Update local state when apiKeys context changes
    setHeliusApiKey(apiKeys['helius'] || '');
    setOpenaiApiKey(apiKeys['openai'] || '');
    setBirdeyeApiKey(apiKeys['birdeye'] || '');
  }, [apiKeys]);

  const handleApiKeySave = (provider: string, key: string) => {
    setApiKey(provider, key);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/70" 
      onClick={onClose}
    >
      <div 
        className="bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">API Keys</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <Icons.FiX size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="helius">
              Helius API Key
              <a href="https://dev.helius.xyz/dashboard/app" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                <Icons.FiInfo size={12} />
              </a>
            </label>
            <input 
              id="helius"
              type="password" 
              className="w-full text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
              value={heliusApiKey}
              onChange={(e) => setHeliusApiKey(e.target.value)}
              onBlur={() => handleApiKeySave('helius', heliusApiKey)}
              placeholder="Your Helius API key"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="openai">
              OpenAI API Key
              <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                <Icons.FiInfo size={12} />
              </a>
            </label>
            <input 
              id="openai"
              type="password" 
              className="w-full text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              onBlur={() => handleApiKeySave('openai', openaiApiKey)}
              placeholder="Your OpenAI API key"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="birdeye">
              Birdeye API Key
              <a href="https://docs.birdeye.so/reference/overview" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                <Icons.FiInfo size={12} />
              </a>
            </label>
            <input 
              id="birdeye"
              type="password" 
              className="w-full text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
              value={birdeyeApiKey}
              onChange={(e) => setBirdeyeApiKey(e.target.value)}
              onBlur={() => handleApiKeySave('birdeye', birdeyeApiKey)}
              placeholder="Your Birdeye API key"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};