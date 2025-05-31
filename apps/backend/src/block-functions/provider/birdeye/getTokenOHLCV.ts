import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenOHLCV: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenOHLCV',
    description:
      'Retrieve the OHLCV data of a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'interval',
        type: 'dropdown',
        description: 'Time interval for the candlestick data (e.g., "1m", "1H", "1D")',
        options: ['1m', '3m', '5m', '15m', '30m', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '3D', '1W', '1M']
      },
      {
        name: 'currency',
        type: 'dropdown',
        description: 'Currency in which OHLCV data is presented.',
        options: ['usd', 'native'],
        defaultValue: 'usd'
      },
      {
        name: 'time_from',
        type: 'number',
        description: 'Start time using unix timestamps in seconds',
        defaultValue: 0
      },
      {
        name: 'time_to',
        type: 'number',
        description: 'End time using unix timestamps in seconds',
        defaultValue: 0
      },
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing a list of mint/burn transactions'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        interval,
        currency = 'usd',
        time_from,
        time_to,
        apiKey, 
        network = 'mainnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (!interval) {
        throw new Error('Interval is required.');
      }

      if (!time_from) {
        throw new Error('Time from is required.');
      }

      if (time_from < 0 || time_from > 10000000000) { 
        throw new Error('Time from must be between 0 and 10000000000.');
      }

      if (!time_to) {
        throw new Error('Time to is required.');
      }

      if (time_to < 0 || time_to > 10000000000) { 
        throw new Error('Time to must be between 0 and 10000000000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${interval}&currency=${currency}&time_from=${time_from}&time_to=${time_to}`, {
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
      console.error('Error in getTokenOHLCV:', error);
      throw error;
    }
  }
};