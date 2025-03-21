import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getProgramAccounts: BlockTemplate = {
  metadata: {
    name: 'getProgramAccounts',
    description:
      'Returns all accounts owned by the provided program Pubkey',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Program Pubkey'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Program accounts'
    }
  },
  execute: async (
    params: { 
      pubkey?: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        pubkey,
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
          method: 'getProgramAccounts',
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
      console.error('Error in getLatestBlockhash:', error);
      throw error;
    }
  }
};