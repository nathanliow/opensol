import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getNftEditions: BlockTemplate = {
  metadata: { 
    name: 'getNftEditions',
    description:
      'Retrieve all the NFT editions associated with a specific master NFT',
    blockCategory: 'Default',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'mint',
        type: 'string',
        description: 'Mint Address to get'
      },
      {
        name: 'page',
        type: 'number',
        description: 'Page to get'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit to get'
      },
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'List of NFT editions for a specific mint'
    }
  },
  execute: async (
    params: { 
      mint: string; 
      page: number; 
      limit: number; 
      apiKey?: string; 
      network?: string 
    }) => {
    try {
      const { 
        mint, 
        page, 
        limit, 
        apiKey, 
        network = 'devnet' 
      } = params;
      
      if (!mint) {
        throw new Error('Mint Address is required.');
      }
      
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
          method: 'getNftEditions',
          params: {
            mint: mint,
            page: page,
            limit: limit,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getNftEditions:', error);
      throw error;
    }
  }
};