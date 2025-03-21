import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenSupply: BlockTemplate = {
  metadata: {
    name: 'getTokenSupply',
    description:
      'Get the supply of a token',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'tokenMint',
        type: 'string',
        description: 'Token mint'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Supply of the token'
    }
  },
  execute: async (
    params: { 
      tokenMint: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        tokenMint,
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
          method: 'getTokenSupply',
          params: [
            tokenMint
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
      console.error('Error in getTokenSupply:', error);
      throw error;
    }
  }
};