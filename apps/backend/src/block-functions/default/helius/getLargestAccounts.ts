import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getLargestAccounts: BlockTemplate = {
  metadata: {
    name: 'getLargestAccounts',
    description:
      'Returns the 20 largest accounts, by lamport balance (results may be cached up to two hours)',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Largest accounts on the network'
    }
  },
  execute: async (
    params: { 
      apiKey?: string; 
      network?: string 
    }) => {
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
          method: 'getLargestAccounts',
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
      console.error('Error in getLargestAccounts:', error);
      throw error;
    }
  }
};