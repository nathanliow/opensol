import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getVoteAccounts: BlockFunctionTemplate = {
  metadata: {
    name: 'getVoteAccounts',
    description:
      'Returns the account info and associated stake for all the voting accounts in the current bank',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Account info and associated stake for all the voting accounts in the current bank'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getVoteAccounts',
          params: []  
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getVoteAccounts:', error);
      throw error;
    }
  }
};