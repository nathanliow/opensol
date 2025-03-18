"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Panel } from "@xyflow/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Network = 'mainnet' | 'devnet';

export default function Menu() {
  const [showMenu, setShowMenu] = useState(false);
  const [network, setNetwork] = useState<Network>('mainnet');
  const { login, authenticated, user, logout } = usePrivy();
  const router = useRouter();

  const navigateToProjects = () => {
    router.push('/projects');
    setShowMenu(false);
  };

  return (
    <Panel position="top-right" className="bg-[#121212] rounded-b-md p-2 shadow-md">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-md bg-[#121212] hover:bg-gray-700 transition"
        title="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#121212] rounded-md shadow-lg z-20">
          <div className="px-4 py-2 border-b border-gray-700">
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="w-full bg-gray-800 text-white rounded px-2 py-1 text-sm"
            >
              <option value="mainnet">Mainnet</option>
              <option value="devnet">Devnet</option>
            </select>
          </div>
          
          {authenticated && (
            <button
              onClick={navigateToProjects}
              className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md"
            >
              My Projects
            </button>
          )}
          
          {!authenticated ? (
            <button
              onClick={login}
              className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-700"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}