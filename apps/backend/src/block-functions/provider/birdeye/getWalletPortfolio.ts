import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getWalletPortfolio: BlockFunctionTemplate = {
  metadata: {
    name: 'getWalletPortfolio',
    description:
      'Retrieve the portfolio for a specified wallet.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the wallet'
      },
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['standard', 'starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing portfolio information of a wallet'
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
        network = 'mainnet',
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/v1/wallet/token_list?wallet=${address}`, {
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
      console.error('Error in getWalletPortfolio:', error);
      throw error;
    }
  }
};

export const getWalletPortfolioDisplayString = `export const getWalletPortfolio = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      network = 'mainnet',
    } = params;

    if (!address) {
      throw new Error('Address is required.');
    }

    const response = await fetch('https://public-api.birdeye.so/v1/wallet/token_list?wallet=\${address}', {
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
    console.error('Error in getWalletPortfolio:', error);
    throw error;
  }
};
`;

export const getWalletPortfolioExecuteString = `async function getWalletPortfolio(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      address,
      apiKey, 
      network = 'mainnet',
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Birdeye API key is required.');
    }

    if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
      throw new Error('Invalid API key tier.');
    }

    if (!address) {
      throw new Error('Address is required.');
    }

    const response = await fetch(\`https://public-api.birdeye.so/v1/wallet/token_list?wallet=\${address}\`, {
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
    console.error('Error in getWalletPortfolio:', error);
    throw error;
  }
};
`;