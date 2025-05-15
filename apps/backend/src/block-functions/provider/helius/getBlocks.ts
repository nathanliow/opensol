import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getBlocks: BlockFunctionTemplate = {
  metadata: {
    name: 'getBlocks',
    description:
      'Returns a list of confirmed blocks between two slots',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'blockNumbers',
        type: 'number[]',
        description: 'Start and end slot numbers to get'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'List of confirmed blocks between two slots'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        blockNumbers, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!blockNumbers) {
        throw new Error('Block numbers are required.');
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
          method: 'getBlocks',
          params: blockNumbers,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getBlocks:', error);
      throw error;
    }
  }
};