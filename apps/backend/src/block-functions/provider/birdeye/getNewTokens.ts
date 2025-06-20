import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getNewTokens: BlockFunctionTemplate = {
  metadata: {
    name: 'getNewTokens',
    description:
      'Retrieve a list of newly listed tokens.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'timeTo',
        type: 'number',
        description: 'End time using unix timestamps in seconds',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit the number of records returned.',
        defaultValue: 10
      },      
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing a list of newly listed tokens'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        timeTo,
        limit,
        apiKey, 
        network = 'mainnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (timeTo < 0 || timeTo > 10000000000) {
        throw new Error('Time to must be between 0 and 10000000000.');
      }

      if (limit < 1 || limit > 20) {
        throw new Error('Limit must be between 1 and 20.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v2/tokens/new_listing?time_to=${timeTo}&limit=${limit}&meme_platform_enabled=true`, {
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
      console.error('Error in getNewTokens:', error);
      throw error;
    }
  }
};

export const getNewTokensDisplayString = `export const getNewTokens = async (params: Record<string, any>) => {
  try {
    const { 
      timeTo,
      limit,
      network = 'mainnet' 
    } = params;

    if (timeTo < 0 || timeTo > 10000000000) {
      throw new Error('Time to must be between 0 and 10000000000.');
    }

    if (limit < 1 || limit > 20) {
      throw new Error('Limit must be between 1 and 20.');
    }

    const response = await fetch('https://public-api.birdeye.so/defi/v2/tokens/new_listing?time_to=\${timeTo}&limit=\${limit}&meme_platform_enabled=true', {
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
    console.error('Error in getNewTokens:', error);
    throw error;
  }
};
`;

export const getNewTokensExecuteString = `async function getNewTokens(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      timeTo,
      limit,
      apiKey, 
      network = 'mainnet' 
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Birdeye API key is required.');
    }

    if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
      throw new Error('Invalid API key tier.');
    }

    if (timeTo < 0 || timeTo > 10000000000) {
      throw new Error('Time to must be between 0 and 10000000000.');
    }

    if (limit < 1 || limit > 20) {
      throw new Error('Limit must be between 1 and 20.');
    }

    const response = await fetch(\`https://public-api.birdeye.so/defi/v2/tokens/new_listing?time_to=\${timeTo}&limit=\${limit}&meme_platform_enabled=true\`, {
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
    console.error('Error in getNewTokens:', error);
    throw error;
  }
};
`;