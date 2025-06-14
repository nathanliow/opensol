import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenList: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenList',
    description:
      'Retrieve a list of tokens with various filtering and sorting options.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Specify the sort field',
        options: ['liquidity', 'market_cap', 'fdv', 'recent_listing_time', 'last_trade_unix_time', 'holder', 'volume_1h_usd', 'volume_2h_usd', 'volume_4h_usd', 'volume_8h_usd', 'volume_24h_usd', 'volume_1h_change_percent', 'volume_2h_change_percent', 'volume_4h_change_percent', 'volume_8h_change_percent', 'volume_24h_change_percent', 'price_change_1h_percent', 'price_change_2h_percent', 'price_change_4h_percent', 'price_change_8h_percent', 'price_change_24h_percent', 'trade_1h_count', 'trade_2h_count', 'trade_4h_count', 'trade_8h_count', 'trade_24h_count'],
        defaultValue: 'liquidity'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Specify the sort order',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
      },
      {
        name: 'min_liquidity',
        type: 'number',
        description: 'Minimum liquidity value'
      },
      {
        name: 'max_liquidity',
        type: 'number',
        description: 'Maximum liquidity value'
      },
      {
        name: 'min_market_cap',
        type: 'number',
        description: 'Minimum market cap value'
      },
      {
        name: 'max_market_cap',
        type: 'number',
        description: 'Maximum market cap value'
      },
      {
        name: 'min_fdv',
        type: 'number',
        description: 'Minimum FDV value'
      },
      {
        name: 'max_fdv',
        type: 'number',
        description: 'Maximum FDV value'
      },
      {
        name: 'min_recent_listing_time',
        type: 'number',
        description: 'Minimum recent listing time (unix timestamp)'
      },
      {
        name: 'max_recent_listing_time',
        type: 'number',
        description: 'Maximum recent listing time (unix timestamp)'
      },
      {
        name: 'min_last_trade_unix_time',
        type: 'number',
        description: 'Minimum last trade time (unix timestamp)'
      },
      {
        name: 'max_last_trade_unix_time',
        type: 'number',
        description: 'Maximum last trade time (unix timestamp)'
      },
      {
        name: 'min_holder',
        type: 'number',
        description: 'Minimum number of holders'
      },
      {
        name: 'min_volume_1h_usd',
        type: 'number',
        description: 'Minimum volume in the last hour (USD)'
      },
      {
        name: 'min_volume_2h_usd',
        type: 'number',
        description: 'Minimum volume in the last two hours (USD)'
      },
      {
        name: 'min_volume_4h_usd',
        type: 'number',
        description: 'Minimum volume in the last four hours (USD)'
      },
      {
        name: 'min_volume_8h_usd',
        type: 'number',
        description: 'Minimum volume in the last eight hours (USD)'
      },
      {
        name: 'min_volume_24h_usd',
        type: 'number',
        description: 'Minimum volume in the last 24 hours (USD)'
      },
      {
        name: 'min_volume_1h_change_percent',
        type: 'number',
        description: 'Minimum volume change percentage in the last hour'
      },
      {
        name: 'min_volume_2h_change_percent',
        type: 'number',
        description: 'Minimum volume change percentage in the last two hours'
      },
      {
        name: 'min_volume_4h_change_percent',
        type: 'number',
        description: 'Minimum volume change percentage in the last four hours'
      },
      {
        name: 'min_volume_8h_change_percent',
        type: 'number',
        description: 'Minimum volume change percentage in the last eight hours'
      },
      {
        name: 'min_volume_24h_change_percent',
        type: 'number',
        description: 'Minimum volume change percentage in the last 24 hours'
      },
      {
        name: 'min_price_change_1h_percent',
        type: 'number',
        description: 'Minimum price change percentage in the last hour'
      },
      {
        name: 'min_price_change_2h_percent',
        type: 'number',
        description: 'Minimum price change percentage in the last two hours'
      },
      {
        name: 'min_price_change_4h_percent',
        type: 'number',
        description: 'Minimum price change percentage in the last four hours'
      },
      {
        name: 'min_price_change_8h_percent',
        type: 'number',
        description: 'Minimum price change percentage in the last eight hours'
      },
      {
        name: 'min_price_change_24h_percent',
        type: 'number',
        description: 'Minimum price change percentage in the last 24 hours'
      },
      {
        name: 'min_trade_1h_count',
        type: 'number',
        description: 'Minimum number of trades in the last hour'
      },
      {
        name: 'min_trade_2h_count',
        type: 'number',
        description: 'Minimum number of trades in the last two hours'
      },
      {
        name: 'min_trade_4h_count',
        type: 'number',
        description: 'Minimum number of trades in the last four hours'
      },
      {
        name: 'min_trade_8h_count',
        type: 'number',
        description: 'Minimum number of trades in the last eight hours'
      },
      {
        name: 'min_trade_24h_count',
        type: 'number',
        description: 'Minimum number of trades in the last 24 hours'
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset for pagination (0-10000)',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit of records to return (1-100)',
        defaultValue: 100
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['standard', 'starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing a list of tokens'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        sort_by = 'liquidity',
        sort_type = 'desc',
        min_liquidity,
        max_liquidity,
        min_market_cap,
        max_market_cap,
        min_fdv,
        max_fdv,
        min_recent_listing_time,
        max_recent_listing_time,
        min_last_trade_unix_time,
        max_last_trade_unix_time,
        min_holder,
        min_volume_1h_usd,
        min_volume_2h_usd,
        min_volume_4h_usd,
        min_volume_8h_usd,
        min_volume_24h_usd,
        min_volume_1h_change_percent,
        min_volume_2h_change_percent,
        min_volume_4h_change_percent,
        min_volume_8h_change_percent,
        min_volume_24h_change_percent,
        min_price_change_1h_percent,
        min_price_change_2h_percent,
        min_price_change_4h_percent,
        min_price_change_8h_percent,
        min_price_change_24h_percent,
        min_trade_1h_count,
        min_trade_2h_count,
        min_trade_4h_count,
        min_trade_8h_count,
        min_trade_24h_count,
        offset = 0,
        limit = 100,
        apiKey, 
        network = 'mainnet',
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'standard' && apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      // Validate offset and limit constraints
      if (offset > 10000) {
        throw new Error('Offset must be less than or equal to 10000.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset + limit must be less than or equal to 10000.');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        sort_by,
        sort_type,
        offset: offset.toString(),
        limit: limit.toString()
      });

      // Add optional parameters if they exist
      const optionalParams = {
        min_liquidity,
        max_liquidity,
        min_market_cap,
        max_market_cap,
        min_fdv,
        max_fdv,
        min_recent_listing_time,
        max_recent_listing_time,
        min_last_trade_unix_time,
        max_last_trade_unix_time,
        min_holder,
        min_volume_1h_usd,
        min_volume_2h_usd,
        min_volume_4h_usd,
        min_volume_8h_usd,
        min_volume_24h_usd,
        min_volume_1h_change_percent,
        min_volume_2h_change_percent,
        min_volume_4h_change_percent,
        min_volume_8h_change_percent,
        min_volume_24h_change_percent,
        min_price_change_1h_percent,
        min_price_change_2h_percent,
        min_price_change_4h_percent,
        min_price_change_8h_percent,
        min_price_change_24h_percent,
        min_trade_1h_count,
        min_trade_2h_count,
        min_trade_4h_count,
        min_trade_8h_count,
        min_trade_24h_count
      };

      // Add non-undefined optional parameters to query
      Object.entries(optionalParams).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/token/list?${queryParams.toString()}`, {
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
      console.error('Error in getTokenList:', error);
      throw error;
    }
  }
};

export const getTokenListDisplayString = `export const getTokenList = async (params: Record<string, any>) => {
  try {
    const { 
      sort_by = 'liquidity',
      sort_type = 'desc',
      min_liquidity,
      max_liquidity,
      min_market_cap,
      max_market_cap,
      min_fdv,
      max_fdv,
      min_recent_listing_time,
      max_recent_listing_time,
      min_last_trade_unix_time,
      max_last_trade_unix_time,
      min_holder,
      min_volume_1h_usd,
      min_volume_2h_usd,
      min_volume_4h_usd,
      min_volume_8h_usd,
      min_volume_24h_usd,
      min_volume_1h_change_percent,
      min_volume_2h_change_percent,
      min_volume_4h_change_percent,
      min_volume_8h_change_percent,
      min_volume_24h_change_percent,
      min_price_change_1h_percent,
      min_price_change_2h_percent,
      min_price_change_4h_percent,
      min_price_change_8h_percent,
      min_price_change_24h_percent,
      min_trade_1h_count,
      min_trade_2h_count,
      min_trade_4h_count,
      min_trade_8h_count,
      min_trade_24h_count,
      offset = 0,
      limit = 100,
      network = 'mainnet',
    } = params;

    // Validate offset and limit constraints
    if (offset > 10000) {
      throw new Error('Offset must be less than or equal to 10000.');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100.');
    }

    if (offset + limit > 10000) {
      throw new Error('Offset + limit must be less than or equal to 10000.');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      sort_by,
      sort_type,
      offset: offset.toString(),
      limit: limit.toString()
    });

    // Add optional parameters if they exist
    const optionalParams = {
      min_liquidity,
      max_liquidity,
      min_market_cap,
      max_market_cap,
      min_fdv,
      max_fdv,
      min_recent_listing_time,
      max_recent_listing_time,
      min_last_trade_unix_time,
      max_last_trade_unix_time,
      min_holder,
      min_volume_1h_usd,
      min_volume_2h_usd,
      min_volume_4h_usd,
      min_volume_8h_usd,
      min_volume_24h_usd,
      min_volume_1h_change_percent,
      min_volume_2h_change_percent,
      min_volume_4h_change_percent,
      min_volume_8h_change_percent,
      min_volume_24h_change_percent,
      min_price_change_1h_percent,
      min_price_change_2h_percent,
      min_price_change_4h_percent,
      min_price_change_8h_percent,
      min_price_change_24h_percent,
      min_trade_1h_count,
      min_trade_2h_count,
      min_trade_4h_count,
      min_trade_8h_count,
      min_trade_24h_count
    };

    // Add non-undefined optional parameters to query
    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch('https://public-api.birdeye.so/defi/v3/token/list?' + queryParams.toString(), {
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
    console.error('Error in getTokenList:', error);
    throw error;
  }
};
`;

export const getTokenListExecuteString = `async function getTokenList(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      sort_by = 'liquidity',
      sort_type = 'desc',
      min_liquidity,
      max_liquidity,
      min_market_cap,
      max_market_cap,
      min_fdv,
      max_fdv,
      min_recent_listing_time,
      max_recent_listing_time,
      min_last_trade_unix_time,
      max_last_trade_unix_time,
      min_holder,
      min_volume_1h_usd,
      min_volume_2h_usd,
      min_volume_4h_usd,
      min_volume_8h_usd,
      min_volume_24h_usd,
      min_volume_1h_change_percent,
      min_volume_2h_change_percent,
      min_volume_4h_change_percent,
      min_volume_8h_change_percent,
      min_volume_24h_change_percent,
      min_price_change_1h_percent,
      min_price_change_2h_percent,
      min_price_change_4h_percent,
      min_price_change_8h_percent,
      min_price_change_24h_percent,
      min_trade_1h_count,
      min_trade_2h_count,
      min_trade_4h_count,
      min_trade_8h_count,
      min_trade_24h_count,
      offset = 0,
      limit = 100,
      apiKey, 
      network = 'mainnet',
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Birdeye API key is required.');
    }

    if (apiKey.tier != 'standard' && apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
      throw new Error('Invalid API key tier.');
    }

    // Validate offset and limit constraints
    if (offset > 10000) {
      throw new Error('Offset must be less than or equal to 10000.');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100.');
    }

    if (offset + limit > 10000) {
      throw new Error('Offset + limit must be less than or equal to 10000.');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      sort_by,
      sort_type,
      offset: offset.toString(),
      limit: limit.toString()
    });

    // Add optional parameters if they exist
    const optionalParams = {
      min_liquidity,
      max_liquidity,
      min_market_cap,
      max_market_cap,
      min_fdv,
      max_fdv,
      min_recent_listing_time,
      max_recent_listing_time,
      min_last_trade_unix_time,
      max_last_trade_unix_time,
      min_holder,
      min_volume_1h_usd,
      min_volume_2h_usd,
      min_volume_4h_usd,
      min_volume_8h_usd,
      min_volume_24h_usd,
      min_volume_1h_change_percent,
      min_volume_2h_change_percent,
      min_volume_4h_change_percent,
      min_volume_8h_change_percent,
      min_volume_24h_change_percent,
      min_price_change_1h_percent,
      min_price_change_2h_percent,
      min_price_change_4h_percent,
      min_price_change_8h_percent,
      min_price_change_24h_percent,
      min_trade_1h_count,
      min_trade_2h_count,
      min_trade_4h_count,
      min_trade_8h_count,
      min_trade_24h_count
    };

    // Add non-undefined optional parameters to query
    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(\`https://public-api.birdeye.so/defi/v3/token/list?\${queryParams.toString()}\`, {
      method: 'GET',
      headers: {
        accept: 'application/json', 
        'x-chain': 'solana',
        'X-API-KEY': apiKey.key
      },
    }); 

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Birdeye API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getTokenList:', error);
    throw error;
  }
};
`;