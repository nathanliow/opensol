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
  execute: async (params: Record<string, any>): Promise<number> => {
    const priceResponse = await fetch(
      'https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112'
    );
    
    const priceData = await priceResponse.json();
    const solPrice = priceData.data.So11111111111111111111111111111111111111112.price;

    return Number((params.solAmount * solPrice).toFixed(2));

  }
};