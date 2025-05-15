import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAssetsByAuthority: BlockFunctionTemplate = {
  metadata: {
    name: 'getAssetsByAuthority',
    description:
      'Get a list of assets with a specific authority',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'authorityAddress',
        type: 'string',
        description: 'Authority Address to get'
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
      description: 'List of assets with a specific authority'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        authorityAddress, 
        page, 
        limit, 
        sortBy, 
        sortDirection, 
        before, 
        after, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!authorityAddress) {
        throw new Error('Authority Address is required.');
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
          method: 'getAssetsByAuthority',
          params: {
            authorityAddress: authorityAddress,
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
      console.error('Error in getAssetByAuthority:', error);
      throw error;
    }
  }
};