import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getBaseQuoteOHLCV: BlockFunctionTemplate = {
  metadata: {
    name: 'getBaseQuoteOHLCV',
    description:
      'Retrieve candlestick data in OHLCV format of a specified base-quote pair. Maximum 1000 records.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'baseAddress',
        type: 'string',
        description: 'Address of the base token'
      },
      {
        name: 'quoteAddress',
        type: 'string',
        description: 'Address of the quote token'
      },
      {
        name: 'interval',
        type: 'dropdown',
        description: 'Time interval for the candlestick data (e.g., "1m", "1H", "1D")',
        options: ['1m', '3m', '5m', '15m', '30m', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '3D', '1W', '1M']
      },
      {
        name: 'timeFrom',
        type: 'number',
        description: 'Start time using unix timestamps in seconds',
        defaultValue: 0
      },
      {
        name: 'timeTo',
        type: 'number',
        description: 'End time using unix timestamps in seconds',
        defaultValue: 0
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing list of ohlc and volume of base and quote'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        baseAddress,
        quoteAddress,
        interval = '1m',
        timeFrom = 0,
        timeTo = 0,
        apiKey, 
        network = 'mainnet'
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!baseAddress || !quoteAddress) {
        throw new Error('Base address and quote address are required.');
      }

      const response = await fetch(`https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseAddress}&quote_address=${quoteAddress}&type=${interval}&time_from=${timeFrom}&time_to=${timeTo}`, {
        method: 'GET',
        headers: {
          accept: 'application/json', 
          'x-chain': 'solana',
          'X-API-KEY': apiKey.key
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Birdeye API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getBaseQuoteOHLCV:', error);
      throw error;
    }
  }
};

export const getBaseQuoteOHLCVDisplayString = `export const getBaseQuoteOHLCV = async (params: Record<string, any>) => {
  try {
    const { 
      baseAddress,
      quoteAddress,
      interval = '1m',
      timeFrom = 0,
      timeTo = 0,
      network = 'mainnet'
    } = params;

    if (!baseAddress || !quoteAddress) {
      throw new Error('Base address and quote address are required.');
    }

    const response = await fetch('https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=\${baseAddress}&quote_address=\${quoteAddress}&type=\${interval}&time_from=\${timeFrom}&time_to=\${timeTo}', {
      method: 'GET',
      headers: {
        accept: 'application/json', 
        'x-chain': 'solana',
        'X-API-KEY': process.env.BIRDEYE_API_KEY
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Birdeye API error ' + response.status + ': ' + errorText);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getBaseQuoteOHLCV:', error);
    throw error;
  }
};
`;

export const getBaseQuoteOHLCVExecuteString = `async function getBaseQuoteOHLCV(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      baseAddress,
      quoteAddress,
      interval = '1m',
      timeFrom = 0,
      timeTo = 0,
      apiKey, 
      network = 'mainnet'
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Birdeye API key is required.');
    }

    if (apiKey.tier != 'starter' && apiKey.tier != 'premium' && apiKey.tier != 'business' && apiKey.tier != 'enterprise') {
      throw new Error('Invalid API key tier.');
    }

    if (!baseAddress || !quoteAddress) {
      throw new Error('Base address and quote address are required.');
    }

    const response = await fetch(\`https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=\${baseAddress}&quote_address=\${quoteAddress}&type=\${interval}&time_from=\${timeFrom}&time_to=\${timeTo}\`, {
      method: 'GET',
      headers: {
        accept: 'application/json', 
        'x-chain': 'solana',
        'X-API-KEY': apiKey.key
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Birdeye API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getBaseQuoteOHLCV:', error);
    throw error;
  }
};
`;