'use client';

import { NetworkType } from '@/types/NetworkTypes';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiKey, ApiKeyType, HeliusApiKeyTiers, BirdeyeApiKeyTiers } from '@/types/KeyTypes';

interface ConfigContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  apiKeys: Record<ApiKeyType, ApiKey>;
  setApiKey: (provider: ApiKeyType, key: ApiKey) => void;
  getApiKey: (provider: ApiKeyType) => ApiKey | null;
  hasRequiredKeyTier: (provider: ApiKeyType, requiredTiers: Array<HeliusApiKeyTiers | BirdeyeApiKeyTiers>) => boolean;
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
  const [network, setNetworkState] = useState<NetworkType>(() => {
    if (typeof window !== 'undefined') {
      const savedNetwork = localStorage.getItem('network');
      return (savedNetwork as NetworkType) || 'devnet';
    }
    return 'devnet';
  });

  const [apiKeys, setApiKeys] = useState<Record<ApiKeyType, ApiKey>>(() => {
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

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  };

  const setApiKey = (provider: ApiKeyType, key: ApiKey) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        key: String(key.key),
        tier: key.tier
      }
    }));
  };

  const getApiKey = (provider: ApiKeyType) => {
    return apiKeys[provider] || null;
  };

  const hasRequiredKeyTier = (provider: ApiKeyType, requiredTiers: Array<HeliusApiKeyTiers | BirdeyeApiKeyTiers>) => {
    const apiKey = apiKeys[provider];
    if (!apiKey || !apiKey.tier) return false;
    
    return requiredTiers.includes(apiKey.tier as any);
  };

  return (
    <ConfigContext.Provider
      value={{
        network,
        setNetwork,
        apiKeys,
        setApiKey,
        getApiKey,
        hasRequiredKeyTier
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}; 