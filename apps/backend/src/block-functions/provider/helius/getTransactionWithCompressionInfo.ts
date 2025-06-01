import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTransactionWithCompressionInfo: BlockFunctionTemplate = {
  metadata: {
    name: 'getTransactionWithCompressionInfo',
    description: 'Returns the transaction data for the transaction with the given signature along with parsed compression info.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'signature',
        type: 'string',
        description: 'The signature of the transaction to get the compression info for.'
      }
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved transaction with compression information from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        signature,
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!signature) {
        throw new Error('Signature is required.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getTransactionWithCompressionInfo',
          params: [{
            signature: signature
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getTransactionWithCompressionInfo:', error);
      throw error;
    }
  }
};

export const getTransactionWithCompressionInfoString = `
export const getTransactionWithCompressionInfo = async (params: Record<string, any>) => {
  try {
    const { 
      signature,
      network = 'devnet' 
    } = params;
      
    if (!signature) {
      throw new Error('Signature is required.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getTransactionWithCompressionInfo',
        params: [{
          signature: signature
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getTransactionWithCompressionInfo:', error);
    throw error;
  }
};
`;
