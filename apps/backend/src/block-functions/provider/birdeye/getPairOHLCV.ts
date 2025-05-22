import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPairOHLCV: BlockFunctionTemplate = {
  metadata: {
    name: 'getPairOHLCV',
    description:
      'Retrieve candlestick data in OHLCV format of a specified pair. Maximum 1000 records.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the pair'
      },
      {
        name: 'interval',
        type: 'dropdown',
        description: 'Time interval for the candlestick data (e.g., "1m", "1H", "1D")',
        options: ['1m', '3m', '5m', '15m', '30m', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '3D', '1W', '1M']
      },
      {
        name: 'timeFrom',
        type: 'number',
        description: 'Start time using unix timestamps in seconds',
        defaultValue: 0
      },
      {
        name: 'timeTo',
        type: 'number',
        description: 'End time using unix timestamps in seconds',
        defaultValue: 0
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing list of ohlc and volume of pair'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        interval,
        timeFrom,
        timeTo,
        apiKey, 
        network = 'mainnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' || apiKey.tier != 'premium' || apiKey.tier != 'business' || apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Pair address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/ohlcv/pair?address=${address}&type=${interval}&time_from=${timeFrom}&time_to=${timeTo}`, {
        method: 'GET',
        headers: {
          accept: 'application/json', 
          'x-chain': 'solana',
          'X-API-KEY': apiKey.key
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Birdeye API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getPairOHLCV:', error);
      throw error;
    }
  }
};