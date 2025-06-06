import { 
  Connection, 
  Transaction, 
  PublicKey, 
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
} from "@solana/spl-token";
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useConfig } from '@/contexts/ConfigContext';

export async function createTokenTransferTransaction(
  connection: Connection,
  amount: number,
  recipientAddress: string,
  senderAddress: string,
  tokenMint: string,
): Promise<Transaction> {
  try {
    const mintInfo = await getMint(connection, new PublicKey(tokenMint));
    const transferAmount = BigInt(amount * 10 ** mintInfo.decimals);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      sender
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      recipient
    );

    const transaction = new Transaction();

    // Check if recipient token account exists
    const recipientTokenAccountInfo = await connection.getAccountInfo(toTokenAddress);
    
    // If recipient token account doesn't exist, add instruction to create it
    if (!recipientTokenAccountInfo) {
      console.log('Creating recipient token account');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender, // payer
          toTokenAddress, // associatedToken
          recipient, // owner
          new PublicKey(tokenMint) // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAddress,
        toTokenAddress,
        sender,
        Number(transferAmount)
      )
    );

    return transaction;
  } catch (error) {
    console.error('Error creating token transfer transaction:', error);
    throw error;
  }
};

export const useTokenTransfer = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network } = useConfig();

  async function transferToken(
    tokenAddress: string,
    amount: number,
    recipientAddress: string,
    requireMainnet?: boolean
  ): Promise<{
    success: boolean;
    signature: string;
    recipientAddress: string;
    amount: number;
    tokenAddress: string;
  }> {
    try {
      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      if (!ready || !solanaWallet?.address) {
        throw new Error('Solana wallet not ready');
      }

      // Create connection to Solana devnet
      const networkType = requireMainnet ? 'mainnet-beta' : network === 'mainnet' ? 'mainnet-beta' : network;
      const connection = new Connection(clusterApiUrl(networkType));

      // Create the transaction
      const transaction = await createTokenTransferTransaction(
        connection,
        amount,
        recipientAddress,
        solanaWallet.address,
        tokenAddress,
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(solanaWallet.address);

      // Sign and send the transaction using Solana wallet
      const signedTx = await solanaWallet.signTransaction!(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      return { 
        success: true,
        signature,
        recipientAddress,
        amount,
        tokenAddress
      };
    } catch (error) {
      console.error('Error sending token:', error);
      throw error;
    }
  };

  return { transferToken };
};

export const transferTokenString = `// Example uses Privy to access connected wallet, 
// details may change using other wallet providers
import { 
  Connection, 
  Transaction, 
  PublicKey, 
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
} from "@solana/spl-token";
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

// Helper function to create a token transfer transaction
export async function createTokenTransferTransaction(
  connection: Connection,
  amount: number,
  recipientAddress: string,
  senderAddress: string,
  tokenMint: string,
): Promise<Transaction> {
  try {
    const mintInfo = await getMint(connection, new PublicKey(tokenMint));
    const transferAmount = BigInt(amount * 10 ** mintInfo.decimals);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      sender
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      recipient
    );

    const transaction = new Transaction();

    // Check if recipient token account exists
    const recipientTokenAccountInfo = await connection.getAccountInfo(toTokenAddress);
    
    // If recipient token account doesn't exist, add instruction to create it
    if (!recipientTokenAccountInfo) {
      console.log('Creating recipient token account');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender, // payer
          toTokenAddress, // associatedToken
          recipient, // owner
          new PublicKey(tokenMint) // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAddress,
        toTokenAddress,
        sender,
        Number(transferAmount)
      )
    );

    return transaction;
  } catch (error) {
    console.error('Error creating token transfer transaction:', error);
    throw error;
  }
};

const { authenticated } = usePrivy();
const { ready, wallets } = useSolanaWallets();
const solanaWallet = wallets[0];
const network = 'mainnet'; // or 'devnet'

export async function transferToken(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
): Promise<{
    success: boolean;
    signature: string;
    recipientAddress: string;
    amount: number;
    tokenAddress: string;
  }> {
  try {
    const networkType = network === 'mainnet' ? 'mainnet-beta' : network;
    const connection = new Connection(clusterApiUrl(networkType));

    const transaction = await createTokenTransferTransaction(
      connection,
      amount,
      recipientAddress,
      solanaWallet.address,
      tokenAddress,
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(solanaWallet.address);

    // Sign and send the transaction using Solana wallet
    const signedTx = await solanaWallet.signTransaction!(transaction);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    return { 
      success: true,
      signature,
      recipientAddress,
      amount,
      tokenAddress
    };
  } catch (error) {
    console.error('Error sending token:', error);
    throw error;
  }
};`;