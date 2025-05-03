import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const solToUsd: BlockFunctionTemplate = {
  metadata: {
    name: 'solToUsd',
    description: 'Convert SOL amount to USD using current price',
    blockCategory: 'Misc',
    blockType: 'MATH',
    parameters: [
      {
        name: 'solAmount',
        type: 'number',
        description: 'Amount of SOL to convert',
      }
    ],
    requiredKeys: [],
    output: {
      type: 'number',
      description: 'USD amount'
    }
  },
  execute: async (params: { solAmount: number }): Promise<number> => {
    // For demonstration purposes using a fixed rate
    // In a real application, this would call a price API
    const mockSolPrice = 140; 
    return Number((params.solAmount * mockSolPrice).toFixed(2));

  }
};