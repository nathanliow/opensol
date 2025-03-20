import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getBalance: BlockTemplate = {
  metadata: {
    name: 'getBalance',
    description:
      'Get the balance for a specific account',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address to get'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Balance for a specific account'
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
      
      if (!address) {
        throw new Error('Address is required.');
      }
      
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
          method: 'getBalance',
          params: [
            address,
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
      console.error('Error in getBalance:', error);
      throw error;
    }
  }
};