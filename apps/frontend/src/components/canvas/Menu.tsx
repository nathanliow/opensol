import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig, Network } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { signOut } from "@/lib/auth";

interface MenuProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const Menu = ({ onMenuToggle }: MenuProps) => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
  const { network, setNetwork, apiKeys, setApiKey } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [heliusApiKey, setHeliusApiKey] = useState(apiKeys['helius'] || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(apiKeys['openai'] || '');
  const [birdeyeApiKey, setBirdeyeApiKey] = useState(apiKeys['birdeye'] || '');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        
        if (onMenuToggle) {
          onMenuToggle(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isOpen, onMenuToggle]);

  const handleNetworkChange = (newNetwork: Network) => {
    setNetwork(newNetwork);
  };

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (onMenuToggle) {
      onMenuToggle(newIsOpen);
    }
  };

  const handleApiKeySave = (provider: string, key: string) => {
    setApiKey(provider, key);
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

  const navigateToDashboard = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  return (
    <>
      <Panel position="top-right">
        <div ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center w-10 h-10 bg-[#1E1E1E] hover:bg-[#2D2D2D] border border-[#333333] rounded-lg shadow-lg text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <Icons.FiX size={20} /> : <Icons.FiMenu size={20} />}
          </button>

          {isOpen && (
            <div className="absolute top-12 right-0 w-64 max-h-[calc(100vh-150px)] overflow-y-auto p-2 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50">
              {userAddress && (
                <div className="py-3 px-3 border-b border-[#333333] text-xs">
                  <div className="font-medium text-gray-300">Connected Wallet</div>
                  <div className="mt-1 font-mono text-gray-400 truncate">{userAddress}</div>
                </div>
              )}
              <div>
                <div className="py-1">
                  <button
                    onClick={navigateToDashboard}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    disabled={!supabaseUser}
                  >
                    <Icons.FiFolder size={16} />
                    Go to Dashboard
                  </button>
                </div>
                <div className="border-t border-[#333333] py-3">
                  <div className="text-xs text-gray-400 px-3 pb-1">Network</div>
                  <div className="flex flex-col gap-1">
                    <button
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'mainnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('mainnet')}
                    >
                      Mainnet
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'devnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('devnet')}
                    >
                      Devnet
                    </button>
                  </div>
                </div>

                {/* API Keys */}
                <div className="border-t border-[#333333] py-3 px-3">
                  <div className="text-xs text-gray-400 pb-1">API Keys</div>
                  <div className="">
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
                          handleApiKeySave('helius', e.target.value);
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
                          handleApiKeySave('openai', e.target.value);
                        }}
                        onBlur={() => handleApiKeySave('openai', openaiApiKey)}
                        placeholder="Your OpenAI API key"
                      />
                    </div>
                    <div className="">
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
                          handleApiKeySave('birdeye', e.target.value);
                        }}
                        onBlur={() => handleApiKeySave('birdeye', birdeyeApiKey)}
                        placeholder="Your Birdeye API key"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#333333] py-1">
                  {!supabaseUser && (
                    <button
                      onClick={login}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md"
                    >
                      Connect Wallet
                    </button>
                  )}
                  {supabaseUser && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    >
                      <Icons.FiLogOut size={16} />
                      Disconnect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
};

export default Menu;