import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAssetsByGroup: BlockFunctionTemplate = {
  metadata: {
    name: 'getAssetsByGroup',
    description:
      'Get a list of assets by a group key and value',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'groupKey',
        type: 'string',
        description: 'Group Key to get'
      },
      {
        name: 'groupValue',
        type: 'string',
        description: 'Group Value to get'
      },
      {
        name: 'page',
        type: 'number',
        description: 'Page to get'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit to get'
      },
      {
        name: 'sortBy',
        type: 'string',
        description: 'Sort By to get'
      },
      {
        name: 'sortDirection',
        type: 'string',
        description: 'Sort Direction to get'
      },
      {
        name: 'before',
        type: 'string',
        description: 'Before to get'
      },
      {
        name: 'after',
        type: 'string',
        description: 'After to get'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Asset Proof'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        groupKey, 
        groupValue, 
        page, 
        limit, 
        sortBy, 
        sortDirection, 
        before, 
        after, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!groupKey) {
        throw new Error('Group Key is required.');
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
          method: 'getAssetsByGroup',
          params: {
            groupKey: groupKey,
            groupValue: groupValue,
            page: page,
            limit: limit,
            sortBy: {
              sortBy: sortBy,
              sortDirection: sortDirection,
            },
            before: before,
            after: after,
            options: {
              showUnverifiedCollections: false,
              showCollectionMetadata: false,
              showGrandTotal: false,
              showInscription: false,
            }
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
      console.error('Error in getAsset:', error);
      throw error;
    }
  }
};