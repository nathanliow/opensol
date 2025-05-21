import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getBlockTime: BlockFunctionTemplate = {
  metadata: {
    name: 'getBlockTime',
    description:
      'Returns the timestamp of a specific block',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'blockNumber',
        type: 'number',
        description: 'Block number to get'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Timestamp of a specific block'
    }
  },
  execute: async (params: Record<string, any>) => { 
    try {
      const { 
        blockNumber, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!blockNumber) {
        throw new Error('Block number is required.');
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
          method: 'getBlockTime',
          params: [
            blockNumber,
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
      console.error('Error in getBlockTime:', error);
      throw error;
    }
  }
};