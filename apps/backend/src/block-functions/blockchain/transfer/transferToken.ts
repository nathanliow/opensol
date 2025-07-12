import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { SolanaOperationOptions } from "@/types/SolanaOperationTypes";

export interface TransferTokenParams {
  tokenAddress: string;
  amount: number;
  recipientAddress: string;
}

export const executeTransferToken = async (
  params: TransferTokenParams & { connection: Connection; wallet: any; walletAddress: string },
  options: SolanaOperationOptions
) => {
  const {
    tokenAddress,
    amount,
    recipientAddress,
    connection,
    wallet,
    walletAddress
  } = params;

  if (!options.requiresSigning) {
    return {
      data: {
        success: false,
        message: 'Token transfer requires signing'
      },
      signature: undefined
    };
  }

  try {
    const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
    const transferAmount = BigInt(amount * 10 ** mintInfo.decimals);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(walletAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
      sender
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
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
          new PublicKey(tokenAddress) // mint
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

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

    // Sign and send the transaction using Solana wallet
    const signedTx = await wallet.signTransaction!(transaction);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    return { 
      data: {
        success: true,
        signature,
        recipientAddress,
        amount,
        tokenAddress
      },
      signature
    };
  } catch (error) {
    console.error('Error transferring token:', error);
    throw error;
  }
};

export const transferTokenDisplayString = `async function transferToken(
  tokenAddress: string,
  amount: number,
  recipientAddress: string,
) {
  try {
    const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
    const transferAmount = BigInt(amount * 10 ** mintInfo.decimals);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(walletAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the associated token addresses
    const fromTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
      sender
    );
    
    const toTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(tokenAddress),
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
          new PublicKey(tokenAddress) // mint
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

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

    // Sign and send the transaction using Solana wallet
    const signedTx = await wallet.signTransaction!(transaction);
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
    console.error('Error transferring token:', error);
    throw error;
  }
}`; 