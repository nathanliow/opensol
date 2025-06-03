import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getRecentPerformanceSamples: BlockFunctionTemplate = {
  metadata: {
    name: 'getRecentPerformanceSamples',
    description:
      'Returns a list of recent performance samples, in reverse slot order',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'Max number of samples to return'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Recent performance samples'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        limit,
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
          method: 'getRecentPerformanceSamples',
          params: [
            limit
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
      console.error('Error in getRecentPerformanceSamples:', error);
      throw error;
    }
  }
};

export const getRecentPerformanceSamplesString = `
export const getRecentPerformanceSamples = async (params: Record<string, any>) => {
  try {
    const { 
      limit = 100,
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
        method: 'getRecentPerformanceSamples',
        params: [limit]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getRecentPerformanceSamples:', error);
    throw error;
  }
};
`;