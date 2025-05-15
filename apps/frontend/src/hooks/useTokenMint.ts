import { 
  Connection, 
  PublicKey, 
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram
} from '@solana/web3.js';
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction
} from "@solana/spl-token";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction
} from '@metaplex-foundation/mpl-token-metadata';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useConfig } from '@/contexts/ConfigContext';

export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export const useTokenMint = () => {
  const { authenticated } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const { network } = useConfig();

  const mintToken = async (
    name: string,
    symbol: string,
    description: string,
    imageUri: string,
    decimals: number = 9,
    supply: number = 100,
    metadataUri: string,
  ) => {
    try {
      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      if (!ready || !solanaWallet?.address) {
        throw new Error('Solana wallet not ready');
      }

      // Create connection to Solana network
      const networkType = network === 'mainnet' ? 'mainnet-beta' : network;
      const connection = new Connection(clusterApiUrl(networkType));

      // Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // Get user's wallet public key
      const walletPublicKey = new PublicKey(solanaWallet.address);

      // Create transaction
      const transaction = new Transaction();

      // Calculate rent for mint
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Add instruction to create account for the mint
      transaction.add(
        // Create account for mint
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mintPublicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID
        }),
        
        // Initialize the mint
        createInitializeMintInstruction(
          mintPublicKey,          // mint pubkey
          decimals,               // decimals
          walletPublicKey,        // mint authority
          walletPublicKey,        // freeze authority (you can use null to disable it)
          TOKEN_PROGRAM_ID        // program ID
        )
      );

      // Setup for adding metadata
      const metadataAccount = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mintPublicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      )[0];

      // Metadata for the token
      const tokenMetadata = {
        name: name,
        symbol: symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
      } as DataV2;

      // Create metadata instruction
      const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAccount,
          mint: mintPublicKey,
          mintAuthority: walletPublicKey,
          payer: walletPublicKey,
          updateAuthority: walletPublicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: tokenMetadata,
            isMutable: true,
            collectionDetails: null
          }
        }
      );

      // Add metadata instruction to transaction
      transaction.add(createMetadataInstruction);

      // Create the associated token account for the user's wallet
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        walletPublicKey
      );

      // Create the associated token account if it doesn't exist yet
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey,         // payer
          associatedTokenAddress,  // associated token account
          walletPublicKey,         // owner
          mintPublicKey            // mint
        )
      );

      // Mint tokens to the associated token account
      transaction.add(
        createMintToInstruction(
          mintPublicKey,           // mint
          associatedTokenAddress,  // destination
          walletPublicKey,         // authority
          supply * (10 ** decimals)  // amount (accounting for decimals)
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      // Sign transaction with mint keypair (since it's a signer)
      transaction.partialSign(mintKeypair);

      // Get user to sign the transaction with their wallet
      const signedTx = await solanaWallet.signTransaction!(transaction);

      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Token minted successfully:', signature);
      
      return { 
        success: true,
        signature,
        mintAddress: mintPublicKey.toString(),
        associatedTokenAddress: associatedTokenAddress.toString(),
        supply,
        metadataUri: metadataUri,
        metadata: {
          name,
          symbol,
          description,
          image: imageUri,
        }
      };
    } catch (error) {
      console.error('Error minting token:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  };

  return { mintToken };
}; 

export const mintTokenString = `async function mintToken(
  name: string,
  symbol: string,
  description: string,
  imageUri: string,
  decimals: number = 9,
  supply: number = 1000000000,
  metadataUri: string,
  nodeId?: string
) {
  try {
    // Create connection to Solana network
    const connection = new Connection(clusterApiUrl(network));

    // Generate a new keypair for the mint account
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    // Get user's wallet public key
    const walletPublicKey = new PublicKey(walletAddress);

    // Create transaction
    const transaction = new Transaction();

    // Calculate rent for mint
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Add instruction to create account for the mint
    transaction.add(
      // Create account for mint
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID
      }),
      
      // Initialize the mint
      createInitializeMintInstruction(
        mintPublicKey,          // mint pubkey
        decimals,               // decimals
        walletPublicKey,        // mint authority
        walletPublicKey,        // freeze authority
        TOKEN_PROGRAM_ID        // program ID
      )
    );

    // Create metadata and mint tokens
    // ... more implementation ...

    return { 
      success: true,
      mintAddress: mintPublicKey.toString()
    };
  } catch (error) {
    console.error('Error minting token:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}`;