import { usePrivy } from "@privy-io/react-auth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { signOut } from "@/lib/auth";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";

interface DashboardMenuProps {
  onNewProject: () => void;
}

const DashboardMenu = ({ onNewProject }: DashboardMenuProps) => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
  const { network, setNetwork, apiKeys, setApiKey } = useConfig();
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      localStorage.removeItem('currentProjectId');
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleApiKeySave = (provider: string, key: string) => {
    setApiKey(provider, key);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333333] rounded-lg shadow-lg text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <Icons.FiX size={20} /> : <Icons.FiMenu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 max-h-[calc(35vh)] bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg overflow-hidden overflow-y-auto z-50">
          {userAddress && (
            <div className="p-3 border-b border-[#333333] text-xs">
              <div className="font-medium text-gray-300">Connected Wallet</div>
              <div className="mt-1 font-mono text-gray-400 truncate">{userAddress}</div>
            </div>
          )}

          {/* API Keys */}
          <div className="mt-2 pt-2">
            <div className="text-xs text-gray-400 px-3 pb-1">API Keys</div>
            <div className="px-3 pb-2">
              <div className="mb-1.5 mt-1">
                <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="helius">
                  Helius API Key
                  <a href="https://dev.helius.xyz/dashboard/app" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                    <Icons.FiInfo size={12} />
                  </a>
                </label>
                <input 
                  id="helius"
                  type="password" 
                  className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                  value={heliusApiKey}
                  onChange={(e) => {
                    setHeliusApiKey(e.target.value);
                    handleApiKeySave('helius', heliusApiKey);
                  }}
                  onBlur={() => handleApiKeySave('helius', heliusApiKey)}
                  placeholder="Your Helius API key"
                />
              </div>
              <div className="mb-1.5">
                <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="openai">
                  OpenAI API Key
                  <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                    <Icons.FiInfo size={12} />
                  </a>
                </label>
                <input 
                  id="openai"
                  type="password" 
                  className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                  value={openaiApiKey}
                  onChange={(e) => {
                    setOpenaiApiKey(e.target.value);
                    handleApiKeySave('openai', openaiApiKey);
                  }}
                  onBlur={() => handleApiKeySave('openai', openaiApiKey)}
                  placeholder="Your OpenAI API key"
                />
              </div>
              <div className="mb-1.5">
                <label className="block text-xs text-gray-400 mb-1 flex items-center" htmlFor="birdeye">
                  Birdeye API Key
                  <a href="https://docs.birdeye.so/reference/overview" target="_blank" rel="noopener noreferrer" className="inline-flex ml-1">
                    <Icons.FiInfo size={12} />
                  </a>
                </label>
                <input 
                  id="birdeye"
                  type="password" 
                  className="w-full text-xs px-2 py-1 bg-[#2D2D2D] border border-[#333333] rounded-md focus:outline-none focus:border-blue-500" 
                  value={birdeyeApiKey}
                  onChange={(e) => {
                    setBirdeyeApiKey(e.target.value); 
                    handleApiKeySave('birdeye', birdeyeApiKey);
                  }}
                  onBlur={() => handleApiKeySave('birdeye', birdeyeApiKey)}
                  placeholder="Your Birdeye API key"
                />
              </div>
            </div>
          </div>

          <div className="">
            <div className="border-t border-[#333333] my-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
              >
                <Icons.FiLogOut size={16} />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMenu; 