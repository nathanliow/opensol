import { usePrivy } from "@privy-io/react-auth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "../icons/icons";
import { signOut } from "@/lib/auth";
import { useUserAccountContext } from "@/app/providers/UserAccountContext";
import { ApiKeyModal } from "../modal/ApiKeyModal";

export const DashboardMenu = () => {
  const { login, logout } = usePrivy();
  const { userAddress, supabaseUser } = useUserAccountContext();
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

  const navigateToProfile = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  const openApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
    setIsOpen(false);
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
        <div className="absolute top-12 right-0 w-64 max-h-[calc(100vh-150px)] overflow-y-auto p-2 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50">
          {userAddress && (
            <button
              onClick={navigateToProfile}
              className="cursor-pointer w-full text-left p-3 border-b border-[#333333] text-xs hover:bg-[#2D2D2D] rounded-md transition-colors"
            >
              <div className="font-medium text-gray-300">Connected Wallet</div>
              <div className="mt-1 font-mono text-gray-400 truncate">{userAddress}</div>
            </button>
          )}

          <div className="py-1">
            <button
              onClick={() => router.push('/dashboard')}
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
          {/* API Keys Button */}
          <div className="py-1">
            <button
              onClick={openApiKeyModal}
              className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
            >
              <Icons.FiKey size={16} />
              Manage API Keys
            </button>
          </div>

          <div className="border-t border-[#333333] py-1">
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2D2D2D] rounded-md flex items-center gap-2"
            >
              <Icons.FiLogOut size={16} />
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};