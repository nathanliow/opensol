import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressionSignaturesForAccount: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressionSignaturesForAccount',
    description:'Return the signatures of the transactions that closed or opened a compressed account with the given hash.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'hash',
        type: 'string',
        description: 'The hash of the compressed account to get the signatures for.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved compression signatures for the specified account from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        hash,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!hash) {
        throw new Error('Hash is required.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getCompressionSignaturesForAccount',
          params: [{
            hash: hash
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
      console.error('Error in getCompressionSignaturesForAccount:', error);
      throw error;
    }
  }
};

export const getCompressionSignaturesForAccountString = `
export const getCompressionSignaturesForAccount = async (params: Record<string, any>) => {
  try {
    const { 
      hash,
      network = 'devnet' 
    } = params;
      
    if (!hash) {
      throw new Error('Hash is required.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressionSignaturesForAccount',
        params: [{
          hash: hash
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
    console.error('Error in getCompressionSignaturesForAccount:', error);
    throw error;
  }
};
`;
