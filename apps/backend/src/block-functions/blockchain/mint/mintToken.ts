import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';

export const mintToken: BlockFunctionTemplate = {
  metadata: {
    name: 'mintToken',
    description:
      'Create a new Solana token with metadata including name, symbol, description, and image',
    blockCategory: 'Blockchain',
    blockType: 'MINT',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Token name'
      },
      {
        name: 'symbol',
        type: 'string',
        description: 'Token symbol'
      },
      {
        name: 'description',
        type: 'string',
        description: 'Token description'
      },
      {
        name: 'image',
        type: 'string',
        description: 'Token image URI'
      },
      {
        name: 'apiKey',
        type: 'string',
        description: 'Helius API key'
      },
      {
        name: 'network',
        type: 'string',
        description: 'Network to use'
      },
      {
        name: 'decimals',
        type: 'number',
        description: 'Token decimals'
      }
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'object',
      description: 'Mint result containing the token address and metadata'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      // Extract parameters
      const { 
        name, 
        symbol, 
        description, 
        image, 
        apiKey, 
        network = 'devnet',
        decimals = 9
      } = params;
      
      // Validate required parameters
      if (!name) {
        throw new Error('Token name is required.');
      }
      
      if (!symbol) {
        throw new Error('Token symbol is required.');
      }
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }
      
      return {
        success: true,
        mintConfig: {
          name,
          symbol,
          description,
          imageUri: image,
          decimals,
          network
        },
        metadata: {
          name,
          symbol,
          description,
          image
        }
      };
    } catch (error) {
      console.error('Error in mintToken:', error);
      return {
        success: false,
        error: (error instanceof Error) ? error.message : 'Unknown error'
      };
    }
  }
}; 