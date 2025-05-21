import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenAccounts: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenAccounts',
    description:
      'Get information about all token accounts for a specific mint or a specific owner',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'mint',
        type: 'string',
        description: 'Mint Address to get'
      },
      {
        name: 'owner',
        type: 'string',
        description: 'Owner Address to get'
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
        name: 'cursor',
        type: 'string',
        description: 'Cursor to get'
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
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'List of assets with a specific authority'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        mint, 
        owner, 
        page, 
        limit, 
        cursor, 
        before, 
        after, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!mint && !owner) {
        throw new Error('Mint or Owner Address is required.');
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
          method: 'getTokenAccounts',
          params: {
            mint: mint,
            owner: owner,
            page: page,
            limit: limit,
            cursor: cursor,
            before: before,
            after: after,
            options: {
              showZeroBalance: true
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
      console.error('Error in getTokenAccounts:', error);
      throw error;
    }
  }
};