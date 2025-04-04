'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Network = 'mainnet' | 'devnet';

interface ConfigContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  // Initialize state from localStorage if available
  const [network, setNetworkState] = useState<Network>(() => {
    if (typeof window !== 'undefined') {
      const savedNetwork = localStorage.getItem('network');
      return (savedNetwork as Network) || 'devnet';
    }
    return 'devnet';
  });

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const savedApiKeys = localStorage.getItem('apiKeys');
      return savedApiKeys ? JSON.parse(savedApiKeys) : {};
    }
    return {};
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('network', network);
    }
  }, [network]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork);
  };

  const setApiKey = (provider: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  const getApiKey = (provider: string) => {
    return apiKeys[provider] || null;
  };

  return (
    <ConfigContext.Provider
      value={{
        network,
        setNetwork,
        apiKeys,
        setApiKey,
        getApiKey
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}; 