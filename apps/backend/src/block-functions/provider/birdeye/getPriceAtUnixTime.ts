import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPriceAtUnixTime: BlockFunctionTemplate = {
  metadata: {
    name: 'getPriceAtUnixTime',
    description:
      'Retrieve the latest price information for a specified token at a given unix timestamp.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'unixTimestamp',
        type: 'number',
        description: 'Unix timestamp of when to get price of token'
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing list of a token\'s transactions'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        unixTimestamp,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/historical_price_unix?address=${address}&unixtime=${unixTimestamp}`, {
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
      console.error('Error in getPriceAtUnixTime:', error);
      throw error;
    }
  }
};