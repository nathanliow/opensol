import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const minimumLedgerSlot: BlockTemplate = {
  metadata: {
    name: 'minimumLedgerSlot',
    description:
      'Returns the lowest slot that the node has information about in its ledger',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Lowest slot that the node has information about in its ledger'
    }
  },
  execute: async (
    params: { 
      apiKey?: string; 
      network?: string 
    }) => {
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
          method: 'minimumLedgerSlot',
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
      console.error('Error in minimumLedgerSlot:', error);
      throw error;
    }
  }
};