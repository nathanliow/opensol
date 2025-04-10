import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getFeeForMessage: BlockTemplate = {
  metadata: {
    name: 'getFeeForMessage',
    description:
      'Get the fee the network will charge for a particular Message',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'message',
        type: 'string',
        description: 'Message to get fee for'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Fee for the message'
    }
  },
  execute: async (
    params: { 
      message: string;
      apiKey?: string; 
      network?: string;
    }) => {
    try {
      const { 
        message,
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getFeeForMessage',
          params: [
            message
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
      console.error('Error in getFeeForMessage:', error);
      throw error;
    }
  }
};