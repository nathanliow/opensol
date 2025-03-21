import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const isBlockhashValid: BlockTemplate = {
  metadata: {
    name: 'isBlockhashValid',
    description:
      'Check if a blockhash is valid or not',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'blockhash',
        type: 'string',
        description: 'Blockhash to check'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Whether the blockhash is valid or not'
    }
  },
  execute: async (
    params: { 
      blockhash: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        blockhash,
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
          method: 'isBlockhashValid',
          params: [
            blockhash
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
      console.error('Error in isBlockhashValid:', error);
      throw error;
    }
  }
};