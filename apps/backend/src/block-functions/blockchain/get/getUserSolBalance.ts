import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getUserSolBalance: BlockFunctionTemplate = {
  metadata: {
    name: 'getUserSolBalance',
    description:
      'Get user SOL balance using Helius API by fetching assets and then retrieving the SOL balance',
    blockCategory: 'Blockchain',
    blockType: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Wallet address to check'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional'],
    },
    output: {
      type: 'object',
      description: 'User SOL balance'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      // Extract parameters
      const { 
        address, 
        apiKey, 
        network = 'mainnet' 
      } = params;
      
      if (!address) {
        throw new Error('Wallet address is required.');
      }
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      // Fetch the SOL balance for the account
      const balanceResponse = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'balance',
          method: 'getBalance',
          params: [address]
        })
      });

      if (!balanceResponse.ok) {
        const errorText = await balanceResponse.text();
        throw new Error(`Helius API error (${balanceResponse.status}): ${errorText}`);
      }
      const balanceData = await balanceResponse.json();

      // Return combined results
      return {
        result: balanceData.result.value*1e-9
      }
    } catch (error) {
      console.error('Error in getUserSolBalance:', error);
      throw error;
    }
  }
};