import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getSignaturesForAddress: BlockFunctionTemplate = {
  metadata: {
    name: 'getSignaturesForAddress',
    description:
      'Returns all signatures for a given address',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address to get signatures for'
      },
      {
        name: 'before',
        type: 'string',
        description: 'Before signature to start from'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit the number of signatures to return'
      }
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Signatures for address'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        before = undefined,
        limit = 1000,
        apiKey, 
        network = 'devnet' 
      } = params;
      
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
          method: 'getSignaturesForAddress',
          params: [
            address,
            {
              before: before,
              limit: limit
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
      console.error('Error in getSignaturesForAddress:', error);
      throw error;
    }
  }
};

export const getSignaturesForAddressString = `
export const getSignaturesForAddress = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      before = undefined,
      limit = 1000,
      network = 'devnet' 
    } = params;

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getSignaturesForAddress',
        params: [address, { before: before, limit: limit }]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getSignaturesForAddress:', error);
    throw error;
  }
};
`;