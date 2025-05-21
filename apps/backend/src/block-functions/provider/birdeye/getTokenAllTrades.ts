import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenAllTrades: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenAllTrades',
    description:
      'Get all time trades or follow duration transactions for one token.',
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
        description: 'Timeframe for the trades',
        options: ['30m', '1h', '2h', '4h', '8h', '24h', '3d', '7d', '14d', '30d', '90d', '180d', '1y', 'alltime'],
        defaultValue: '24h'
      },
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['standard', 'starter', 'premium', 'business', 'enterprise']
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
        timeframe = '24h',
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address || !timeframe) {
        throw new Error('Address and timeframe are required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/all-time/trades/single?time_frame=${timeframe}&address=${address}`, {
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
      console.error('Error in getTokenAllTrades:', error);
      throw error;
    }
  }
};