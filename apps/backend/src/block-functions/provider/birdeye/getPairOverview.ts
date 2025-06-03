import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPairOverview: BlockFunctionTemplate = {
  metadata: {
    name: 'getPairOverview',
    description:
      'Retrieve stats of a specified pair.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the pair'
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
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        address,
        apiKey, 
        network = 'mainnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Pair address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/pair/overview/single?address=${address}`, {
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
      console.error('Error in getPairOverview:', error);
      throw error;
    }
  }
};

export const getPairOverviewString = `
export const getPairOverview = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      network = 'mainnet'
    } = params;

    if (!address) {
      throw new Error('Pair address is required.');
    }

    const response = await fetch('https://public-api.birdeye.so/defi/v3/pair/overview/single?address=\${address}', {
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
    console.error('Error in getPairOverview:', error);
    throw error;
  }
};
`;