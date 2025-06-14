import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getWalletTransactionHistory: BlockFunctionTemplate = {
  metadata: {
    name: 'getWalletTransactionHistory',
    description:
      'Retrieve the transaction history of a specified wallet.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the wallet'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit for the transaction history',
        defaultValue: 100
      },
      {
        name: 'before',
        type: 'string',
        description: 'A transaction hash to traverse starting from',
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
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        address,
        before = '',
        limit = 100,
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

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 10.');
      }

      const response = await fetch(`https://public-api.birdeye.so/v1/wallet/tx_list?wallet=${address}&limit=${limit}&before=${before}`, {
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
      console.error('Error in getWalletTransactionHistory:', error);
      throw error;
    }
  }
};

export const getWalletTransactionHistoryDisplayString = `export const getWalletTransactionHistory = async (params: Record<string, any>) => {
  try {
    const { 
      address,
      before = '',
      limit = 100,
      network = 'mainnet',
    } = params;

    if (!address) {
      throw new Error('Address is required.');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 10.');
    }

    const response = await fetch('https://public-api.birdeye.so/v1/wallet/tx_list?wallet=\${address}&limit=\${limit}&before=\${before}', {
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
    console.error('Error in getWalletTransactionHistory:', error);
    throw error;
  }
};
`;

export const getWalletTransactionHistoryExecuteString = `async function getWalletTransactionHistory(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      address,
      before = '',
      limit = 100,
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

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 10.');
    }

    const response = await fetch(\`https://public-api.birdeye.so/v1/wallet/tx_list?wallet=\${address}&limit=\${limit}&before=\${before}\`, {
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
    console.error('Error in getWalletTransactionHistory:', error);
    throw error;
  }
};
`;