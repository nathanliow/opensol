import { BlockTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getUserSolBalance: BlockTemplate = {
  metadata: {
    name: 'getUserSolBalance',
    description:
      'Get user SOL balance using Helius API by fetching assets and then retrieving the SOL balance',
    blockCategory: 'Default',
    blockType: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Wallet address to check'
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
      }
    ],
    requiredKeys: ['helius'],
    output: {
      type: 'string',
      description: 'User SOL balance'
    }
  },
  execute: async (params: { address: string; apiKey?: string; network?: string }) => {
    try {
      // Extract parameters
      const { address, apiKey, network = 'mainnet' } = params;
      
      if (!address) {
        throw new Error('Wallet address is required.');
      }
      
      if (!apiKey) {
        throw new Error('Helius API key is required.');
      }

      // Fetch assets owned by the user (using getAssetsByOwner)
      const assetsResponse = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'text',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: address,
            page: 1,
            limit: 50,
            sortBy: {
              sortBy: 'created',
              sortDirection: 'asc'
            },
            options: {
              showUnverifiedCollections: false,
              showCollectionMetadata: false,
              showGrandTotal: false,
              showFungible: false,
              showNativeBalance: false,
              showInscription: false,
              showZeroBalance: false
            }
          }
        })
      });

      if (!assetsResponse.ok) {
        const errorText = await assetsResponse.text();
        throw new Error(`Helius API error (${assetsResponse.status}): ${errorText}`);
      }
      const assetsData = await assetsResponse.json();

      // Fetch the SOL balance for the account
      const balanceResponse = await fetch(`https://${network}.helius-rpc.com/?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'balance',
          method: 'getBalance',
          params: [address]
        })
      });

      if (!balanceResponse.ok) {
        const errorText = await balanceResponse.text();
        throw new Error(`Helius API error (${balanceResponse.status}): ${errorText}`);
      }
      const balanceData = await balanceResponse.json();

      // Return combined results
      return balanceData.result.value*1e-9;
    } catch (error) {
      console.error('Error in getUserSolBalance:', error);
      throw error;
    }
  }
};