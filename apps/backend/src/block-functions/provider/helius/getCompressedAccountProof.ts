import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressedAccountProof: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressedAccountProof',
    description:
      'Returns a proof the compression program uses to verify that the account is valid.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'hash',
        type: 'string',
        description: 'The hash of the account to get the compressed account for.'
      }
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved merkle proof for the requested Solana compressed account'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        hash,
        apiKey, 
        network = 'devnet' 
      } = params;
      
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
          method: 'getCompressedAccountProof',
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
      console.error('Error in getCompressedAccountProof:', error);
      throw error;
    }
  }
};

export const getCompressedAccountProofString = `
export const getCompressedAccountProof = async (params: Record<string, any>) => {
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
        method: 'getCompressedAccountProof',
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
    console.error('Error in getCompressedAccountProof:', error);
    throw error;
  }
};
`;
