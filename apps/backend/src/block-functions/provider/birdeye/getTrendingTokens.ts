import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTrendingTokens: BlockFunctionTemplate = {
  metadata: {
    name: 'getTrendingTokens',
    description:
      'Retrieve a dynamic and up-to-date list of trending tokens based on specified sorting criteria.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Sort by',
        options: ['rank', 'volume24hUSD', 'liquidity'],
        defaultValue: 'rank'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Sort order',
        options: ['asc', 'desc'],
        defaultValue: 'asc'
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset the number of tokens returned',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit the number of tokens returned',
        defaultValue: 20
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
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        sort_by = 'rank',
        sort_type = 'asc',
        offset = 0,
        limit = 20,
        apiKey, 
        network = 'mainnet',
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (offset < 0 || offset > 10000) {
        throw new Error('Offset must be between 0 and 10000.');
      }

      if (limit < 1 || limit > 20) {
        throw new Error('Limit must be between 1 and 20.');
      }
      
      const response = await fetch(`https://public-api.birdeye.so/defi/token_trending?sort_by=${sort_by}&sort_type=${sort_type}&offset=${offset}&limit=${limit}`, {
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
      console.error('Error in getTrendingTokens:', error);
      throw error;
    }
  }
};

export const getTrendingTokensDisplayString = `export const getTrendingTokens = async (params: Record<string, any>) => {
  try {
    const { 
      sort_by = 'rank',
      sort_type = 'asc',
      offset = 0,
      limit = 20,
      network = 'mainnet',
    } = params;

    if (offset < 0 || offset > 10000) {
      throw new Error('Offset must be between 0 and 10000.');
    }

    if (limit < 1 || limit > 20) {
      throw new Error('Limit must be between 1 and 20.');
    }
    
    const response = await fetch('https://public-api.birdeye.so/defi/token_trending?sort_by=\${sort_by}&sort_type=\${sort_type}&offset=\${offset}&limit=\${limit}', {
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
    console.error('Error in getTrendingTokens:', error);
    throw error;
  }
};
`;

export const getTrendingTokensExecuteString = `async function getTrendingTokens(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      sort_by = 'rank',
      sort_type = 'asc',
      offset = 0,
      limit = 20,
      apiKey, 
      network = 'mainnet',
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Birdeye API key is required.');
    }

    if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
      throw new Error('Invalid API key tier.');
    }

    if (offset < 0 || offset > 10000) {
      throw new Error('Offset must be between 0 and 10000.');
    }

    if (limit < 1 || limit > 20) {
      throw new Error('Limit must be between 1 and 20.');
    }
    
    const response = await fetch(\`https://public-api.birdeye.so/defi/token_trending?sort_by=\${sort_by}&sort_type=\${sort_type}&offset=\${offset}&limit=\${limit}\`, {
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
    console.error('Error in getTrendingTokens:', error);
    throw error;
  }
};
`;