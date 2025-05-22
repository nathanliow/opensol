import { BlockFunctionTemplate } from "../../../../../frontend/src/components/services/blockTemplateService";

export const getTokenTrades: BlockFunctionTemplate = {
  metadata: {
    name: 'getTokenTrades',
    description:
      'Retrieve price and volume updates of a specified token with various filtering and sorting options.',
    blockCategory: 'Provider',
    blockType: 'BIRDEYE',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'Address of the token',
        defaultValue: ''
      },
      {
        name: 'sort_by',
        type: 'dropdown',
        description: 'Sort field for the trades',
        options: ['block_unix_time', 'block_number'],
        defaultValue: 'block_unix_time'
      },
      {
        name: 'sort_type',
        type: 'dropdown',
        description: 'Sort order for the trades',
        options: ['asc', 'desc'],
        defaultValue: 'desc'
      },
      {
        name: 'txnType',
        type: 'dropdown',
        description: 'Type of transactions to retrieve',
        options: ['all', 'add', 'remove', 'swap'],
        defaultValue: 'swap'
      },
      {
        name: 'source',
        type: 'dropdown',
        description: 'Source of the trades',
        options: ['', 'raydium', 'raydium_clamm', 'raydium_cp', 'orca', 'lifinity', 'fluxbeam', 'saber', 'phoenix', 'bonkswap', 'pump_dot_fun'],
        defaultValue: ''
      },
      {
        name: 'owner',
        type: 'string',
        description: 'Address of the owner wallet',
        defaultValue: ''
      },
      {
        name: 'poolId',
        type: 'string',
        description: 'Address of liquidity pool',
        defaultValue: ''
      },
      {
        name: 'beforeTime',
        type: 'number',
        description: 'Specify the time seeked before using unix timestamps in seconds'
      },
      {
        name: 'afterTime',
        type: 'number',
        description: 'Specify the time seeked after using unix timestamps in seconds'
      },
      {
        name: 'beforeBlockNumber',
        type: 'number',
        description: 'Specify the upper bound of block_number for the filter range, excluding values equal to before_block_number'
      },
      {
        name: 'afterBlockNumber',
        type: 'number',
        description: 'Specify the lower bound of block_number for the filter range, excluding values equal to after_block_number',
        defaultValue: 0
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset for pagination (0-10000)',
        defaultValue: 0
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Limit of records to return (1-100)',
        defaultValue: 100
      }
    ],
    requiredKeys: ['birdeye'],
    requiredKeyTiers: {
      birdeye: ['starter', 'premium', 'business', 'enterprise']
    },
    output: {
      type: 'object',
      description: 'JSON object containing trades'
    }
  },
  execute: async (params: Record<string, any>) => {
    try {
      const { 
        address,
        sort_by = 'block_unix_time',
        sort_type = 'desc',
        txnType = 'swap',
        source = '',
        owner = '',
        poolId = '',
        beforeTime,
        afterTime,
        beforeBlockNumber,
        afterBlockNumber = 0,
        offset = 0,
        limit = 100,
        apiKey, 
        network = 'mainnet',
      } = params;

      if (!apiKey) {
        throw new Error('Birdeye API key is required.');
      }

      if (apiKey.tier != 'starter' || apiKey.tier != 'premium' || apiKey.tier != 'business' || apiKey.tier != 'enterprise') {
        throw new Error('Invalid API key tier.');
      }

      if (!address) {
        throw new Error('Address is required.');
      }

      if (!txnType) {
        throw new Error('Transaction type is required.');
      }

      // Validate offset and limit constraints
      if (offset > 10000) {
        throw new Error('Offset must be less than or equal to 10000.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100.');
      }

      if (offset + limit > 10000) {
        throw new Error('Offset + limit must be less than or equal to 10000.');
      }

      // Validate time range and block number range constraints
      const hasTimeRange = afterTime !== undefined || beforeTime !== undefined;
      const hasBlockRange = afterBlockNumber !== undefined || beforeBlockNumber !== undefined;

      if (hasTimeRange && hasBlockRange) {
        throw new Error('Cannot specify both time range and block number range. Please choose one.');
      }

      // Validate sorting rules
      if (hasTimeRange && sort_by !== 'block_unix_time') {
        throw new Error('When filtering by time range, sorting must be by block_unix_time');
      }

      if (hasBlockRange && sort_by !== 'block_number') {
        throw new Error('When filtering by block number range, sorting must be by block_number');
      }

      // Set default ranges if none provided
      let finalAfterTime = afterTime;
      let finalBeforeTime = beforeTime;
      let finalAfterBlockNumber = afterBlockNumber;
      let finalBeforeBlockNumber = beforeBlockNumber;

      if (!hasTimeRange && !hasBlockRange) {
        if (sort_by === 'block_unix_time') {
          // Default to last 7 days
          finalAfterTime = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
        } else if (sort_by === 'block_number') {
          // Default to last 500,000 blocks
          finalAfterBlockNumber = 0; // This will be set by the API to the most recent block - 500,000
        }
      }

      // Validate time range constraints
      if (hasTimeRange) {
        const now = Math.floor(Date.now() / 1000);
        if (finalAfterTime && finalBeforeTime) {
          const rangeInDays = (finalBeforeTime - finalAfterTime) / (24 * 60 * 60);
          if (rangeInDays > 30) {
            throw new Error('Time range cannot exceed 30 days');
          }
        } else if (finalAfterTime) {
          const daysSinceAfterTime = (now - finalAfterTime) / (24 * 60 * 60);
          if (daysSinceAfterTime > 30) {
            throw new Error('After time must be within the last 30 days');
          }
        }
      }

      // Validate block number range constraints
      if (hasBlockRange) {
        if (finalAfterBlockNumber && finalBeforeBlockNumber) {
          const blockRange = finalBeforeBlockNumber - finalAfterBlockNumber;
          if (blockRange > 500000) {
            throw new Error('Block number range cannot exceed 500,000 blocks');
          }
        } else if (finalAfterBlockNumber) {
          // We can't validate the exact block number here since we don't have the current block number
          // The API will handle this validation
          finalAfterBlockNumber = Math.max(0, finalAfterBlockNumber);
        }
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        sort_by,
        sort_type,
        tx_type: txnType,
        offset: offset.toString(),
        limit: limit.toString()
      });

      // Add optional parameters if they exist
      const optionalParams = {
        source,
        owner,
        pool_id: poolId,
        before_time: finalBeforeTime,
        after_time: finalAfterTime,
        before_block_number: finalBeforeBlockNumber,
        after_block_number: finalAfterBlockNumber
      };

      // Add non-undefined optional parameters to query
      Object.entries(optionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`https://public-api.birdeye.so/defi/v3/token/txs?${queryParams.toString()}`, {
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
      console.error('Error in getTokenTrades:', error);
      throw error;
    }
  }
};