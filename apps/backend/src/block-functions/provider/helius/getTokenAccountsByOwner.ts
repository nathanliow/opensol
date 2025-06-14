import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenAccountsByOwner: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenAccountsByOwner',
    description:
      'Get information about all token accounts for a specific owner. If a mint is provided, only accounts for that mint will be returned.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'owner',
        type: 'string',
        description: 'Owner Address to get'
      },
      {
        name: 'mint',
        type: 'string',
        description: 'Mint Address to filter by'
      },
      {
        name: 'programId',
        type: 'string',
        description: 'Program ID to filter by'
      }
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Returns all SPL Token accounts by token owner.'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        owner,
        mint, 
        programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!owner) {
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
          method: 'getTokenAccountsByOwner',
          params: [
            owner,
            {
              "mint": mint,
              "programId": programId
            },
            {
              "encoding": "jsonParsed"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getTokenAccountsByOwner:', error);
      throw error;
    }
  }
};

export const getTokenAccountsByOwnerDisplayString = `export const getTokenAccountsByOwner = async (params: Record<string, any>) => {
  try {
    const { 
      owner,
      mint,
      programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
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
        method: 'getTokenAccountsByOwner',
        params: [
          owner,
          {
            "mint": mint,
            "programId": programId
          },
          {
            "encoding": "jsonParsed"
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
    console.error('Error in getTokenAccountsByOwner:', error);
    throw error;
  }
};
`;

export const getTokenAccountsByOwnerExecuteString = `async function getTokenAccountsByOwner(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      owner,
      mint, 
      programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!owner) {
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
        method: 'getTokenAccountsByOwner',
        params: [
          owner,
          {
            "mint": mint,
            "programId": programId
          },
          {
            "encoding": "jsonParsed"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Helius API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getTokenAccountsByOwner:', error);
    throw error;
  }
};
`;