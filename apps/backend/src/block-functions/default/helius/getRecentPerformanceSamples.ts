import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getRecentPerformanceSamples: BlockTemplate = {
  metadata: {
    name: 'getRecentPerformanceSamples',
    description:
      'Returns a list of recent performance samples, in reverse slot order',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'Max number of samples to return'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Recent performance samples'
    }
  },
  execute: async (
    params: { 
      limit: number;
      apiKey?: string; 
      network?: string 
    }) => {
    try {
      const { 
        limit,
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
          method: 'getRecentPerformanceSamples',
          params: [
            limit
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
      console.error('Error in getRecentPerformanceSamples:', error);
      throw error;
    }
  }
};