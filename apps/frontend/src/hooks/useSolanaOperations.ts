import { useState, useCallback } from 'react';
import { 
  Connection, 
  clusterApiUrl,
} from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useConfig } from '@/contexts/ConfigContext';
import { SolanaOperationOptions, SolanaOperationResult } from '@/types/SolanaOperationTypes';
import { executeMintToken, MintTokenParams } from './functions/mintToken';
import { executeTransferToken, TransferTokenParams } from './functions/transferToken';
import { executeGetAccount } from './functions/solana/executeGetAccount';

export const useSolanaOperations = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network, apiKeys } = useConfig();
  const [loading, setLoading] = useState(false);

  const getConnection = useCallback((requiresMainnet = false) => {
    const networkType = requiresMainnet ? 'mainnet-beta' : network === 'mainnet' ? 'mainnet-beta' : network;
    
    // Use Helius RPC if API key is available
    const heliusApiKey = apiKeys?.helius?.key;
    if (heliusApiKey && heliusApiKey.trim() !== '') {
      let heliusUrl: string;
      switch (networkType) {
        case 'mainnet-beta':
          heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
          break;
        case 'devnet':
        default:
          heliusUrl = `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`;
          break;
      }
      return new Connection(heliusUrl);
    }
    
    return new Connection(clusterApiUrl(networkType));
  }, [network, apiKeys]);

  const executeSolanaOperation = useCallback(async (
    operationType: string,
    params: Record<string, any>,
    options: SolanaOperationOptions = {}
  ): Promise<SolanaOperationResult> => {
    try {
      setLoading(true);

      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      if (options.requiresSigning && (!ready || !solanaWallet?.address)) {
        throw new Error('Solana wallet not ready');
      }

      const connection = getConnection(options.requiresMainnet);

      // Enhanced parameters with connection and wallet info
      const enhancedParams = {
        ...params,
        connection,
        network: options.requiresMainnet ? 'mainnet' : network,
        walletAddress: solanaWallet?.address,
        wallet: solanaWallet
      };

      // Execute the operation based on operationType
      const result = await executeOperationByType(operationType, enhancedParams, options);

      return {
        success: true,
        data: result.data,
        signature: result.signature || undefined
      };

    } catch (error) {
      console.error(`Error executing ${operationType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  }, [authenticated, ready, solanaWallet, network, getConnection]);

  const executeOperationByType = async (
    operationType: string,
    params: Record<string, any>,
    options: SolanaOperationOptions
  ) => {
    switch (operationType) {
      case 'mintToken':
        return await executeMintToken(params as MintTokenParams & { connection: Connection; wallet: any; walletAddress: string; }, options);
      case 'transferToken':
        return await executeTransferToken(params as TransferTokenParams & { connection: Connection; wallet: any; walletAddress: string; }, options);
      case 'getAccount':
        return await executeGetAccount(params, options);
      default:
        throw new Error(`Unknown Solana operation: ${operationType}`);
    }
  };

  // Convenience methods for specific operations
  const mintToken = useCallback(async (params: MintTokenParams & Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('mintToken', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  const transferToken = useCallback(async (params: TransferTokenParams & Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('transferToken', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  const getAccount = useCallback(async (params: Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('getAccount', params, { requiresSigning: false });
  }, [executeSolanaOperation]);

  return {
    executeSolanaOperation,
    mintToken,
    transferToken,
    getAccount,
    loading
  };
};