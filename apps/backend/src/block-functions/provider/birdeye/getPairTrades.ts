import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPairTrades: BlockFunctionTemplate = {
  metadata: {
    name: 'getPairTrades',
    description:
      'Retrieve trades of a specified pair.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the pair'
      },
      {
        name: 'txnType',
        type: 'dropdown',
        description: 'Type of transactions to retrieve',
        options: ['all', 'add', 'remove', 'swap'],
        defaultValue: 'swap'
      },
      {
        name: 'sortType',
        type: 'dropdown',
        description: 'Sort type',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset the number of trades returned',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit the number of trades returned',
        defaultValue: 50
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing transactions of a pair'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        apiKey, 
        txnType = 'swap',
        sortType = 'desc',
        offset = 0,
        limit = 50,
        network = 'mainnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Pair address is required.');
      }

      if (offset < 0 || offset > 50000) {
        throw new Error('Offset must be between 0 and 50000.');
      }

      if (limit < 1 || limit > 50) {
        throw new Error('Limit must be between 1 and 50.');
      }

      if (offset + limit > 50000) {
        throw new Error('Offset and limit must be less than 50000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/txs/pair?address=${address}&offset=${offset}&limit=${limit}&tx_type=${txnType}&sort_type=${sortType}`, {
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
      console.error('Error in getPairTrades:', error);
      throw error;
    }
  }
};