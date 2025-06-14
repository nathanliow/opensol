import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getAsset: BlockFunctionTemplate = {
  metadata: {
    name: 'getAsset',
    description:
      'Get an asset by its ID',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'assetId',
        type: 'string',
        description: 'Asset ID to get'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Asset Data'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        assetId, 
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
          method: 'getAsset',
          params: {
            id: assetId,
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
      console.error('Error in getAsset:', error);
      throw error;
    }
  }
};

export const getAssetDisplayString = `
export const getAsset = async (params: Record<string, any>) => {
  try {
    const { 
      assetId, 
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
        method: 'getAsset',
        params: {
          id: assetId,
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
    console.error('Error in getAsset:', error);
    throw error;
  }
};
`;

export const getAssetExecuteString = `
async function getAsset(params) {
  try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        assetId, 
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
          method: 'getAsset',
          params: {
            id: assetId,
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
      console.error('Error in getAsset:', error);
      throw error;
    }
};
`;