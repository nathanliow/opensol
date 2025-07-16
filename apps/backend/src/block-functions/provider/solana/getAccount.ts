import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAccount: BlockFunctionTemplate = {
  metadata: {
    name: 'getAccount',
    description: 'Retrieve information about a token account',
    blockType: 'SOLANA',
    blockCategory: 'Provider',
    parameters: [
      {
        name: 'address',
        description: 'Token account public key',
        type: 'string',
        defaultValue: ''
      },
      {
        name: 'commitment',
        description: 'Desired level of commitment for querying the state',
        type: 'dropdown',
        options: ['processed', 'confirmed', 'finalized'],
        defaultValue: 'confirmed'
      },
      {
        name: 'programId',
        description: 'SPL Token program ID (optional)',
        type: 'string',
        defaultValue: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      }
    ],
    output: {
      type: 'object',
      description: 'Token account information'
    }
  },
  execute: async (params: Record<string, any>) => {
    // Placeholder implementation that will be replaced by the generated hook
    return {
      success: true,
      message: 'Get token account - will be implemented by generated hook',
      params
    };
  }
};

export const getAccountString = `async function getAccount(
  address: string,
  commitment: string = 'confirmed',
  programId: string = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
) {
  try {
    const { getAccount, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    const { PublicKey } = await import('@solana/web3.js');

    // Validate address parameter
    if (!address || address.trim() === '') {
      throw new Error('Address parameter is required');
    }

    // Create PublicKey objects
    const addressPubkey = new PublicKey(address.trim());
    const programIdPubkey = programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' 
      ? TOKEN_PROGRAM_ID 
      : new PublicKey(programId);

    // Get token account information
    const accountInfo = await getAccount(
      connection,
      addressPubkey,
      { commitment: commitment as any },
      programIdPubkey
    );

    return {
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
    };
  } catch (error) {
    return {
      success: false,
      error: \`Error getting account: \${error instanceof Error ? error.message : 'Unknown error'}\`
    };
  }
}`;