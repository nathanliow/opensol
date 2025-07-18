import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getSignaturesForAsset: BlockFunctionTemplate = {
  metadata: {
    name: 'getSignaturesForAsset',
    description:
      'Get a list of transaction signatures related to a compressed asset',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'assetId',
        type: 'string',
        description: 'Asset ID to get'
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
      description: 'List of transaction signatures related to a compressed asset'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        assetId, 
        page, 
        limit, 
        before, 
        after, 
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!assetId) {
        throw new Error('Asset ID is required.');
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
          method: 'getSignaturesForAsset',
          params: {
            id: assetId,
            page: page,
            limit: limit,
            before: before,
            after: after,
            options: {
              showUnverifiedCollections: false,
              showCollectionMetadata: false,
              showFungible: false,
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
      console.error('Error in getSignaturesForAsset:', error);
      throw error;
    }
  }
};

export const getSignaturesForAssetDisplayString = `export const getSignaturesForAsset = async (params: Record<string, any>) => {
  try {
    const { 
      assetId,
      page,
      limit,
      before,
      after,
      network = 'devnet' 
    } = params;

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getSignaturesForAsset',
        params: {
          id: assetId,
          page: page,
          limit: limit,
          before: before,
          after: after,
          options: {
            showUnverifiedCollections: false,
            showCollectionMetadata: false,
            showFungible: false,
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
    console.error('Error in getSignaturesForAsset:', error);
    throw error;
  }
};
`;

export const getSignaturesForAssetExecuteString = `async function getSignaturesForAsset(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      assetId, 
      page, 
      limit, 
      before, 
      after, 
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!assetId) {
      throw new Error('Asset ID is required.');
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
        method: 'getSignaturesForAsset',
        params: {
          id: assetId,
          page: page,
          limit: limit,
          before: before,
          after: after,
          options: {
            showUnverifiedCollections: false,
            showCollectionMetadata: false,
            showFungible: false,
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
    console.error('Error in getSignaturesForAsset:', error);
    throw error;
  }
};
`;