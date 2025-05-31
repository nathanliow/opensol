import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getLeaderSchedule: BlockFunctionTemplate = {
  metadata: {
    name: 'getLeaderSchedule',
    description:
      'Returns the leader schedule for an epoch',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Leader schedule for an epoch'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        apiKey, 
        network = 'devnet' 
      } = params;
      
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
          method: 'getLeaderSchedule',
          params: []  
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getLeaderSchedule:', error);
      throw error;
    }
  }
};

export const getLeaderScheduleString = `
export const getLeaderSchedule = async (params: Record<string, any>) => {
  try {
    const { 
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
        method: 'getLeaderSchedule',
        params: []
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getLeaderSchedule:', error);
    throw error;
  }
};
`;