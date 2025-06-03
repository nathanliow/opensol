import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getMinimumBalanceForRentExemption: BlockFunctionTemplate = {
  metadata: {
    name: 'getMinimumBalanceForRentExemption',
    description:
      'Get the minimum balance for rent exemption',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'length',
        type: 'number',
        description: 'Account data length'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Minimum balance for rent exemption'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        accountDataLength,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getMinimumBalanceForRentExemption',
          params: [
            accountDataLength
          ]  
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getMinimumBalanceForRentExemption:', error);
      throw error;
    }
  }
};

export const getMinimumBalanceForRentExemptionString = `
export const getMinimumBalanceForRentExemption = async (params: Record<string, any>) => {
  try {
    const { 
      accountDataLength,
      network = 'devnet' 
    } = params;

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getMinimumBalanceForRentExemption',
        params: [accountDataLength]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getMinimumBalanceForRentExemption:', error);
    throw error;
  }
};
`;