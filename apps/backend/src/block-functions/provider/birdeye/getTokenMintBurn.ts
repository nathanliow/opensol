import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenMintBurn: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenMintBurn',
    description:
      'Retrieve the mint/burn transaction list of a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Specify the sort field',
        options: ['block_time'],
        defaultValue: 'block_time'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Specify the sort order',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
      },
      {
        name: 'type',
        type: 'dropdown',
        description: 'Specify the type of transaction',
        options: ['all', 'mint', 'burn'],
        defaultValue: 'all'
      },
      {
        name: 'after_time',
        type: 'number',
        description: 'Specify the lower bound of time. Filter for records with time greater than the specified after time value, excluding those with time equal to the specified after time.',
        defaultValue: 0
      },
      {
        name: 'before_time',
        type: 'number',
        description: 'Specify the upper bound of time. Filter for records with time less than the specified before time value, excluding those with time equal to the specified before time.',
        defaultValue: 0
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset for the mint/burn transactions',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit for the mint/burn transactions',
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
        sort_by = 'block_time',
        sort_type = 'desc',
        type = 'all',
        after_time,
        before_time,
        offset = 0,
        limit = 100,
        apiKey, 
        network = 'mainnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' || apiKey.tier != 'premium' || apiKey.tier != 'business' || apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (after_time < 0 || before_time < 0) {
        throw new Error('Time values must be greater than 0.');
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

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/token/mint-burn-txs?address=${address}&sort_by=${sort_by}&sort_type=${sort_type}&type=${type}&after_time=${after_time}&before_time=${before_time}&offset=${offset}&limit=${limit}`, {
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
      console.error('Error in getTokenMintBurn:', error);
      throw error;
    }
  }
};