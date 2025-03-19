import { BlockTemplate } from "../../../../frontend/src/components/services/blockTemplateService";

export const usdToSol: BlockTemplate = {
  metadata: {
    name: 'usdToSol',
    description: 'Convert USD amount to SOL using current price',
    blockCategory: 'Misc',
    blockType: 'MISC',
    parameters: [
      {
        name: 'usdAmount',
        type: 'number',
        description: 'Amount of USD to convert',
      }
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'number',
      description: 'SOL amount'
    }
  },
  execute: async (params: { usdAmount: number }): Promise<number> => {
    const mockSolPrice = 100; 
    return params.usdAmount / mockSolPrice;
  }
};