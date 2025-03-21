import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const usdToSol: BlockTemplate = {
  metadata: {
    name: 'usdToSol',
    description: 'Convert USD amount to SOL using current price',
    blockCategory: 'Misc',
    blockType: 'MATH',
    parameters: [
      {
        name: 'usdAmount',
        type: 'number',
        description: 'Amount of USD to convert',
      }
    ],
    requiredKeys: [],
    output: {
      type: 'number',
      description: 'SOL amount'
    }
  },
  execute: async (params: { usdAmount: number }): Promise<number> => {
    // For demonstration purposes using a fixed rate
    // In a real application, this would call a price API
    const mockSolPrice = 100; 
    return params.usdAmount / mockSolPrice;
  }
};