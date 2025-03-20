import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getHighestSnapshotSlot: BlockTemplate = {
  metadata: {
    name: 'getHighestSnapshotSlot',
    description:
      'Returns the highest slot information that the node has snapshots for',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Highest slot information that the node has snapshots for'
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
          method: 'getHighestSnapshotSlot',
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
      console.error('Error in getHighestSnapshotSlot:', error);
      throw error;
    }
  }
};