import { SolanaOperationOptions } from '@/types/SolanaOperationTypes';

export const executeGetAccount = async (
  params: Record<string, any>,
  options: SolanaOperationOptions
) => {
  const { connection, address } = params;
  const commitment = params.commitment && params.commitment.trim() !== '' ? params.commitment : 'confirmed';
  const programId = params.programId && params.programId.trim() !== '' ? params.programId : 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

  try {
    // Validate address parameter
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new Error('Address parameter is required and must be a valid string');
    }

    // Dynamic imports for Solana SPL Token functionality
    const { getAccount, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    const { PublicKey } = await import('@solana/web3.js');

    const addressPubkey = new PublicKey(address.trim());
    
    // First check if the account exists at all
    const accountInfo = await connection.getAccountInfo(addressPubkey, commitment as any);
    
    if (!accountInfo) {
      throw new Error('Account does not exist');
    }
    
    // Check if it's a token account by checking the owner
    const programIdPubkey = programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' 
      ? TOKEN_PROGRAM_ID 
      : new PublicKey(programId);
      
    
    if (!accountInfo.owner.equals(programIdPubkey)) {
      throw new Error(`Account is not owned by the specified program. Owner: ${accountInfo.owner.toString()}, Expected: ${programIdPubkey.toString()}`);
    }
      
    const tokenAccountInfo = await getAccount(
      connection,
      addressPubkey,
      commitment as any,
      programIdPubkey
    );
    
    return {
      data: {
        success: true,
        address: tokenAccountInfo.address.toString(),
        mint: tokenAccountInfo.mint.toString(),
        owner: tokenAccountInfo.owner.toString(),
        amount: tokenAccountInfo.amount.toString(),
        delegate: tokenAccountInfo.delegate?.toString() || null,
        delegatedAmount: tokenAccountInfo.delegatedAmount.toString(),
        isInitialized: tokenAccountInfo.isInitialized,
        isFrozen: tokenAccountInfo.isFrozen,
        isNative: tokenAccountInfo.isNative,
        rentExemptReserve: tokenAccountInfo.rentExemptReserve?.toString() || null,
        closeAuthority: tokenAccountInfo.closeAuthority?.toString() || null,
        commitment
      },
      signature: undefined // getAccount is a read operation, no signature
    };
  } catch (error) {
    console.error('ExecuteGetAccount error details:', {
      address,
      commitment,
      programId,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`Error getting account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};