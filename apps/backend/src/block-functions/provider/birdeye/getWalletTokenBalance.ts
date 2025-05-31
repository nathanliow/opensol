import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getWalletTokenBalance: BlockFunctionTemplate = {
  metadata: {
    name: 'getWalletTokenBalance',
    description:
      'Retrieve the token balance of a specified wallet.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the wallet'
      },
      {
        name: 'token',
        type: 'string',
        description: 'Address of the token',
        defaultValue: ''
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
      const { 
        address,
        token,
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

      if (!token) {
        throw new Error('Token is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/v1/wallet/token_balance?wallet=${address}&token_address=${token}`, {
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
      console.error('Error in getWalletTokenBalance:', error);
      throw error;
    }
  }
};

export const getWalletTokenBalanceString = `
export const getWalletTokenBalance = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      token,
      network = 'mainnet',
    } = params;

    if (!address) {
      throw new Error('Address is required.');
    }

    if (!token) {
      throw new Error('Token is required.');
    }

    const response = await fetch('https://public-api.birdeye.so/v1/wallet/token_balance?wallet=\${address}&token_address=\${token}', {
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
    console.error('Error in getWalletTokenBalance:', error);
    throw error;
  }
};
`;