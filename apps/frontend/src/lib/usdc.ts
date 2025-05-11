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
} from "@solana/spl-token";
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { NetworkType } from '@/types/NetworkTypes';
import { useConfig } from '@/contexts/ConfigContext';

// Get the appropriate USDC mint address based on network
const getUSDCMint = (networkType: NetworkType) => {
  // USDC token mint address on Solana mainnet
  if (networkType === 'mainnet') {
    return new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  }
  // Devnet USDC token 
  return new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
};

export const createUSDCTransferTransaction = async (
  connection: Connection,
  amount: number,
  recipientAddress: string,
  senderAddress: string,
  networkType: NetworkType = 'devnet'
): Promise<Transaction> => {
  try {
    const USDC_MINT = getUSDCMint(networkType);
    
    // Convert amount to USDC decimals (6)
    const transferAmount = BigInt(amount * 1_000_000);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      USDC_MINT,
      sender
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      USDC_MINT,
      recipient
    );

    // Create a new transaction
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
          USDC_MINT // mint
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
    console.error('Error creating USDC transfer transaction:', error);
    throw error;
  }
};

export const useUSDCTransfer = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network } = useConfig();

  const sendUSDC = async (
    amount: number,
    recipientAddress: string,
  ) => {
    try {
      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      if (!ready || !solanaWallet?.address) {
        throw new Error('Solana wallet not ready');
      }

      // Create connection to Solana devnet
      const networkType = network === 'mainnet' ? 'mainnet-beta' : network;
      const connection = new Connection(clusterApiUrl(networkType));

      // Create the transaction
      const transaction = await createUSDCTransferTransaction(
        connection,
        amount,
        recipientAddress,
        solanaWallet.address,
        network
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

      console.log('USDC transfer successful:', signature);
      return { signature };
    } catch (error) {
      console.error('Error sending USDC:', error);
      throw error;
    }
  };

  return { sendUSDC };
};
