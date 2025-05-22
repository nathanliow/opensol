import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const isBlockhashValid: BlockFunctionTemplate = {
  metadata: {
    name: 'isBlockhashValid',
    description:
      'Check if a blockhash is valid or not',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'blockhash',
        type: 'string',
        description: 'Blockhash to check'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Whether the blockhash is valid or not'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        blockhash,
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
          method: 'isBlockhashValid',
          params: [
            blockhash
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
      console.error('Error in isBlockhashValid:', error);
      throw error;
    }
  }
};