import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getSignaturesForAddress: BlockTemplate = {
  metadata: {
    name: 'getSignaturesForAddress',
    description:
      'Returns all signatures for a given address',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address to get signatures for'
      },
      {
        name: 'before',
        type: 'string',
        description: 'Before signature to start from'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit the number of signatures to return'
      }
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Signatures for address'
    }
  },
  execute: async (
    params: { 
      address: string;
      before?: string;
      limit?: number;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        address,
        before = undefined,
        limit = 1000,
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
          method: 'getSignaturesForAddress',
          params: [
            address,
            {
              before: before,
              limit: limit
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
      console.error('Error in getSignaturesForAddress:', error);
      throw error;
    }
  }
};