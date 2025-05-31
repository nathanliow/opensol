import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "../../contexts/ConfigContext";
import { Icons } from "../icons/icons";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { signOut } from "@/lib/auth";
import { ApiKeyModal } from "../modal/ApiKeyModal";
import { NetworkType } from "@/types/NetworkTypes";
import { useLesson } from "@/contexts/LessonContext";

interface MenuProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export const Menu = ({ onMenuToggle }: MenuProps) => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
  const { network, setNetwork } = useConfig();
  const { exitLesson } = useLesson();
  const [isOpen, setIsOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
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

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  };

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (onMenuToggle) {
      onMenuToggle(newIsOpen);
    }
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
    exitLesson();
  };

  const openApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
    setIsOpen(false);
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
                    className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                    disabled={!supabaseUser}
                  >
                    <Icons.FiFolder size={16} />
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => window.open('https://opensol-2.gitbook.io/opensol', '_blank')}
                    className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                  >
                    <Icons.FiBook size={16} />
                    Documentation
                  </button>
                </div>
                <div className="border-t border-[#333333] py-3">
                  <div className="text-xs text-gray-400 px-3 pb-1">Network</div>
                  <div className="flex flex-col gap-1">
                    <button
                      className={`cursor-pointer w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'mainnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('mainnet')}
                    >
                      Mainnet
                    </button>
                    <button
                      className={`cursor-pointer w-full text-left px-3 py-1.5 text-xs rounded-md ${network === 'devnet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#2D2D2D]'}`}
                      onClick={() => handleNetworkChange('devnet')}
                    >
                      Devnet
                    </button>
                  </div>
                </div>

                {/* API Keys Button */}
                <div className="border-t border-[#333333] py-1">
                  <button
                    onClick={openApiKeyModal}
                    className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
                  >
                    <Icons.FiKey size={16} />
                    Manage API Keys
                  </button>
                </div>

                <div className="border-t border-[#333333] py-1">
                  {!supabaseUser && (
                    <button
                      onClick={login}
                      className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md"
                    >
                      Connect Wallet
                    </button>
                  )}
                  {supabaseUser && (
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
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
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </>
  );
};