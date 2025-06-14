import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getValidityProof: BlockFunctionTemplate = {
  metadata: {
    name: 'getValidityProof',
    description: 'Returns a single ZK Proof used by the compression program to verify that the given accounts are valid and that the new addresses can be created.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'hashes',
        type: 'string[]',
        description: 'The addresses of the compressed accounts to get the proofs for.'
      },
      {
        name: 'addresses',
        type: 'string[]',
        description: 'Address to verify through ZK proof.'
      },
      {
        name: 'trees',
        type: 'string[]',
        description: 'The trees to verify the addresses against.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved validity proof for Solana compressed accounts'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        addresses,
        hashes,
        trees,
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
          method: 'getValidityProof',
          params: [{
            hashes: hashes,
            newAddressesWithTrees: addresses.map((address: string, index: number) => ({
              address: address,
              tree: trees[index]
            }))
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
      console.error('Error in getValidityProof:', error);
      throw error;
    }
  }
};

export const getValidityProofDisplayString = `export const getValidityProof = async (params: Record<string, any>) => {
  try {
    const { 
      addresses,
      hashes,
      trees,
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
        method: 'getValidityProof',
        params: [{
          hashes: hashes,
          newAddressesWithTrees: addresses.map((address: string, index: number) => ({
            address: address,
            tree: trees[index]
          }))
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
    console.error('Error in getValidityProof:', error);
    throw error;
  }
};
`;

export const getValidityProofExecuteString = `async function getValidityProof(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      addresses,
      hashes,
      trees,
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
        method: 'getValidityProof',
        params: [{
          hashes: hashes,
          newAddressesWithTrees: addresses.map((address: string, index: number) => ({
            address: address,
            tree: trees[index]
          }))
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
    console.error('Error in getValidityProof:', error);
    throw error;
  }
};
`;