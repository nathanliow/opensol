// Blockchain functions
import { getUserSolBalanceDisplayString, getUserSolBalanceExecuteString } from "../../../backend/src/block-functions/blockchain/get/getUserSolBalance";
import { mintTokenDisplayString } from "@/hooks/functions/mintToken";
import { transferTokenDisplayString } from "@/hooks/functions/transferToken";

// IPFS functions
import { uploadMetadataToPinataString } from "@/ipfs/uploadMetadataToPinata";
import { uploadImageToPinataString } from "@/ipfs/uploadImageToPinata";
import { createFileFromUrlString } from "@/utils/createFileFromUrl";

// Code functions
import { solToUsdDisplayString, solToUsdExecuteString } from "../../../backend/src/block-functions/code/math/solToUsd";
import { usdToSolDisplayString, usdToSolExecuteString } from "../../../backend/src/block-functions/code/math/usdToSol";

// Birdeye
import { getBaseQuoteOHLCVDisplayString, getBaseQuoteOHLCVExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getBaseQuoteOHLCV";
import { getHistoricalPriceDisplayString, getHistoricalPriceExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getHistoricalPrice";
import { getNewTokensDisplayString, getNewTokensExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getNewTokens";
import { getPairOHLCVDisplayString, getPairOHLCVExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPairOHLCV";
import { getPairOverviewDisplayString, getPairOverviewExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPairOverview";
import { getPairTradesDisplayString, getPairTradesExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPairTrades";
import { getPriceDisplayString, getPriceExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPrice";
import { getPriceAtUnixTimeDisplayString, getPriceAtUnixTimeExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPriceAtUnixTime";
import { getPriceVolumeDisplayString, getPriceVolumeExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getPriceVolume";
import { getTokenAllMarketsDisplayString, getTokenAllMarketsExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenAllMarkets";
import { getTokenAllTradesDisplayString, getTokenAllTradesExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenAllTrades";
import { getTokenCreationInfoDisplayString, getTokenCreationInfoExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenCreationInfo";
import { getTokenHoldersDisplayString, getTokenHoldersExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenHolders";
import { getTokenListDisplayString, getTokenListExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenList";
import { getTokenMarketDataDisplayString, getTokenMarketDataExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMarketData";
import { getTokenMetadataDisplayString, getTokenMetadataExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMetadata";
import { getTokenMintBurnDisplayString, getTokenMintBurnExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMintBurn";
import { getTokenOHLCVDisplayString, getTokenOHLCVExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenOHLCV";
import { getTokenOverviewDisplayString, getTokenOverviewExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenOverview";
import { getTokenSecurityDisplayString, getTokenSecurityExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenSecurity";
import { getTokenTopTradersDisplayString, getTokenTopTradersExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTopTraders";
import { getTokenTradeDataDisplayString, getTokenTradeDataExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTradeData";
import { getTokenTradesDisplayString, getTokenTradesExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTrades";
import { getTraderGainersAndLosersDisplayString, getTraderGainersAndLosersExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTraderGainersAndLosers";
import { getTradesLatestBlockNumberDisplayString, getTradesLatestBlockNumberExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTradesLatestBlockNumber";
import { getTrendingTokensDisplayString, getTrendingTokensExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getTrendingTokens";
import { getWalletPortfolioDisplayString, getWalletPortfolioExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getWalletPortfolio";
import { getWalletTokenBalanceDisplayString, getWalletTokenBalanceExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getWalletTokenBalance";
import { getWalletTransactionHistoryDisplayString, getWalletTransactionHistoryExecuteString } from "../../../backend/src/block-functions/provider/birdeye/getWalletTransactionHistory";

// Helius
import { getAccountInfoDisplayString, getAccountInfoExecuteString } from "../../../backend/src/block-functions/provider/helius/getAccountInfo";
import { getAssetDisplayString, getAssetExecuteString } from "../../../backend/src/block-functions/provider/helius/getAsset";
import { getAssetProofDisplayString, getAssetProofExecuteString } from "../../../backend/src/block-functions/provider/helius/getAssetProof";
import { getAssetsByAuthorityDisplayString, getAssetsByAuthorityExecuteString } from "../../../backend/src/block-functions/provider/helius/getAssetsByAuthority";
import { getAssetsByCreatorDisplayString, getAssetsByCreatorExecuteString } from "../../../backend/src/block-functions/provider/helius/getAssetsByCreator";
import { getAssetsByGroupDisplayString, getAssetsByGroupExecuteString } from "../../../backend/src/block-functions/provider/helius/getAssetsByGroup";
import { getAssetsByOwnerDisplayString, getAssetsByOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getAssetsByOwner";
import { getBalanceDisplayString, getBalanceExecuteString } from "../../../backend/src/block-functions/provider/helius/getBalance";
import { getBlockCommitmentDisplayString, getBlockCommitmentExecuteString } from "../../../backend/src/block-functions/provider/helius/getBlockCommitment";
import { getBlockHeightDisplayString, getBlockHeightExecuteString } from "../../../backend/src/block-functions/provider/helius/getBlockHeight";
import { getBlockProductionDisplayString, getBlockProductionExecuteString } from "../../../backend/src/block-functions/provider/helius/getBlockProduction";
import { getBlocksDisplayString, getBlocksExecuteString } from "../../../backend/src/block-functions/provider/helius/getBlocks";
import { getBlockTimeDisplayString, getBlockTimeExecuteString } from "../../../backend/src/block-functions/provider/helius/getBlockTime";
import { getClusterNodesDisplayString, getClusterNodesExecuteString } from "../../../backend/src/block-functions/provider/helius/getClusterNodes";
import { getCompressedBalanceByOwnerDisplayString, getCompressedBalanceByOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedBalanceByOwner";
import { getCompressedAccountDisplayString, getCompressedAccountExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccount";
import { getCompressedAccountProofDisplayString, getCompressedAccountProofExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccountProof";
import { getCompressedAccountsByOwnerDisplayString, getCompressedAccountsByOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccountsByOwner";
import { getCompressedBalanceDisplayString, getCompressedBalanceExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedBalance";
import { getCompressedMintTokenHoldersDisplayString, getCompressedMintTokenHoldersExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedMintTokenHolders";
import { getCompressedTokenAccountBalanceDisplayString, getCompressedTokenAccountBalanceExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenAccountBalance";
import { getCompressedTokenAccountsByDelegateDisplayString, getCompressedTokenAccountsByDelegateExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenAccountsByDelegate";
import { getCompressedTokenBalancesByOwnerDisplayString, getCompressedTokenBalancesByOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenBalancesByOwner";
import { getCompressionSignaturesForAccountDisplayString, getCompressionSignaturesForAccountExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForAccount";
import { getCompressionSignaturesForAddressDisplayString, getCompressionSignaturesForAddressExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForAddress";
import { getCompressionSignaturesForOwnerDisplayString, getCompressionSignaturesForOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForOwner";
import { getCompressionSignaturesForTokenOwnerDisplayString, getCompressionSignaturesForTokenOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForTokenOwner";
import { getEnhancedTransactionDisplayString, getEnhancedTransactionExecuteString } from "../../../backend/src/block-functions/provider/helius/getEnhancedTransaction";
import { getEpochInfoDisplayString, getEpochInfoExecuteString } from "../../../backend/src/block-functions/provider/helius/getEpochInfo";
import { getEpochScheduleDisplayString, getEpochScheduleExecuteString } from "../../../backend/src/block-functions/provider/helius/getEpochSchedule";
import { getFeeForMessageDisplayString, getFeeForMessageExecuteString } from "../../../backend/src/block-functions/provider/helius/getFeeForMessage";
import { getFirstAvailableBlockDisplayString, getFirstAvailableBlockExecuteString } from "../../../backend/src/block-functions/provider/helius/getFirstAvailableBlock";
import { getGenesisHashDisplayString, getGenesisHashExecuteString } from "../../../backend/src/block-functions/provider/helius/getGenesisHash";
import { getHealthDisplayString, getHealthExecuteString } from "../../../backend/src/block-functions/provider/helius/getHealth";
import { getHighestSnapshotSlotDisplayString, getHighestSnapshotSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/getHighestSnapshotSlot";
import { getIdentityDisplayString, getIdentityExecuteString } from "../../../backend/src/block-functions/provider/helius/getIdentity";
import { getIndexerHealthDisplayString, getIndexerHealthExecuteString } from "../../../backend/src/block-functions/provider/helius/getIndexerHealth"; 
import { getIndexerSlotDisplayString, getIndexerSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/getIndexerSlot";
import { getInflationGovernorDisplayString, getInflationGovernorExecuteString } from "../../../backend/src/block-functions/provider/helius/getInflationGovernor";
import { getInflationRateDisplayString, getInflationRateExecuteString } from "../../../backend/src/block-functions/provider/helius/getInflationRate";
import { getLargestAccountsDisplayString, getLargestAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getLargestAccounts";
import { getLatestBlockhashDisplayString, getLatestBlockhashExecuteString } from "../../../backend/src/block-functions/provider/helius/getLatestBlockhash";
import { getLatestCompressionSignaturesDisplayString, getLatestCompressionSignaturesExecuteString } from "../../../backend/src/block-functions/provider/helius/getLatestCompressionSignatures";
import { getLatestNonVotingSignaturesDisplayString, getLatestNonVotingSignaturesExecuteString } from "../../../backend/src/block-functions/provider/helius/getLatestNonVotingSignatures";
import { getLeaderScheduleDisplayString, getLeaderScheduleExecuteString } from "../../../backend/src/block-functions/provider/helius/getLeaderSchedule";
import { getMaxRetransmitSlotDisplayString, getMaxRetransmitSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/getMaxRetransmitSlot";
import { getMaxShredInsertSlotDisplayString, getMaxShredInsertSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/getMaxShredInsertSlot";
import { getMinimumBalanceForRentExemptionDisplayString, getMinimumBalanceForRentExemptionExecuteString } from "../../../backend/src/block-functions/provider/helius/getMinimumBalanceForRentExemption";
import { getMultipleCompressedAccountsDisplayString, getMultipleCompressedAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getMultipleCompressedAccounts";
import { getMultipleCompressedAccountProofsDisplayString, getMultipleCompressedAccountProofsExecuteString } from "../../../backend/src/block-functions/provider/helius/getMultipleCompressedAccountProofs";
import { getMultipleNewAddressProofsDisplayString, getMultipleNewAddressProofsExecuteString } from "../../../backend/src/block-functions/provider/helius/getMultipleNewAddressProofs";
import { getNftEditionsDisplayString, getNftEditionsExecuteString } from "../../../backend/src/block-functions/provider/helius/getNftEditions";
import { getPriorityFeeEstimateDisplayString, getPriorityFeeEstimateExecuteString } from "../../../backend/src/block-functions/provider/helius/getPriorityFeeEstimate";
import { getProgramAccountsDisplayString, getProgramAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getProgramAccounts";
import { getRecentPerformanceSamplesDisplayString, getRecentPerformanceSamplesExecuteString } from "../../../backend/src/block-functions/provider/helius/getRecentPerformanceSamples";
import { getSignaturesForAddressDisplayString, getSignaturesForAddressExecuteString } from "../../../backend/src/block-functions/provider/helius/getSignaturesForAddress";
import { getSignaturesForAssetDisplayString, getSignaturesForAssetExecuteString } from "../../../backend/src/block-functions/provider/helius/getSignaturesForAsset";
import { getSlotDisplayString, getSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/getSlot";
import { getSlotLeaderDisplayString, getSlotLeaderExecuteString } from "../../../backend/src/block-functions/provider/helius/getSlotLeader";
import { getStakeMinimumDelegationDisplayString, getStakeMinimumDelegationExecuteString } from "../../../backend/src/block-functions/provider/helius/getStakeMinimumDelegation";
import { getSupplyDisplayString, getSupplyExecuteString } from "../../../backend/src/block-functions/provider/helius/getSupply";
import { getTokenAccountBalanceDisplayString, getTokenAccountBalanceExecuteString } from "../../../backend/src/block-functions/provider/helius/getTokenAccountBalance";
import { getTokenAccountsDisplayString, getTokenAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getTokenAccounts";
import { getTokenAccountsByOwnerDisplayString, getTokenAccountsByOwnerExecuteString } from "../../../backend/src/block-functions/provider/helius/getTokenAccountsByOwner";
import { getTokenLargestAccountsDisplayString, getTokenLargestAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getTokenLargestAccounts";
import { getTokenSupplyDisplayString, getTokenSupplyExecuteString } from "../../../backend/src/block-functions/provider/helius/getTokenSupply";
import { getTransactionDisplayString, getTransactionExecuteString } from "../../../backend/src/block-functions/provider/helius/getTransaction";
import { getTransactionHistoryDisplayString, getTransactionHistoryExecuteString } from "../../../backend/src/block-functions/provider/helius/getTransactionHistory";
import { getTransactionWithCompressionInfoDisplayString, getTransactionWithCompressionInfoExecuteString } from "../../../backend/src/block-functions/provider/helius/getTransactionWithCompressionInfo"; 
import { getValidityProofDisplayString, getValidityProofExecuteString } from "../../../backend/src/block-functions/provider/helius/getValidityProof";
import { getVersionDisplayString, getVersionExecuteString } from "../../../backend/src/block-functions/provider/helius/getVersion";
import { getVoteAccountsDisplayString, getVoteAccountsExecuteString } from "../../../backend/src/block-functions/provider/helius/getVoteAccounts";
import { isBlockhashValidDisplayString, isBlockhashValidExecuteString } from "../../../backend/src/block-functions/provider/helius/isBlockhashValid";
import { minimumLedgerSlotDisplayString, minimumLedgerSlotExecuteString } from "../../../backend/src/block-functions/provider/helius/minimumLedgerSlot";

export const functionDisplayStringMap: Record<string, string> = {
  // Blockchain functions
  getUserSolBalance: getUserSolBalanceDisplayString,
  mintToken: mintTokenDisplayString,
  transferToken: transferTokenDisplayString,

  // IPFS functions
  uploadImageToPinata: uploadImageToPinataString,
  uploadMetadataToPinata: uploadMetadataToPinataString,
  createFileFromUrl: createFileFromUrlString,

  // Code functions
  solToUsd: solToUsdDisplayString,
  usdToSol: usdToSolDisplayString,
  
  // Birdeye functions
  getBaseQuoteOHLCV: getBaseQuoteOHLCVDisplayString,
  getHistoricalPrice: getHistoricalPriceDisplayString,
  getNewTokens: getNewTokensDisplayString,
  getPairOHLCV: getPairOHLCVDisplayString,
  getPairOverview: getPairOverviewDisplayString,
  getPairTrades: getPairTradesDisplayString,
  getPrice: getPriceDisplayString,
  getPriceAtUnixTime: getPriceAtUnixTimeDisplayString,
  getPriceVolume: getPriceVolumeDisplayString,
  getTokenAllMarkets: getTokenAllMarketsDisplayString,
  getTokenAllTrades: getTokenAllTradesDisplayString,
  getTokenCreationInfo: getTokenCreationInfoDisplayString,
  getTokenHolders: getTokenHoldersDisplayString,
  getTokenList: getTokenListDisplayString,
  getTokenMarketData: getTokenMarketDataDisplayString,
  getTokenMetadata: getTokenMetadataDisplayString,
  getTokenMintBurn: getTokenMintBurnDisplayString,
  getTokenOHLCV: getTokenOHLCVDisplayString,
  getTokenOverview: getTokenOverviewDisplayString,
  getTokenSecurity: getTokenSecurityDisplayString,
  getTokenTopTraders: getTokenTopTradersDisplayString,
  getTokenTradeData: getTokenTradeDataDisplayString,
  getTokenTrades: getTokenTradesDisplayString,
  getTraderGainersAndLosers: getTraderGainersAndLosersDisplayString,
  getTradesLatestBlockNumber: getTradesLatestBlockNumberDisplayString,
  getTrendingTokens: getTrendingTokensDisplayString,
  getWalletPortfolio: getWalletPortfolioDisplayString,
  getWalletTokenBalance: getWalletTokenBalanceDisplayString,
  getWalletTransactionHistory: getWalletTransactionHistoryDisplayString,
  
  // Helius functions
  getAccountInfo: getAccountInfoDisplayString,
  getAsset: getAssetDisplayString,
  getAssetProof: getAssetProofDisplayString,
  getAssetsByAuthority: getAssetsByAuthorityDisplayString,
  getAssetsByCreator: getAssetsByCreatorDisplayString,
  getAssetsByGroup: getAssetsByGroupDisplayString,
  getAssetsByOwner: getAssetsByOwnerDisplayString,
  getBalance: getBalanceDisplayString,
  getBlockCommitment: getBlockCommitmentDisplayString,
  getBlockHeight: getBlockHeightDisplayString,
  getBlockProduction: getBlockProductionDisplayString,
  getBlocks: getBlocksDisplayString,
  getBlockTime: getBlockTimeDisplayString,
  getClusterNodes: getClusterNodesDisplayString,
  getCompressedAccount: getCompressedAccountDisplayString,
  getCompressedAccountProof: getCompressedAccountProofDisplayString,
  getCompressedAccountsByOwner: getCompressedAccountsByOwnerDisplayString,
  getCompressedBalance: getCompressedBalanceDisplayString,
  getCompressedBalanceByOwner: getCompressedBalanceByOwnerDisplayString,
  getCompressedMintTokenHolders: getCompressedMintTokenHoldersDisplayString,
  getCompressedTokenAccountBalance: getCompressedTokenAccountBalanceDisplayString,
  getCompressedTokenAccountsByDelegate: getCompressedTokenAccountsByDelegateDisplayString,
  getCompressedTokenBalancesByOwner: getCompressedTokenBalancesByOwnerDisplayString,
  getCompressionSignaturesForAccount: getCompressionSignaturesForAccountDisplayString,
  getCompressionSignaturesForAddress: getCompressionSignaturesForAddressDisplayString,
  getCompressionSignaturesForOwner: getCompressionSignaturesForOwnerDisplayString,
  getCompressionSignaturesForTokenOwner: getCompressionSignaturesForTokenOwnerDisplayString,
  getEnhancedTransaction: getEnhancedTransactionDisplayString,
  getEpochInfo: getEpochInfoDisplayString,
  getEpochSchedule: getEpochScheduleDisplayString,
  getFeeForMessage: getFeeForMessageDisplayString,
  getFirstAvailableBlock: getFirstAvailableBlockDisplayString,
  getGenesisHash: getGenesisHashDisplayString,
  getHealth: getHealthDisplayString,
  getHighestSnapshotSlot: getHighestSnapshotSlotDisplayString,
  getIdentity: getIdentityDisplayString,
  getIndexerHealth: getIndexerHealthDisplayString,
  getIndexerSlot: getIndexerSlotDisplayString,
  getInflationGovernor: getInflationGovernorDisplayString,
  getInflationRate: getInflationRateDisplayString,
  getLargestAccounts: getLargestAccountsDisplayString,
  getLatestBlockhash: getLatestBlockhashDisplayString,
  getLatestCompressionSignatures: getLatestCompressionSignaturesDisplayString,
  getLatestNonVotingSignatures: getLatestNonVotingSignaturesDisplayString,
  getLeaderSchedule: getLeaderScheduleDisplayString,
  getMaxRetransmitSlot: getMaxRetransmitSlotDisplayString,
  getMaxShredInsertSlot: getMaxShredInsertSlotDisplayString,
  getMinimumBalanceForRentExemption: getMinimumBalanceForRentExemptionDisplayString,
  getMultipleCompressedAccounts: getMultipleCompressedAccountsDisplayString,
  getMultipleCompressedAccountProofs: getMultipleCompressedAccountProofsDisplayString,
  getMultipleNewAddressProofs: getMultipleNewAddressProofsDisplayString,
  getNftEditions: getNftEditionsDisplayString,
  getPriorityFeeEstimate: getPriorityFeeEstimateDisplayString,
  getProgramAccounts: getProgramAccountsDisplayString,
  getRecentPerformanceSamples: getRecentPerformanceSamplesDisplayString,
  getSignaturesForAddress: getSignaturesForAddressDisplayString,
  getSignaturesForAsset: getSignaturesForAssetDisplayString,
  getSlot: getSlotDisplayString,
  getSlotLeader: getSlotLeaderDisplayString,
  getStakeMinimumDelegation: getStakeMinimumDelegationDisplayString,
  getSupply: getSupplyDisplayString,
  getTokenAccountBalance: getTokenAccountBalanceDisplayString,
  getTokenAccounts: getTokenAccountsDisplayString,
  getTokenAccountsByOwner: getTokenAccountsByOwnerDisplayString,
  getTokenLargestAccounts: getTokenLargestAccountsDisplayString,
  getTokenSupply: getTokenSupplyDisplayString,
  getTransaction: getTransactionDisplayString,
  getTransactionHistory: getTransactionHistoryDisplayString,
  getTransactionWithCompressionInfo: getTransactionWithCompressionInfoDisplayString,
  getValidityProof: getValidityProofDisplayString,
  getVersion: getVersionDisplayString,
  getVoteAccounts: getVoteAccountsDisplayString,
  isBlockhashValid: isBlockhashValidDisplayString,
  minimumLedgerSlot: minimumLedgerSlotDisplayString,
};

export const functionExecuteStringMap: Record<string, string> = {
  // Blockchain functions
  getUserSolBalance: getUserSolBalanceExecuteString,
  mintToken: mintTokenDisplayString,
  transferToken: transferTokenDisplayString,

  // IPFS functions
  uploadImageToPinata: uploadImageToPinataString,
  uploadMetadataToPinata: uploadMetadataToPinataString,
  createFileFromUrl: createFileFromUrlString,

  // Code functions
  solToUsd: solToUsdExecuteString,
  usdToSol: usdToSolExecuteString,
  
  // Birdeye functions
  getBaseQuoteOHLCV: getBaseQuoteOHLCVExecuteString,
  getHistoricalPrice: getHistoricalPriceExecuteString,
  getNewTokens: getNewTokensExecuteString,
  getPairOHLCV: getPairOHLCVExecuteString,
  getPairOverview: getPairOverviewExecuteString,
  getPairTrades: getPairTradesExecuteString,
  getPrice: getPriceExecuteString,
  getPriceAtUnixTime: getPriceAtUnixTimeExecuteString,
  getPriceVolume: getPriceVolumeExecuteString,
  getTokenAllMarkets: getTokenAllMarketsExecuteString,
  getTokenAllTrades: getTokenAllTradesExecuteString,
  getTokenCreationInfo: getTokenCreationInfoExecuteString,
  getTokenHolders: getTokenHoldersExecuteString,
  getTokenList: getTokenListExecuteString,
  getTokenMarketData: getTokenMarketDataExecuteString,
  getTokenMetadata: getTokenMetadataExecuteString,
  getTokenMintBurn: getTokenMintBurnExecuteString,
  getTokenOHLCV: getTokenOHLCVExecuteString,
  getTokenOverview: getTokenOverviewExecuteString,
  getTokenSecurity: getTokenSecurityExecuteString,
  getTokenTopTraders: getTokenTopTradersExecuteString,
  getTokenTradeData: getTokenTradeDataExecuteString,
  getTokenTrades: getTokenTradesExecuteString,
  getTraderGainersAndLosers: getTraderGainersAndLosersExecuteString,
  getTradesLatestBlockNumber: getTradesLatestBlockNumberExecuteString,
  getTrendingTokens: getTrendingTokensExecuteString,
  getWalletPortfolio: getWalletPortfolioExecuteString,
  getWalletTokenBalance: getWalletTokenBalanceExecuteString,
  getWalletTransactionHistory: getWalletTransactionHistoryExecuteString,
  
  // Helius functions
  getAccountInfo: getAccountInfoExecuteString,
  getAsset: getAssetExecuteString,
  getAssetProof: getAssetProofExecuteString,
  getAssetsByAuthority: getAssetsByAuthorityExecuteString,
  getAssetsByCreator: getAssetsByCreatorExecuteString,
  getAssetsByGroup: getAssetsByGroupExecuteString,
  getAssetsByOwner: getAssetsByOwnerExecuteString,
  getBalance: getBalanceExecuteString,
  getBlockCommitment: getBlockCommitmentExecuteString,
  getBlockHeight: getBlockHeightExecuteString,
  getBlockProduction: getBlockProductionExecuteString,
  getBlocks: getBlocksExecuteString,
  getBlockTime: getBlockTimeExecuteString,
  getClusterNodes: getClusterNodesExecuteString,
  getCompressedAccount: getCompressedAccountExecuteString,
  getCompressedAccountProof: getCompressedAccountProofExecuteString,
  getCompressedAccountsByOwner: getCompressedAccountsByOwnerExecuteString,
  getCompressedBalance: getCompressedBalanceExecuteString,
  getCompressedBalanceByOwner: getCompressedBalanceByOwnerExecuteString,
  getCompressedMintTokenHolders: getCompressedMintTokenHoldersExecuteString,
  getCompressedTokenAccountBalance: getCompressedTokenAccountBalanceExecuteString,
  getCompressedTokenAccountsByDelegate: getCompressedTokenAccountsByDelegateExecuteString,
  getCompressedTokenBalancesByOwner: getCompressedTokenBalancesByOwnerExecuteString,
  getCompressionSignaturesForAccount: getCompressionSignaturesForAccountExecuteString,
  getCompressionSignaturesForAddress: getCompressionSignaturesForAddressExecuteString,
  getCompressionSignaturesForOwner: getCompressionSignaturesForOwnerExecuteString,
  getCompressionSignaturesForTokenOwner: getCompressionSignaturesForTokenOwnerExecuteString,
  getEnhancedTransaction: getEnhancedTransactionExecuteString,
  getEpochInfo: getEpochInfoExecuteString,
  getEpochSchedule: getEpochScheduleExecuteString,
  getFeeForMessage: getFeeForMessageExecuteString,
  getFirstAvailableBlock: getFirstAvailableBlockExecuteString,
  getGenesisHash: getGenesisHashExecuteString,
  getHealth: getHealthExecuteString,
  getHighestSnapshotSlot: getHighestSnapshotSlotExecuteString,
  getIdentity: getIdentityExecuteString,
  getIndexerHealth: getIndexerHealthExecuteString,
  getIndexerSlot: getIndexerSlotExecuteString,
  getInflationGovernor: getInflationGovernorExecuteString,
  getInflationRate: getInflationRateExecuteString,
  getLargestAccounts: getLargestAccountsExecuteString,
  getLatestBlockhash: getLatestBlockhashExecuteString,
  getLatestCompressionSignatures: getLatestCompressionSignaturesExecuteString,
  getLatestNonVotingSignatures: getLatestNonVotingSignaturesExecuteString,
  getLeaderSchedule: getLeaderScheduleExecuteString,
  getMaxRetransmitSlot: getMaxRetransmitSlotExecuteString,
  getMaxShredInsertSlot: getMaxShredInsertSlotExecuteString,
  getMinimumBalanceForRentExemption: getMinimumBalanceForRentExemptionExecuteString,
  getMultipleCompressedAccounts: getMultipleCompressedAccountsExecuteString,
  getMultipleCompressedAccountProofs: getMultipleCompressedAccountProofsExecuteString,
  getMultipleNewAddressProofs: getMultipleNewAddressProofsExecuteString,
  getNftEditions: getNftEditionsExecuteString,
  getPriorityFeeEstimate: getPriorityFeeEstimateExecuteString,
  getProgramAccounts: getProgramAccountsExecuteString,
  getRecentPerformanceSamples: getRecentPerformanceSamplesExecuteString,
  getSignaturesForAddress: getSignaturesForAddressExecuteString,
  getSignaturesForAsset: getSignaturesForAssetExecuteString,
  getSlot: getSlotExecuteString,
  getSlotLeader: getSlotLeaderExecuteString,
  getStakeMinimumDelegation: getStakeMinimumDelegationExecuteString,
  getSupply: getSupplyExecuteString,
  getTokenAccountBalance: getTokenAccountBalanceExecuteString,
  getTokenAccounts: getTokenAccountsExecuteString,
  getTokenAccountsByOwner: getTokenAccountsByOwnerExecuteString,
  getTokenLargestAccounts: getTokenLargestAccountsExecuteString,
  getTokenSupply: getTokenSupplyExecuteString,
  getTransaction: getTransactionExecuteString,
  getTransactionHistory: getTransactionHistoryExecuteString,
  getTransactionWithCompressionInfo: getTransactionWithCompressionInfoExecuteString,
  getValidityProof: getValidityProofExecuteString,
  getVersion: getVersionExecuteString,
  getVoteAccounts: getVoteAccountsExecuteString,
  isBlockhashValid: isBlockhashValidExecuteString,
  minimumLedgerSlot: minimumLedgerSlotExecuteString,
};