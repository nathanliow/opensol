import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressedAccountsByOwner: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressedAccountsByOwner',
    description:
      'Returns a proof the compression program uses to verify that the account is valid.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'owner',
        type: 'string',
        description: 'The owner of the compressed accounts to get the balance for.'
      },
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of compressed accounts for.'
      },
      {
        name: 'dataSliceLength',
        type: 'number',
        description: 'The length of the data slice to get the next page of compressed accounts for.'
      },
      {
        name: 'dataSliceOffset',
        type: 'number',
        description: 'The offset of the data slice to get the next page of compressed accounts for.'
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
      description: 'Successfully retrieved compressed accounts by owner from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        owner,
        cursor,
        dataSliceLength,
        dataSliceOffset,
        limit,
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!dataSliceLength || !dataSliceOffset) {
        throw new Error('Data slice length and offset are required.');
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
          method: 'getCompressedAccountsByOwner',
          params: [{
            owner: owner,
            cursor: cursor,
            dataSlice: {
              length: dataSliceLength,
              offset: dataSliceOffset
            },
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
      console.error('Error in getCompressedAccountsByOwner:', error);
      throw error;
    }
  }
};

export const getCompressedAccountsByOwnerString = `
export const getCompressedAccountsByOwner = async (params: Record<string, any>) => {
  try {
    const { 
      owner,
      cursor,
      dataSliceLength,
      dataSliceOffset,
      limit,
      network = 'devnet' 
    } = params;
      
    if (!owner) {
      throw new Error('Owner is required.');
    }

    if (limit < 0) {
      throw new Error('Limit must be greater than 0.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedAccountsByOwner',
        params: [{
          owner: owner,
          cursor: cursor,
          dataSlice: {
            length: dataSliceLength,
            offset: dataSliceOffset
          },
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
    console.error('Error in getCompressedAccountsByOwner:', error);
    throw error;
  }
};
`;
