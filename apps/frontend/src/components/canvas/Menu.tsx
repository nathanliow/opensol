"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfig, Network } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";

interface MenuProps {
  onExport: () => any;
  onImport: (flowData: any) => void;
}

const Menu = ({ onExport, onImport }: MenuProps) => {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const { network, setNetwork, apiKeys, setApiKey } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork);
  };

  const handleApiKeySave = (provider: string, key: string) => {
    setApiKey(provider, key);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleExport = () => {
    const flowData = onExport();
    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flow_${new Date().toISOString()}.os`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result as string);
          onImport(flowData);
        } catch (error) {
          console.error('Error parsing flow file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Panel position="top-right">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333333] rounded-lg shadow-lg text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <Icons.FiX size={20} /> : <Icons.FiMenu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-60 max-h-[calc(35vh)] bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg overflow-hidden overflow-y-auto">
          {user && (
            <div className="p-3 border-b border-[#333333]">
              <span className="block text-sm text-gray-300 truncate text-center">
                {user.email?.address || user.wallet?.address?.slice(0, 4) + '...' + user.wallet?.address?.slice(-4)}
              </span>
            </div>
          )}

          <div className="p-3">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Flow Actions</h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleExport}
                  className="flex-1 text-xs bg-[#2D2D2D] hover:bg-[#333333] text-white px-3 py-2 rounded-md"
                >
                  Export Flow
                </button>
                <button
                  onClick={handleImportClick}
                  className="flex-1 text-xs bg-[#2D2D2D] hover:bg-[#333333] text-white px-3 py-2 rounded-md"
                >
                  Import Flow
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".os"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Network</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleNetworkChange('devnet')}
                  className={`px-3 py-1.5 text-xs rounded-md flex-1 ${
                    network === 'devnet' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#2D2D2D] hover:bg-[#333333] text-gray-300'
                  }`}
                >
                  Devnet
                </button>
                <button
                  onClick={() => handleNetworkChange('mainnet')}
                  className={`px-3 py-1.5 text-xs rounded-md flex-1 ${
                    network === 'mainnet' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#2D2D2D] hover:bg-[#333333] text-gray-300'
                  }`}
                >
                  Mainnet
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">API Keys</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Helius API Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={heliusApiKey} 
                      onChange={(e) => setHeliusApiKey(e.target.value)}
                      className="text-xs p-2 bg-[#2D2D2D] border border-[#333333] rounded-md text-white flex-1"
                      placeholder="Enter Helius API key"
                    />
                    <button 
                      onClick={() => handleApiKeySave('helius', heliusApiKey)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">OpenAI API Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={openaiApiKey} 
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="text-xs p-2 bg-[#2D2D2D] border border-[#333333] rounded-md text-white flex-1"
                      placeholder="Enter OpenAI API key"
                    />
                    <button 
                      onClick={() => handleApiKeySave('openai', openaiApiKey)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Birdeye API Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={birdeyeApiKey} 
                      onChange={(e) => setBirdeyeApiKey(e.target.value)}
                      className="text-xs p-2 bg-[#2D2D2D] border border-[#333333] rounded-md text-white flex-1"
                      placeholder="Enter Birdeye API key"
                    />
                    <button 
                      onClick={() => handleApiKeySave('birdeye', birdeyeApiKey)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
};

export default Menu;