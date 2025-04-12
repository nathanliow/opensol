import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth';

// USDC token mint address on Solana mainnet
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export const createUSDCTransferTransaction = async (
  amount: number,
  recipientAddress: string,
  senderAddress: string
) => {
  try {
    // Convert amount to USDC decimals (6)
    const transferAmount = BigInt(amount * 1_000_000);

    // Create PublicKeys for sender and recipient
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get associated token accounts for sender and recipient
    const senderATA = getAssociatedTokenAddressSync(USDC_MINT, sender);
    const recipientATA = getAssociatedTokenAddressSync(USDC_MINT, recipient);

    // Create transfer instruction
    const transferInstruction = createTransferCheckedInstruction(
      senderATA,
      USDC_MINT,
      recipientATA,
      sender,
      transferAmount,
      6 // USDC decimals
    );

    // Create transaction and add the transfer instruction
    const transaction = new Transaction().add(transferInstruction);

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

  const sendUSDC = async (
    amount: number,
    recipientAddress: string
  ) => {
    try {
      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      if (!ready || !solanaWallet?.address) {
        throw new Error('Solana wallet not ready');
      }

      // Create connection to Solana mainnet
      const connection = new Connection('https://api.mainnet-beta.solana.com');

      // Create the transaction
      const transaction = await createUSDCTransferTransaction(
        amount,
        recipientAddress,
        solanaWallet.address
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(solanaWallet.address);

      // Sign and send the transaction using Solana wallet
      const signedTx = await solanaWallet.signTransaction!(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);

      console.log('USDC transfer successful:', signature);
      return { signature };
    } catch (error) {
      console.error('Error sending USDC:', error);
      throw error;
    }
  };

  return { sendUSDC };
};
