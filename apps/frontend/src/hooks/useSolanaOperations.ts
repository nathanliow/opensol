import { useState, useCallback } from 'react';
import { 
  Connection, 
  clusterApiUrl,
} from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useConfig } from '@/contexts/ConfigContext';
import { SolanaOperationOptions, SolanaOperationResult } from '@/types/SolanaOperationTypes';
import { executeMintToken, MintTokenParams } from '../../../backend/src/block-functions/blockchain/mint/mintToken';
import { executeTransferToken, TransferTokenParams } from '../../../backend/src/block-functions/blockchain/transfer/transferToken';

type OperationParams = MintTokenParams | TransferTokenParams | Record<string, any>;

export const useSolanaOperations = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network } = useConfig();
  const [loading, setLoading] = useState(false);

  const getConnection = useCallback((requiresMainnet = false) => {
    const networkType = requiresMainnet ? 'mainnet-beta' : network === 'mainnet' ? 'mainnet-beta' : network;
    return new Connection(clusterApiUrl(networkType));
  }, [network]);

  const executeSolanaOperation = useCallback(async (
    operationType: string,
    params: OperationParams,
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
        return await executeMintToken(params as MintTokenParams & { connection: Connection; wallet: any; walletAddress: string }, options);
      case 'transferToken':
        return await executeTransferToken(params as TransferTokenParams & { connection: Connection; wallet: any; walletAddress: string }, options);
      case 'getAccount':
        return await executeGetAccount(params, options);
      case 'createAccount':
        return await executeCreateAccount(params, options);
      case 'createMint':
        return await executeCreateMint(params, options);
      default:
        throw new Error(`Unknown Solana operation: ${operationType}`);
    }
  };

  const executeGetAccount = async (
    params: Record<string, any>,
    options: SolanaOperationOptions
  ) => {
    const { connection, address, commitment = 'confirmed', programId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' } = params;

    try {
      // Dynamic imports for Solana SPL Token functionality
      const { getAccount, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
      const { PublicKey } = await import('@solana/web3.js');

        const addressPubkey = new PublicKey(address);
        const programIdPubkey = programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' 
          ? TOKEN_PROGRAM_ID 
          : new PublicKey(programId);
        
        const accountInfo = await getAccount(
          connection,
          addressPubkey,
          commitment as any,
          programIdPubkey
        );
      
      return {
        data: {
          success: true,
          address: accountInfo.address.toString(),
          mint: accountInfo.mint.toString(),
          owner: accountInfo.owner.toString(),
          amount: accountInfo.amount.toString(),
          delegate: accountInfo.delegate?.toString() || null,
          delegatedAmount: accountInfo.delegatedAmount.toString(),
          isInitialized: accountInfo.isInitialized,
          isFrozen: accountInfo.isFrozen,
          isNative: accountInfo.isNative,
          rentExemptReserve: accountInfo.rentExemptReserve?.toString() || null,
          closeAuthority: accountInfo.closeAuthority?.toString() || null,
          commitment
        },
        signature: undefined // getAccount is a read operation, no signature
      };
    } catch (error) {
      throw new Error(`Error getting account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  
  const executeCreateMint = async (
    params: Record<string, any>,
    options: SolanaOperationOptions
  ) => {
    const { connection, mintAuthority, freezeAuthority, decimals = 9, keypair, commitment = 'confirmed', programId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' } = params;

    if (options.requiresSigning) {
      try {
        // Dynamic imports for Solana SPL Token functionality
        const { createMint, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
        const { PublicKey, Keypair } = await import('@solana/web3.js');
        const bs58Module = await import('bs58');
        const bs58 = bs58Module.default || bs58Module;

        const mintAuthorityPubkey = new PublicKey(mintAuthority);
        const freezeAuthorityPubkey = freezeAuthority ? new PublicKey(freezeAuthority) : null;
        const programIdPubkey = programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' 
          ? TOKEN_PROGRAM_ID 
          : new PublicKey(programId);
          
        const keypairObj = keypair ? Keypair.fromSecretKey(bs58.decode(keypair)) : undefined;
        const payerKeypair = params.wallet; // Use connected wallet as payer
        
        const newMintPubkey = await createMint(
          connection,
          payerKeypair,
          mintAuthorityPubkey,
          freezeAuthorityPubkey,
          decimals,
          keypairObj,
          { commitment: commitment as any },
          programIdPubkey
        );
        
        return {
          data: {
            success: true,
            publicKey: newMintPubkey.toString(),
            mintAuthority: mintAuthority,
            freezeAuthority: freezeAuthority,
            decimals: decimals,
            commitment
          },
          signature: undefined // createMint returns PublicKey, not transaction signature
        };
      } catch (error) {
        throw new Error(`Error creating mint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Non-signing operation (read-only)
      return {
        data: {
          success: true,
          message: 'Mint creation requires signing',
          mintAuthority,
          freezeAuthority,
          decimals,
          commitment
        },
        signature: undefined
      };
    }
  };

  const executeCreateAccount = async (
    params: Record<string, any>,
    options: SolanaOperationOptions
  ) => {
    const { connection, mint, owner, keypair, commitment = 'confirmed', programId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' } = params;

    if (options.requiresSigning) {
      try {
        // Dynamic imports for Solana SPL Token functionality
        const { createAccount, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
        const { PublicKey, Keypair } = await import('@solana/web3.js');
        const bs58Module = await import('bs58');
        const bs58 = bs58Module.default || bs58Module;

        const mintPubkey = new PublicKey(mint);
        const ownerPubkey = new PublicKey(owner);
        const programIdPubkey = programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' 
          ? TOKEN_PROGRAM_ID 
          : new PublicKey(programId);
          
        const keypairObj = keypair ? Keypair.fromSecretKey(bs58.decode(keypair)) : undefined;
        const payerKeypair = params.wallet; // Use connected wallet as payer
        
        const newAccountPubkey = await createAccount(
          connection,
          payerKeypair,
          mintPubkey,
          ownerPubkey,
          keypairObj,
          { commitment: commitment as any },
          programIdPubkey
        );
        
        return {
          data: {
            success: true,
            publicKey: newAccountPubkey.toString(),
            mint: mint,
            owner: owner,
            commitment
          },
          signature: undefined // createAccount returns PublicKey, not transaction signature
        };
      } catch (error) {
        throw new Error(`Error creating token account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Non-signing operation (read-only)
      return {
        data: {
          success: true,
          message: 'Token account creation requires signing',
          mint,
          owner,
          commitment
        },
        signature: undefined
      };
    }
  };

  // Convenience methods for specific operations
  const mintToken = useCallback(async (params: MintTokenParams): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('mintToken', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  const transferToken = useCallback(async (params: TransferTokenParams): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('transferToken', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  const getAccount = useCallback(async (params: Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('getAccount', params, { requiresSigning: false });
  }, [executeSolanaOperation]);

  const createAccount = useCallback(async (params: Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('createAccount', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  const createMint = useCallback(async (params: Record<string, any>): Promise<SolanaOperationResult> => {
    return executeSolanaOperation('createMint', params, { requiresSigning: true });
  }, [executeSolanaOperation]);

  return {
    executeSolanaOperation,
    mintToken,
    transferToken,
    getAccount,
    createAccount,
    createMint,
    loading
  };
};