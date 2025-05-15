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

export const createTokenTransferTransaction = async (
  connection: Connection,
  amount: number,
  recipientAddress: string,
  senderAddress: string,
  tokenMint: string,
): Promise<Transaction> => {
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
    console.error('Error creating USDC transfer transaction:', error);
    throw error;
  }
};

export const useTokenTransfer = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network } = useConfig();

  const transferToken = async (
    tokenAddress: string,
    amount: number,
    recipientAddress: string,
    requireMainnet?: boolean
  ) => {
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
      console.error('Error sending USDC:', error);
      throw error;
    }
  };

  return { transferToken };
};

export const transferTokenString = `
async function transferToken(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
  nodeId?: string
) {
  try {
    // Create connection to Solana network
    const connection = new Connection(clusterApiUrl(network));

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
      new PublicKey(walletAddress)
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
      new PublicKey(recipientAddress)
    );

    // Create transaction
    const transaction = new Transaction();
    
    // Check if recipient token account exists
    const recipientTokenAccountInfo = await connection.getAccountInfo(toTokenAddress);
    
    // Create token account if needed
    if (!recipientTokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          new PublicKey(walletAddress),
          toTokenAddress,
          new PublicKey(recipientAddress),
          new PublicKey(tokenAddress)
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAddress,
        toTokenAddress,
        new PublicKey(walletAddress),
        amount * (10 ** 9) // Convert to lamports
      )
    );

    // Sign and send transaction
    // ... more implementation ...

    return { 
      success: true,
      signature: "transaction_signature"
    };
  } catch (error) {
    console.error('Error transferring token:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}`;