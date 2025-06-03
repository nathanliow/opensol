import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTradesLatestBlockNumber: BlockFunctionTemplate = {
  metadata: {
    name: 'getTradesLatestBlockNumber',
    description:
      'Retrieve the latest block number of trades on a chain.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
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
        apiKey, 
        network = 'mainnet',
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/txs/latest-block`, {
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
      console.error('Error in getTradesLatestBlockNumber:', error);
      throw error;
    }
  }
};

export const getTradesLatestBlockNumberString = `
export const getTradesLatestBlockNumber = async (params: Record<string, any>) => {
  try {
    const { 
      network = 'mainnet',
    } = params;

    const response = await fetch('https://public-api.birdeye.so/defi/v3/txs/latest-block', {
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
    console.error('Error in getTradesLatestBlockNumber:', error);
    throw error;
  }
};
`;