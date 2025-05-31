import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTraderGainersAndLosers: BlockFunctionTemplate = {
  metadata: {
    name: 'getTraderGainersAndLosers',
    description:
      'Retrieve the top traders of a specified token.',
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
        description: 'Specify the timeframe',
        options: ['yesterday', 'today', '1W'],
        defaultValue: '1W'
      },
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Specify the sort field',
        options: ['PnL'],
        defaultValue: 'PnL'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Specify the sort order',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
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
        defaultValue: 10
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
        timeframe = '1W',
        sort_by = 'PnL',
        sort_type = 'desc',
        offset = 0,
        limit = 10,
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

      if (offset < 0 || offset > 10000) {
        throw new Error('Offset must be between 0 and 10000.');
      }

      if (limit < 1 || limit > 10) {
        throw new Error('Limit must be between 1 and 10.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset + limit must be less than 10000.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v2/tokens/top_traders?address=${address}&time_frame=${timeframe}&sort_type=${sort_type}&sort_by=${sort_by}&offset=${offset}&limit=${limit}`, {
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
      console.error('Error in getTraderGainersAndLosers:', error);
      throw error;
    }
  }
};

export const getTraderGainersAndLosersString = `
export const getTraderGainersAndLosers = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      timeframe = '1W',
      sort_by = 'PnL',
      sort_type = 'desc',
      offset = 0,
      limit = 10,
      network = 'mainnet',
    } = params;

    if (!address) {
      throw new Error('Address is required.');
    }

    if (offset < 0 || offset > 10000) {
      throw new Error('Offset must be between 0 and 10000.');
    }

    if (limit < 1 || limit > 10) {
      throw new Error('Limit must be between 1 and 10.');
    }

    if (offset + limit > 10000) {
      throw new Error('Offset + limit must be less than 10000.');
    }

    const response = await fetch('https://public-api.birdeye.so/defi/v2/tokens/top_traders?address=\${address}&time_frame=\${timeframe}&sort_type=\${sort_type}&sort_by=\${sort_by}&offset=\${offset}&limit=\${limit}', {
      method: 'GET',
      headers: {
        accept: 'application/json', 
        'x-chain': 'solana',
        'X-API-KEY': process.env.BIRDEYE_API_KEY
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Birdeye API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getTraderGainersAndLosers:', error);
    throw error;
  }
};
`;