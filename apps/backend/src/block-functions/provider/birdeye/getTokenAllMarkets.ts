import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenAllMarkets: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenAllMarkets',
    description:
      'Retrieve a list of markets for a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'timeframe',
        type: 'dropdown',
        description: 'Timeframe for the markets',
        options: ['30m', '1h', '2h', '4h', '8h', '12h', '24h'],
        defaultValue: '24h'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Sort type for the markets',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
      },
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Sort field for the markets',
        options: ['liquidity', 'volume24h'],
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset for the markets',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit for the markets',
        defaultValue: 10
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing price and liquidity information of a token'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        timeframe,
        sort_type,
        sort_by,
        offset,
        limit,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (limit < 1 || limit > 20) {
        throw new Error('Limit must be between 1 and 20.');
      }

      if (offset < 0 || offset > 10000) {
        throw new Error('Offset must be between 0 and 10000.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset and limit must be less than 10000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v2/markets?time_frame=${timeframe}&sort_type=${sort_type}&sort_by=${sort_by}&offset=${offset}&limit=${limit}`, {
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
      console.error('Error in getTokenAllMarkets:', error);
      throw error;
    }
  }
};