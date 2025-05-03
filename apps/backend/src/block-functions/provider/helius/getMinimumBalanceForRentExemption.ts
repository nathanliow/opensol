import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getMinimumBalanceForRentExemption: BlockFunctionTemplate = {
  metadata: {
    name: 'getMinimumBalanceForRentExemption',
    description:
      'Get the minimum balance for rent exemption',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'length',
        type: 'number',
        description: 'Account data length'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Minimum balance for rent exemption'
    }
  },
  execute: async (
    params: { 
      accountDataLength: number;
      apiKey?: string; 
      network?: string 
    }) => {
    try {
      const { 
        accountDataLength,
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
          method: 'getMinimumBalanceForRentExemption',
          params: [
            accountDataLength
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
      console.error('Error in getMinimumBalanceForRentExemption:', error);
      throw error;
    }
  }
};