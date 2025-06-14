import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressedTokenBalancesByOwner: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressedTokenBalancesByOwner',
    description:
      'Returns the compressed token balances for the given owner.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'owner',
        type: 'string',
        description: 'The owner to get the token balances for.'
      },
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of compressed token balances for.'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'The limit of the token balances to get.'
      },
      {
        name: 'mint',
        type: 'string',
        description: 'The mint to get the token balances for.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved compressed token balances by owner (V2) from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        owner,
        cursor,
        limit,
        mint,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!owner) {
        throw new Error('Owner is required.');
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
          method: 'getCompressedTokenBalancesByOwnerV2',
          params: [{
            owner: owner,
            cursor: cursor,
            limit: limit,
            mint: mint
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
      console.error('Error in getCompressedTokenBalancesByOwner:', error);
      throw error;
    }
  }
};

export const getCompressedTokenBalancesByOwnerDisplayString = `export const getCompressedTokenBalancesByOwner = async (params: Record<string, any>) => {
  try {
    const { 
      owner,
      cursor,
      limit,
      mint,
      network = 'devnet' 
    } = params;
      
    if (!owner) {
      throw new Error('Owner is required.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedTokenBalancesByOwnerV2',
        params: [{
          owner: owner,
          cursor: cursor,
          limit: limit,
          mint: mint
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
    console.error('Error in getCompressedTokenBalancesByOwner:', error);
    throw error;
  }
};
`;

export const getCompressedTokenBalancesByOwnerExecuteString = `async function getCompressedTokenBalancesByOwner(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      owner,
      cursor,
      limit,
      mint,
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Helius API key is required.');
    }

    if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
      throw new Error('Invalid API key tier.');
    }
    
    if (!owner) {
      throw new Error('Owner is required.');
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
        method: 'getCompressedTokenBalancesByOwnerV2',
        params: [{
          owner: owner,
          cursor: cursor,
          limit: limit,
          mint: mint
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
    console.error('Error in getCompressedTokenBalancesByOwner:', error);
    throw error;
  }
};
`;
