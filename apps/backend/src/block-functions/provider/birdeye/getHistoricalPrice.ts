import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getHistoricalPrice: BlockFunctionTemplate = {
  metadata: {
    name: 'getHistoricalPrice',
    description:
      'Retrieve historical price data of a specified token.',
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
      birdeye: ['standard', 'starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing list of ohlc and volume of base and quote'
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

      if (apiKey.tier != 'standard' || apiKey.tier != 'starter' || apiKey.tier != 'premium' || apiKey.tier != 'business' || apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/history_price?address=${address}&address_type=token&type=${interval}&time_from=${timeFrom}&time_to=${timeTo}`, {
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
      console.error('Error in getHistoricalPrice:', error);
      throw error;
    }
  }
};