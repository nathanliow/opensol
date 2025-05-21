import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenMetadata: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenMetadata',
    description:
      'Retrieve the latest price information for a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing metadata of a specific token'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/token/meta-data/single?address=${address}`, {
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
      console.error('Error in getTokenMetadata:', error);
      throw error;
    }
  }
};