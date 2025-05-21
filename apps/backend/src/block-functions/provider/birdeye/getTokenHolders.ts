import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenCreationInfo: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenCreationInfo',
    description:
      'Retrieve the creation transaction information of a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit of the token holders',
        defaultValue: 100
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset of the token holders',
        defaultValue: 0
      },
      
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing a list of token holder'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        limit = 100,
        offset = 0,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (offset > 10000) {
        throw new Error('Offset must be less than 10000.');
      }

      if (limit > 100) {
        throw new Error('Limit must be less than 100.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset + limit must be less than 10000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/token/holder?address=${address}&offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          accept: 'application/json', 
          'x-chain': 'solana',
          'X-API-KEY': apiKey
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Birdeye API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getTokenHolders:', error);
      throw error;
    }
  }
};