import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenSecurity: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenSecurity',
    description:
      'Retrieve the security information of a specified token.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token'
      },
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['standard', 'starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing security information of a token'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
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

      const response = await fetch(`https://public-api.birdeye.so/defi/token_security?address=${address}`, {
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
      console.error('Error in getTokenSecurity:', error);
      throw error;
    }
  }
};