import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getLatestNonVotingSignatures: BlockFunctionTemplate = {
  metadata: {
    name: 'getLatestNonVotingSignatures',
    description: 'Returns the signatures of the latest transactions that are not voting transactions.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of non-voting signatures for.'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'The limit of the non-voting signatures to get.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'The name of the method to invoke for retrieving recent Solana compression transaction signatures.'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        cursor,
        limit,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
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
          method: 'getLatestNonVotingSignatures',
          params: [{
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
      console.error('Error in getLatestNonVotingSignatures:', error);
      throw error;
    }
  }
};

export const getLatestNonVotingSignaturesString = `
export const getLatestNonVotingSignatures = async (params: Record<string, any>) => {
  try {
    const { 
      cursor,
      limit,
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
        method: 'getLatestNonVotingSignatures',
        params: [{
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
    console.error('Error in getLatestNonVotingSignatures:', error);
    throw error;
  }
};
`;
