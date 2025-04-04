import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTransaction: BlockTemplate = {
  metadata: {
    name: 'getTransaction',
    description:
      'Get a transaction by signature',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'signature',
        type: 'string',
        description: 'Signature of the transaction'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Transaction'
    }
  },
  execute: async (
    params: { 
      signature: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        signature,
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
          method: 'getTransaction',
          params: [
            signature
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
      console.error('Error in getTransaction:', error);
      throw error;
    }
  }
};