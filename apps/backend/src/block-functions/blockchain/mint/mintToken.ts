import { 
  Connection, 
  PublicKey, 
  Transaction, 
  Keypair, 
  SystemProgram
} from "@solana/web3.js";
import { SolanaOperationOptions } from "@/types/SolanaOperationTypes";
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export interface MintTokenParams {
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
  decimals?: number;
  supply?: number;
  metadataUri: string;
}

export const executeMintToken = async (
  params: MintTokenParams & Record<string, any>,
  options: SolanaOperationOptions
) => {
  const {
    name,
    symbol,
    description,
    imageUri,
    decimals = 9,
    supply = 1000000000,
    metadataUri,
    connection,
    wallet,
    walletAddress
  } = params;

  if (!options.requiresSigning) {
    return {
      data: {
        success: false,
        message: 'Token minting requires signing'
      },
      signature: undefined
    };
  }

  try {
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;
    const walletPublicKey = new PublicKey(walletAddress);

    const transaction = new Transaction();

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Add instruction to create account for the mint
    transaction.add(
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

    transaction.add(createMetadataInstruction);

    // Create the associated token account for the user's wallet
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );

    // Create the associated token account
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

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    transaction.partialSign(mintKeypair);

    const signedTx = await wallet.signTransaction!(transaction);

    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { 
        skipPreflight: false, 
        preflightCommitment: 'confirmed' 
      }
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    
    return { 
      data: {
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
      },
      signature
    };
  } catch (error) {
    console.error('Error minting token:', error);
    throw error;
  }
};

export const mintTokenDisplayString = `async function mintToken(
  name: string,
  symbol: string,
  description: string,
  imageUri: string,
  decimals: number = 9,
  supply: number = 1000000000,
  metadataUri: string,
) {
  try {
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;
    const walletPublicKey = new PublicKey(walletAddress);

    const transaction = new Transaction();

    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Add instruction to create account for the mint
    transaction.add(
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

    transaction.add(createMetadataInstruction);

    // Create the associated token account for the user's wallet
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );

    // Create the associated token account
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

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;

    transaction.partialSign(mintKeypair);

    const signedTx = await wallet.signTransaction!(transaction);

    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { 
        skipPreflight: false, 
        preflightCommitment: 'confirmed' 
      }
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    
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
    throw error;
  }
}`;