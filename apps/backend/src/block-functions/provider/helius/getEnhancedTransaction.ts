import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getEnhancedTransaction: BlockFunctionTemplate = {
  metadata: {
    name: 'getEnhancedTransaction',
    description:
      'Convert raw Solana transactions into enhanced, human-readable formats with decoded instruction data and contextual information.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'signature',
        type: 'string',
        description: 'Signature of the transaction'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Transaction'
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

      const response = await fetch(`https://api.helius.xyz/v0/transactions?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactions: [signature]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getEnhancedTransaction:', error);
      throw error;
    }
  }
};