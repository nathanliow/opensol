import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressedMintTokenHolders: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressedMintTokenHolders',
    description:
      'Returns the owner balances for a given mint in descending order.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'mint',
        type: 'string',
        description: 'The mint to get the token holders for.'
      },
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of compressed accounts for.'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'The limit of the compressed accounts to get.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved compressed token holders for the specified mint from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        mint,
        cursor = undefined,
        limit = undefined,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!mint) {
        throw new Error('Mint is required.');
      }

      if (limit < 0) {
        throw new Error('Limit must be greater than 0.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getCompressedMintTokenHolders',
          params: [{
            mint: mint,
            cursor: cursor,
            limit: limit
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getCompressedMintTokenHolders:', error);
      throw error;
    }
  }
};

export const getCompressedMintTokenHoldersDisplayString = `export const getCompressedMintTokenHolders = async (params: Record<string, any>) => {
  try {
    const { 
      mint,
      cursor = undefined,
      limit = undefined,
      network = 'devnet' 
    } = params;
      
    if (!mint) {
      throw new Error('Mint is required.');
    }

    if (limit < 0) {
      throw new Error('Limit must be greater than 0.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedMintTokenHolders',
        params: [{
          mint: mint,
          cursor: cursor,
          limit: limit
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getCompressedMintTokenHolders:', error);
    throw error;
  }
};
`;

export const getCompressedMintTokenHoldersExecuteString = `async function getCompressedMintTokenHolders(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      mint,
      cursor = undefined,
      limit = undefined,
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Helius API key is required.');
    }

    if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
      throw new Error('Invalid API key tier.');
    }
    
    if (!mint) {
      throw new Error('Mint is required.');
    }

    if (limit < 0) {
      throw new Error('Limit must be greater than 0.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${apiKey.key}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedMintTokenHolders',
        params: [{
          mint: mint,
          cursor: cursor,
          limit: limit
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Helius API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getCompressedMintTokenHolders:', error);
    throw error;
  }
};
`;