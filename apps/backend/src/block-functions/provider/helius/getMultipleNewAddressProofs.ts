import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getMultipleNewAddressProofs: BlockFunctionTemplate = {
  metadata: {
    name: 'getMultipleNewAddressProofs',
    description: 'Returns proofs that the new addresses are not taken already and can be created.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'The address to get the proof for.'
      },
      {
        name: 'tree',
        type: 'string',
        description: 'The tree to get the proof for.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved multiple new address proofs (V2) from the Solana compression service'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        address,
        tree,
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
          method: 'getMultipleNewAddressProofs',
          params: [{
            address: address,
            tree: tree
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
      console.error('Error in getMultipleNewAddressProofs:', error);
      throw error;
    }
  }
};

export const getMultipleNewAddressProofsDisplayString = `export const getMultipleNewAddressProofs = async (params: Record<string, any>) => {
  try {
    const { 
      addresses,
      hashes,
      network = 'devnet' 
    } = params;
      
    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getMultipleNewAddressProofs',
        params: [{
          address: address,
          tree: tree
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
    console.error('Error in getMultipleNewAddressProofs:', error);
    throw error;
  }
};
`;

export const getMultipleNewAddressProofsExecuteString = `async function getMultipleNewAddressProofs(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      address,
      tree,
      apiKey,
      network = 'devnet' 
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Helius API key is required.');
    }

    if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
      throw new Error('Invalid API key tier.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${apiKey.key}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getMultipleNewAddressProofs',
        params: [{
          address: address,
          tree: tree
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Helius API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getMultipleNewAddressProofs:', error);
    throw error;
  }
};
`;