import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressionSignaturesForOwner: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressionSignaturesForOwner',
    description: 'Returns the signatures of the transactions that have modified an owner\'s compressed accounts.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'owner',
        type: 'string',
        description: 'The owner to get the compression signatures for.'
      },
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of compression signatures for.'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'The limit of the compression signatures to get.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved compression signatures for the specified owner from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        owner,
        cursor,
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
          method: 'getCompressionSignaturesForOwner',
          params: [{
            owner: owner,
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
      console.error('Error in getCompressionSignaturesForOwner:', error);
      throw error;
    }
  }
};

export const getCompressionSignaturesForOwnerString = `
export const getCompressionSignaturesForOwner = async (params: Record<string, any>) => {
  try {
    const { 
      owner,
      cursor,
      limit,
      network = 'devnet' 
    } = params;
      
    if (!owner) {
      throw new Error('Owner is required.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressionSignaturesForOwner',
        params: [{
          owner: owner,
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
    console.error('Error in getCompressionSignaturesForOwner:', error);
    throw error;
  }
};
`;
