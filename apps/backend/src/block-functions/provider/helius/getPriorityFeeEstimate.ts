import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getPriorityFeeEstimate: BlockFunctionTemplate = {
  metadata: {
    name: 'getPriorityFeeEstimate',
    description:
      'Calculate optimal priority fee recommendations for Solana transactions based on real-time network conditions. This advanced API analyzes historical fee data and current congestion levels to provide precise fee estimates for different priority levels.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'transaction',
        type: 'string',
        description: 'Transaction to estimate priority fee for'
      },
      {
        name: 'priorityLevel',
        type: 'dropdown',
        description: 'Priority level to estimate fee for',
        options: [
          'Min',
          'Low',
          'Medium',
          'High',
          'VeryHigh',
          'UnsafeMax'
        ]
      },
      {
        name: 'transactionEncoding',
        type: 'dropdown',
        description: 'Transaction encoding to use',
        options: [
          'Base58',
          'Base64',
        ]
      }
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Current health of the node'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        apiKey, 
        transaction,
        priorityLevel = 'Min',
        transactionEncoding = 'Base58',
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getPriorityFeeEstimate',
          params: [
            {
              "transaction": transaction,
              "options": {
                "transactionEncoding": transactionEncoding,
                "priorityLevel": priorityLevel,
                "includeAllPriorityFeeLevels": true,
                "lookbackSlots": 150,
                "includeVote": true,
                "recommended": true,
                "evaluateEmptySlotAsZero": true
              }
            }
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
      console.error('Error in getPriorityFeeEstimate:', error);
      throw error;
    }
  }
};

export const getPriorityFeeEstimateString = `
export const getPriorityFeeEstimate = async (params: Record<string, any>) => {
  try {
    const { 
      transaction,
      priorityLevel = 'Min',
      transactionEncoding = 'Base58',
      network = 'devnet' 
    } = params;

    const response = await fetch('https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getPriorityFeeEstimate',
        params: [
          {
            "transaction": transaction,
            "options": {
              "transactionEncoding": transactionEncoding,
              "priorityLevel": priorityLevel,
              "includeAllPriorityFeeLevels": true,
              "lookbackSlots": 150,
              "includeVote": true,
              "recommended": true,
              "evaluateEmptySlotAsZero": true
            }
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getPriorityFeeEstimate:', error);
    throw error;
};
`;