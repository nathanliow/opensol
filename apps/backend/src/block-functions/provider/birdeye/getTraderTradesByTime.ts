import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTraderTradesByTime: BlockFunctionTemplate = {
  metadata: {
    name: 'getTraderTradesByTime',
    description:
      'Retrieve a list of trades of a trader with time bound option.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'before_time',
        type: 'number',
        description: 'Specify the time seeked before using unix timestamps in seconds',
      },
      {
        name: 'after_time',
        type: 'number',
        description: 'Specify the time seeked after using unix timestamps in seconds',
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset for the trades',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit for the trades',
        defaultValue: 100
      }
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
        before_time,
        after_time,
        offset = 0,
        limit = 100,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (before_time < 0 || before_time > 10000000000 || after_time < 0 || after_time > 10000000000) {
        throw new Error('Time must be between 0 and 10000000000.');
      }

      if (offset < 0 || offset > 10000) {
        throw new Error('Offset must be between 0 and 10000.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset + limit must be less than 10000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/trader/txs/seek_by_time?address=${address}&offset=${offset}&limit=${limit}&${before_time ? `before_time=${before_time}&` : ''}${after_time ? `after_time=${after_time}&` : ''}`, {
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
      console.error('Error in getTraderTradesByTime:', error);
      throw error;
    }
  }
};