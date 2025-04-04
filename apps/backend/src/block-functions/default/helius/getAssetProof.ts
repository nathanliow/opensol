import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAssetProof: BlockTemplate = {
  metadata: {
    name: 'getAssetProof',
    description:
      'Get a merkle proof for a compressed asset by its ID',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'assetId',
        type: 'string',
        description: 'Asset ID to get'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Asset Proof'
    }
  },
  execute: async (params: { assetId: string; apiKey?: string; network?: string }) => {
    try {
      const { assetId, apiKey, network = 'devnet' } = params;
      
      if (!assetId) {
        throw new Error('Asset ID is required.');
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
          method: 'getAssetProof',
          params: {
            id: assetId,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getAssetProof:', error);
      throw error;
    }
  }
};