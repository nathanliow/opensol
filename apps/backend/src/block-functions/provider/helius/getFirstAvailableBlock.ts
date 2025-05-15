import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getFirstAvailableBlock: BlockFunctionTemplate = {
  metadata: {
    name: 'getFirstAvailableBlock',
    description:
      'Returns the slot of the lowest confirmed block that has not been purged from the ledger',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Slot of the lowest confirmed block that has not been purged from the ledger'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
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
          method: 'getFirstAvailableBlock',
          params: []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getFirstAvailableBlock:', error);
      throw error;
    }
  }
};