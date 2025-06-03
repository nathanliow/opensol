import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getBlockCommitment: BlockFunctionTemplate = {
  metadata: {
    name: 'getBlockCommitment',
    description:
      'Get the commitment for a specific block',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'blockNumber',
        type: 'number',
        description: 'Block number to get'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Commitment for a specific block'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        blockNumber, 
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!blockNumber) {
        throw new Error('Block number is required.');
      }
      
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
          method: 'getBlockCommitment',
          params: [
            blockNumber,
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
      console.error('Error in getBlockCommitment:', error);
      throw error;
    }
  }
};

export const getBlockCommitmentString = `
export const getBlockCommitment = async (params: Record<string, any>) => {
  try {
    const { 
      blockNumber, 
      network = 'devnet' 
    } = params;

    if (!blockNumber) {
      throw new Error('Block number is required.');
    }

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getBlockCommitment',
        params: [
          blockNumber,
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getBlockCommitment:', error);
    throw error;
  }
};
`;