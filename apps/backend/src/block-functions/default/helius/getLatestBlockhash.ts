import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getLatestBlockhash: BlockTemplate = {
  metadata: {
    name: 'getLatestBlockhash',
    description:
      'Returns the latest blockhash',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'commitment',
        type: 'string',
        description: 'Commitment to use for the query'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Latest blockhash'
    }
  },
  execute: async (
    params: { 
      commitment?: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        commitment = 'confirmed',
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
          method: 'getLatestBlockhash',
          params: [
            {
              commitment: commitment
            }
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