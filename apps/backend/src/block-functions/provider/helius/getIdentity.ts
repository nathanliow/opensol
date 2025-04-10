import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getIdentity: BlockTemplate = {
  metadata: {
    name: 'getIdentity',
    description:
      'Returns the identity pubkey for the current node',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Identity pubkey for the current node'
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
          method: 'getIdentity',
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
      console.error('Error in getIdentity:', error);
      throw error;
    }
  }
};