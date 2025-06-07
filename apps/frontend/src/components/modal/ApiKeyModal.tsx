import { useState, useEffect } from "react";
import { useConfig } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { 
  ApiKey, 
  ApiKeyType, 
  HeliusApiKeyTiers, 
  BirdeyeApiKeyTiers 
} from "@/types/KeyTypes";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal = ({ isOpen, onClose }: ApiKeyModalProps) => {
  const { apiKeys, setApiKey } = useConfig();
  const [heliusApiKey, setHeliusApiKey] = useState<ApiKey>(apiKeys['helius'] || { key: '', tier: null });
  const [openaiApiKey, setOpenaiApiKey] = useState<ApiKey>(apiKeys['openai'] || { key: '', tier: null });
  const [birdeyeApiKey, setBirdeyeApiKey] = useState<ApiKey>(apiKeys['birdeye'] || { key: '', tier: null });

  useEffect(() => {
    // Update local state when apiKeys context changes
    setHeliusApiKey(apiKeys['helius'] || { key: '', tier: null });
    setOpenaiApiKey(apiKeys['openai'] || { key: '', tier: null });
    setBirdeyeApiKey(apiKeys['birdeye'] || { key: '', tier: null });
  }, [apiKeys]);

  const handleApiKeySave = (provider: ApiKeyType, apiKey: ApiKey) => {
    setApiKey(provider, apiKey);
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
            <div className="flex gap-2">
              <input 
                id="helius"
                type="password" 
                className="w-full text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                value={heliusApiKey.key}
                onChange={(e) => setHeliusApiKey({...heliusApiKey, key: e.target.value})}
                onBlur={() => handleApiKeySave('helius', heliusApiKey)}
                placeholder="Your Helius API key"
              />
              <select
                className="text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 min-w-[120px]"
                value={heliusApiKey.tier || ''}
                onChange={(e) => {
                  const tier = e.target.value as HeliusApiKeyTiers | '';
                  setHeliusApiKey({...heliusApiKey, tier: tier || null});
                  handleApiKeySave('helius', {...heliusApiKey, tier: tier || null});
                }}
              >
                <option value="">Select Tier</option>
                <option value="free">Free</option>
                <option value="developer">Developer</option>
                <option value="business">Business</option>
                <option value="professional">Professional</option>
              </select>
            </div>
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
              value={openaiApiKey.key}
              onChange={(e) => setOpenaiApiKey({...openaiApiKey, key: e.target.value})}
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
            <div className="flex gap-2">
              <input 
                id="birdeye"
                type="password" 
                className="w-full text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                value={birdeyeApiKey.key}
                onChange={(e) => setBirdeyeApiKey({...birdeyeApiKey, key: e.target.value})}
                onBlur={() => handleApiKeySave('birdeye', birdeyeApiKey)}
                placeholder="Your Birdeye API key"
              />
              <select
                className="text-xs px-2 py-2 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500 min-w-[120px]"
                value={birdeyeApiKey.tier || ''}
                onChange={(e) => {
                  const tier = e.target.value as BirdeyeApiKeyTiers | '';
                  setBirdeyeApiKey({...birdeyeApiKey, tier: tier || null});
                  handleApiKeySave('birdeye', {...birdeyeApiKey, tier: tier || null});
                }}
              >
                <option value="">Select Tier</option>
                <option value="standard">Standard</option>
                <option value="starter">Starter</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
              </select>
            </div>
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