import { BlockTemplate } from "../../../../frontend/src/components/services/blockTemplateService";

export const solToUsd: BlockTemplate = {
  metadata: {
    name: 'solToUsd',
    description: 'Convert SOL amount to USD using current price',
    blockCategory: 'Misc',
    blockType: 'MISC',
    parameters: [
      {
        name: 'solAmount',
        type: 'number',
        description: 'Amount of SOL to convert',
      }
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'number',
      description: 'USD amount'
    }
  },
  execute: async (params: { solAmount: number }): Promise<number> => {
    const mockSolPrice = 100; 
    return params.solAmount * mockSolPrice;
  }
};