import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAccountInfo: BlockFunctionTemplate = {
  metadata: {
    name: 'getAccountInfo',
    description:
      'Returns all information associated with the account of provided Pubkey',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'pubkey',
        type: 'string',
        description: 'Pubkey of the account'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'All information associated with the account of provided Pubkey'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        pubkey,
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' || apiKey.tier != 'developer' || apiKey.tier != 'business' || apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getAccountInfo',
          params: [
            pubkey
          ]  
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getAccountInfo:', error);
      throw error;
    }
  }
};