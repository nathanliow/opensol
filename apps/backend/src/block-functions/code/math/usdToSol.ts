import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const usdToSol: BlockFunctionTemplate = {
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
  execute: async (params: Record<string, any>): Promise<number> => {
    const priceResponse = await fetch(
      'https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112'
    );
    
    const priceData = await priceResponse.json();
    const solPrice = priceData.data.So11111111111111111111111111111111111111112.price;
    
    return Number((params.usdAmount / solPrice).toFixed(2));
  }
};

export const usdToSolString = `export const usdToSol = async (params: Record<string, any>) => {
  try {
    const priceResponse = await fetch('https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');

    const priceData = await priceResponse.json();
    const solPrice = priceData.data.So11111111111111111111111111111111111111112.price;

    return Number((params.usdAmount / solPrice).toFixed(2));
  } catch (error) {
    console.error('Error in usdToSol:', error);
    throw error;
  }
};`