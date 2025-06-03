import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getMultipleCompressedAccountProofs: BlockFunctionTemplate = {
  metadata: {
    name: 'getMultipleCompressedAccountProofs',
    description: 'Returns multiple proofs used by the compression program to verify the accounts\' validity.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'hashes',
        type: 'string[]',
        description: 'The hashes of the compressed account to get the proofs for.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'The name of the method to invoke for retrieving recent Solana compression transaction signatures.'
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

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getMultipleCompressedAccountProofs',
          params: [hash]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getMultipleCompressedAccountProofs:', error);
      throw error;
    }
  }
};

export const getMultipleCompressedAccountProofsString = `
export const getMultipleCompressedAccountProofs = async (params: Record<string, any>) => {
  try {
    const { 
      hash,
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
        method: 'getMultipleCompressedAccountProofs',
        params: [hash]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getMultipleCompressedAccountProofs:', error);
    throw error;
  }
};
`;
