import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressionSignaturesForAddress: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressionSignaturesForAddress',
    description: 'Return the signatures of the transactions that closed or opened a compressed account with the given address.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'The address of the compressed account to get the signatures for.'
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
      description: 'Successfully retrieved compression signatures for the specified address from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
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
      
      if (!address) {
        throw new Error('Address is required.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getCompressionSignaturesForAddress',
          params: [{
            address: address,
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
      console.error('Error in getCompressionSignaturesForAddress:', error);
      throw error;
    }
  }
};

export const getCompressionSignaturesForAddressString = `
export const getCompressionSignaturesForAddress = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      cursor,
      limit,
      network = 'devnet' 
    } = params;
      
    if (!address) {
      throw new Error('Address is required.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressionSignaturesForAddress',
        params: [{
          address: address,
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
    console.error('Error in getCompressionSignaturesForAddress:', error);
    throw error;
  }
};
`;
