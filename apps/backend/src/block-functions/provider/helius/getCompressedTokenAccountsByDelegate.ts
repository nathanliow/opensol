import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getCompressedTokenAccountsByDelegate: BlockFunctionTemplate = {
  metadata: {
    name: 'getCompressedTokenAccountsByDelegate',
    description:
      'Returns the compressed token accounts that are partially or fully delegated to the given delegate.',
    blockCategory: 'Provider',
    blockType: 'HELIUS',
    parameters: [
      {
        name: 'delegate',
        type: 'string',
        description: 'The delegate to get the token accounts for.'
      },
      {
        name: 'cursor',
        type: 'string',
        description: 'The cursor to get the next page of compressed accounts for.'
      },
      {
        name: 'limit',
        type: 'number',
        description: 'The limit of the token accounts to get.'
      },
      {
        name: 'mint',
        type: 'string',
        description: 'The mint to get the token accounts for.'
      },
    ],
    requiredKeys: ['helius'],
    requiredKeyTiers: {
      helius: ['free', 'developer', 'business', 'professional']
    },
    output: {
      type: 'object',
      description: 'Successfully retrieved compressed token accounts by delegate from the Solana blockchain'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
      );

      const { 
        delegate,
        cursor,
        limit,
        mint,
        apiKey, 
        network = 'devnet' 
      } = filteredParams;
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
        throw new Error('Invalid API key tier.');
      }
      
      if (!delegate) {
        throw new Error('Delegate is required.');
      }

      if (limit < 0) {
        throw new Error('Limit must be greater than 0.');
      }

      const response = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getCompressedTokenAccountsByDelegate',
          params: [{
            delegate: delegate,
            cursor: cursor,
            limit: limit,
            mint: mint
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Helius API error (${response.status}): ${errorText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error in getCompressedTokenAccountsByDelegate:', error);
      throw error;
    }
  }
};

export const getCompressedTokenAccountsByDelegateDisplayString = `export const getCompressedTokenAccountsByDelegate = async (params: Record<string, any>) => {
  try {
    const { 
      delegate,
      cursor,
      limit,
      mint,
      network = 'devnet' 
    } = params;
      
    if (!delegate) {
      throw new Error('Delegate is required.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${process.env.HELIUS_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedTokenAccountsByDelegate',
        params: [{
          delegate: delegate,
          cursor: cursor,
          limit: limit,
          mint: mint
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Helius API error (\${response.status}): \${errorText}');
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getCompressedTokenAccountsByDelegate:', error);
    throw error;
  }
};
`;

export const getCompressedTokenAccountsByDelegateExecuteString = `async function getCompressedTokenAccountsByDelegate(params) {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== "" && value !== null)
    );

    const { 
      delegate,
      cursor,
      limit,
      mint,
      apiKey, 
      network = 'devnet' 
    } = filteredParams;
    
    if (!apiKey) {
      throw new Error('Helius API key is required.');
    }

    if (apiKey.tier != 'free' && apiKey.tier != 'developer' && apiKey.tier != 'business' && apiKey.tier != 'professional') {
      throw new Error('Invalid API key tier.');
    }
    
    if (!delegate) {
      throw new Error('Delegate is required.');
    }

    if (limit < 0) {
      throw new Error('Limit must be greater than 0.');
    }

    const response = await fetch(\`https://\${network}.helius-rpc.com/?api-key=\${apiKey.key}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'text',
        method: 'getCompressedTokenAccountsByDelegate',
        params: [{
          delegate: delegate,
          cursor: cursor,
          limit: limit,
          mint: mint
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(\`Helius API error (\${response.status}): \${errorText}\`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getCompressedTokenAccountsByDelegate:', error);
    throw error;
  }
};
`;

