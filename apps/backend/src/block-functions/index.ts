import { getUserSolBalance } from './blockchain/get/getUserSolBalance';
import { usdToSol } from './code/math/usdToSol';
import { solToUsd } from './code/math/solToUsd';
import { BlockFunctionTemplate } from '../../../frontend/src/components/services/blockTemplateService';
import { getAccountInfo } from './provider/helius/getAccountInfo';
import { getAsset } from './provider/helius/getAsset';
import { getAssetProof } from './provider/helius/getAssetProof';
import { getAssetsByAuthority } from './provider/helius/getAssetsByAuthority';
import { getAssetsByCreator } from './provider/helius/getAssetsByCreator';
import { getAssetsByGroup } from './provider/helius/getAssetsByGroup';
import { getAssetsByOwner } from './provider/helius/getAssetsByOwner';
import { getBalance } from './provider/helius/getBalance';
import { getBlockCommitment } from './provider/helius/getBlockCommitment';
import { getBlockHeight } from './provider/helius/getBlockHeight';
import { getBlockProduction } from './provider/helius/getBlockProduction';
import { getBlocks } from './provider/helius/getBlocks';
import { getBlockTime } from './provider/helius/getBlockTime';
import { getClusterNodes } from './provider/helius/getClusterNodes';
import { getEnhancedTransaction } from './provider/helius/getEnhancedTransaction';
import { getEpochInfo } from './provider/helius/getEpochInfo';
import { getEpochSchedule } from './provider/helius/getEpochSchedule';
import { getFeeForMessage } from './provider/helius/getFeeForMessage';
import { getFirstAvailableBlock } from './provider/helius/getFirstAvailableBlock';
import { getGenesisHash } from './provider/helius/getGenesisHash';
import { getHealth } from './provider/helius/getHealth';
import { getHighestSnapshotSlot } from './provider/helius/getHighestSnapshotSlot';
import { getIdentity } from './provider/helius/getIdentity';
import { getInflationGovernor } from './provider/helius/getInflationGovernor';
import { getInflationRate } from './provider/helius/getInflationRate';
import { getLargestAccounts } from './provider/helius/getLargestAccounts';
import { getLatestBlockhash } from './provider/helius/getLatestBlockhash';
import { getLeaderSchedule } from './provider/helius/getLeaderSchedule';
import { getMaxRetransmitSlot } from './provider/helius/getMaxRetransmitSlot';
import { getMaxShredInsertSlot } from './provider/helius/getMaxShredInsertSlot';
import { getMinimumBalanceForRentExemption } from './provider/helius/getMinimumBalanceForRentExemption';
import { getNftEditions } from './provider/helius/getNftEditions';
import { getPriorityFeeEstimate } from './provider/helius/getPriorityFeeEstimate';
import { getProgramAccounts } from './provider/helius/getProgramAccounts';
import { getRecentPerformanceSamples } from './provider/helius/getRecentPerformanceSamples';
import { getSignaturesForAddress } from './provider/helius/getSignaturesForAddress';
import { getSignaturesForAsset } from './provider/helius/getSignaturesForAsset';
import { getSlot } from './provider/helius/getSlot';
import { getSlotLeader } from './provider/helius/getSlotLeader';
import { getStakeMinimumDelegation } from './provider/helius/getStakeMinimumDelegation';
import { getSupply } from './provider/helius/getSupply';
import { getTokenAccountBalance } from './provider/helius/getTokenAccountBalance';
import { getTokenAccounts } from './provider/helius/getTokenAccounts';
import { getTokenLargestAccounts } from './provider/helius/getTokenLargestAccounts';
import { getTokenSupply } from './provider/helius/getTokenSupply';
import { getTransaction } from './provider/helius/getTransaction';
import { getTransactionCount } from './provider/helius/getTransactionCount';
import { getTransactionHistory } from './provider/helius/getTransactionHistory';
import { getVersion } from './provider/helius/getVersion';
import { getVoteAccounts } from './provider/helius/getVoteAccounts';
import { isBlockhashValid } from './provider/helius/isBlockhashValid';
import { minimumLedgerSlot } from './provider/helius/minimumLedgerSlot';

import { getBaseQuoteOHLCV } from './provider/birdeye/getBaseQuoteOHLCV';
import { getHistoricalPrice } from './provider/birdeye/getHistoricalPrice';
import { getNewTokens } from './provider/birdeye/getNewTokens';
import { getPairOHLCV } from './provider/birdeye/getPairOHLCV';
import { getPairOverview } from './provider/birdeye/getPairOverview';
import { getPairTrades } from './provider/birdeye/getPairTrades';
import { getPrice } from './provider/birdeye/getPrice';
import { getPriceAtUnixTime } from './provider/birdeye/getPriceAtUnixTime';
import { getPriceVolume } from './provider/birdeye/getPriceVolume';
import { getTokenAllMarkets } from './provider/birdeye/getTokenAllMarkets';
import { getTokenAllTrades } from './provider/birdeye/getTokenAllTrades';
import { getTokenCreationInfo } from './provider/birdeye/getTokenCreationInfo';
import { getTokenHolders } from './provider/birdeye/getTokenHolders';
import { getTokenList } from './provider/birdeye/getTokenList';
import { getTokenMarketData } from './provider/birdeye/getTokenMarketData';
import { getTokenMetadata} from './provider/birdeye/getTokenMetadata';
import { getTokenMintBurn } from './provider/birdeye/getTokenMintBurn';
import { getTokenOHLCV } from './provider/birdeye/getTokenOHLCV';
import { getTokenOverview } from './provider/birdeye/getTokenOverview';
import { getTokenSecurity } from './provider/birdeye/getTokenSecurity';
import { getTokenTopTraders } from './provider/birdeye/getTokenTopTraders';
import { getTokenTradeData } from './provider/birdeye/getTokenTradeData';
import { getTokenTrades } from './provider/birdeye/getTokenTrades';
import { getTraderGainersAndLosers } from './provider/birdeye/getTraderGainersAndLosers';
import { getTradesLatestBlockNumber } from './provider/birdeye/getTradesLatestBlockNumber';
import { getTrendingTokens } from './provider/birdeye/getTrendingTokens';
import { getWalletPortfolio } from './provider/birdeye/getWalletPortfolio';
import { getWalletTokenBalance } from './provider/birdeye/getWalletTokenBalance';
import { getWalletTransactionHistory } from './provider/birdeye/getWalletTransactionHistory';

// Group templates by their block type
export const templates: Record<string, Record<string, BlockFunctionTemplate>> = {
  GET: {
    getUserSolBalance
  },
  HELIUS: {
    getAccountInfo,
    getAsset,
    getAssetProof,
    getAssetsByAuthority,
    getAssetsByCreator,
    getAssetsByGroup,
    getAssetsByOwner,
    getBalance,
    getBlocks,
    getBlockHeight,
    getBlockTime,
    getBlockProduction,
    getBlockCommitment,
    getClusterNodes,
    getEnhancedTransaction,
    getEpochInfo,
    getEpochSchedule,
    getFeeForMessage,
    getFirstAvailableBlock,
    getGenesisHash,
    getHealth,
    getHighestSnapshotSlot,
    getIdentity,
    getInflationGovernor,
    getInflationRate,
    getLargestAccounts,
    getLatestBlockhash,
    getLeaderSchedule,
    getMaxRetransmitSlot,
    getMaxShredInsertSlot,
    getMinimumBalanceForRentExemption,
    getNftEditions,
    getPriorityFeeEstimate,
    getProgramAccounts,
    getRecentPerformanceSamples,
    getSignaturesForAddress,
    getSignaturesForAsset,
    getSlot,
    getSlotLeader,
    getStakeMinimumDelegation,
    getSupply,
    getTokenAccountBalance,
    getTokenAccounts,
    getTokenLargestAccounts,
    getTokenSupply,
    getTransaction,
    getTransactionCount,
    getTransactionHistory,
    getVersion,
    getVoteAccounts,
    isBlockhashValid,
    minimumLedgerSlot
  },
  BIRDEYE: {
    getBaseQuoteOHLCV,
    getHistoricalPrice,
    getNewTokens,
    getPairOHLCV,
    getPairOverview,
    getPairTrades,
    getPrice,
    getPriceAtUnixTime,
    getPriceVolume,
    getTokenAllMarkets,
    getTokenAllTrades,
    getTokenCreationInfo,
    getTokenHolders,
    getTokenList,
    getTokenMarketData,
    getTokenMetadata,
    getTokenMintBurn,
    getTokenOHLCV,
    getTokenOverview,
    getTokenSecurity,
    getTokenTopTraders,
    getTokenTradeData,
    getTokenTrades,
    getTraderGainersAndLosers,
    getTradesLatestBlockNumber,
    getTrendingTokens,
    getWalletPortfolio,
    getWalletTokenBalance,
    getWalletTransactionHistory,
  },
  MATH: {
    solToUsd,
    usdToSol
  },
};

// Helper to get all templates flattened into a single record
export const getFlattenedTemplates = (): Record<string, BlockFunctionTemplate> => {
  const flattened: Record<string, BlockFunctionTemplate> = {};
  Object.entries(templates).forEach(([blockType, blockTemplates]) => {
    Object.entries(blockTemplates).forEach(([name, template]) => {
      flattened[name] = {
        ...template,
        metadata: {
          ...template.metadata,
          blockType
        }
      };
    });
  });
  
  return flattened;
};