import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAssetsByOwner: BlockFunctionTemplate = {
  metadata: {
    name: 'getAssetsByOwner',
    description:
      'Get a list of assets with a specific owner',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'ownerAddress',
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
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'List of assets owned by an address'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        ownerAddress, 
        page, 
        limit, 
        sortBy, 
        sortDirection, 
        before, 
        after, 
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!ownerAddress) {
        throw new Error('Owner Address is required.');
      }
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      } 

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: ownerAddress,
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
      console.error('Error in getAssetsByOwner:', error);
      throw error;
    }
  }
};

export const getAssetsByOwnerDisplayString = `export const getAssetsByOwner = async (params: Record<string, any>) => {
  try {
    const { 
      ownerAddress, 
      page, 
      limit, 
      sortBy, 
      sortDirection, 
      before, 
      after, 
      network = 'devnet' 
    } = params;
    
    if (!ownerAddress) {
      throw new Error('Owner Address is required.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: ownerAddress,
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
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getAssetsByOwner:', error);
    throw error;
  }
};
`;

export const getAssetsByOwnerExecuteString = `async function getAssetsByOwner(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      ownerAddress, 
      page, 
      limit, 
      sortBy, 
      sortDirection, 
      before, 
      after, 
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!ownerAddress) {
      throw new Error('Owner Address is required.');
    }
    
    if (!apiKey) {
      throw new Error('Helius API key is required.');
    } 

    if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
      throw new Error('Invalid API key tier.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${apiKey.key}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: ownerAddress,
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
      throw new Error(\`Helius API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getAssetsByOwner:', error);
    throw error;
  }
};
`;