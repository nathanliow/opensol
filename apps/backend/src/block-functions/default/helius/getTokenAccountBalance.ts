import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenAccountBalance: BlockTemplate = {
  metadata: {
    name: 'getTokenAccountBalance',
    description:
      'Returns the token balance of an SPL Token account',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Pubkey of the token account'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Token balance of the token account'
    }
  },
  execute: async (
    params: { 
      address: string;
      apiKey?: string; 
      network?: string 
    }) => {
    try {
      const { 
        address,
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
          method: 'getTokenAccountBalance',
          params: [
            address
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
      console.error('Error in getTokenAccountBalance:', error);
      throw error;
    }
  }
};