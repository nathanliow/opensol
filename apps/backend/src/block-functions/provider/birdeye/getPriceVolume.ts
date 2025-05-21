import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPriceVolume: BlockFunctionTemplate = {
  metadata: {
    name: 'getPriceVolume',
    description:
      'Retrieve price and volume updates of a specified token.',
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
        description: 'Timeframe of price and volume updates',
        options: ['1h', '2h', '4h', '8h', '24h'],
        defaultValue: '1h'
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing price and volume with changes data of a token'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        timeframe,
        apiKey, 
        network = 'devnet',
      } = params;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/price_volume/single?address=${address}&type=${timeframe}`, {
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
      console.error('Error in getPriceVolume:', error);
      throw error;
    }
  }
};