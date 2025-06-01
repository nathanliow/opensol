import { uploadMetadataToPinataString } from "@/ipfs/uploadMetadataToPinata";
import { uploadImageToPinataString } from "@/ipfs/uploadImageToPinata";
import { createFileFromUrlString } from "@/utils/createFileFromUrl";
import { transferTokenString } from "@/hooks/useTokenTransfer";
import { mintTokenString } from "@/hooks/useTokenMint";

// Birdeye
import { getBaseQuoteOHLCVString } from "../../../backend/src/block-functions/provider/birdeye/getBaseQuoteOHLCV";
import { getHistoricalPriceString } from "../../../backend/src/block-functions/provider/birdeye/getHistoricalPrice";
import { getNewTokensString } from "../../../backend/src/block-functions/provider/birdeye/getNewTokens";
import { getPairOHLCVString } from "../../../backend/src/block-functions/provider/birdeye/getPairOHLCV";
import { getPairOverviewString } from "../../../backend/src/block-functions/provider/birdeye/getPairOverview";
import { getPairTradesString } from "../../../backend/src/block-functions/provider/birdeye/getPairTrades";
import { getPriceString } from "../../../backend/src/block-functions/provider/birdeye/getPrice";
import { getPriceAtUnixTimeString } from "../../../backend/src/block-functions/provider/birdeye/getPriceAtUnixTime";
import { getPriceVolumeString } from "../../../backend/src/block-functions/provider/birdeye/getPriceVolume";
import { getTokenAllMarketsString } from "../../../backend/src/block-functions/provider/birdeye/getTokenAllMarkets";
import { getTokenAllTradesString } from "../../../backend/src/block-functions/provider/birdeye/getTokenAllTrades";
import { getTokenCreationInfoString } from "../../../backend/src/block-functions/provider/birdeye/getTokenCreationInfo";
import { getTokenHoldersString } from "../../../backend/src/block-functions/provider/birdeye/getTokenHolders";
import { getTokenListString } from "../../../backend/src/block-functions/provider/birdeye/getTokenList";
import { getTokenMarketDataString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMarketData";
import { getTokenMetadataString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMetadata";
import { getTokenMintBurnString } from "../../../backend/src/block-functions/provider/birdeye/getTokenMintBurn";
import { getTokenOHLCVString } from "../../../backend/src/block-functions/provider/birdeye/getTokenOHLCV";
import { getTokenOverviewString } from "../../../backend/src/block-functions/provider/birdeye/getTokenOverview";
import { getTokenSecurityString } from "../../../backend/src/block-functions/provider/birdeye/getTokenSecurity";
import { getTokenTopTradersString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTopTraders";
import { getTokenTradeDataString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTradeData";
import { getTokenTradesString } from "../../../backend/src/block-functions/provider/birdeye/getTokenTrades";
import { getTraderGainersAndLosersString } from "../../../backend/src/block-functions/provider/birdeye/getTraderGainersAndLosers";
import { getTradesLatestBlockNumberString } from "../../../backend/src/block-functions/provider/birdeye/getTradesLatestBlockNumber";
import { getTrendingTokensString } from "../../../backend/src/block-functions/provider/birdeye/getTrendingTokens";
import { getWalletPortfolioString } from "../../../backend/src/block-functions/provider/birdeye/getWalletPortfolio";
import { getWalletTokenBalanceString } from "../../../backend/src/block-functions/provider/birdeye/getWalletTokenBalance";
import { getWalletTransactionHistoryString } from "../../../backend/src/block-functions/provider/birdeye/getWalletTransactionHistory";

// Helius
import { getAccountInfoString } from "../../../backend/src/block-functions/provider/helius/getAccountInfo";
import { getAssetString } from "../../../backend/src/block-functions/provider/helius/getAsset";
import { getAssetProofString } from "../../../backend/src/block-functions/provider/helius/getAssetProof";
import { getAssetsByAuthorityString } from "../../../backend/src/block-functions/provider/helius/getAssetsByAuthority";
import { getAssetsByCreatorString } from "../../../backend/src/block-functions/provider/helius/getAssetsByCreator";
import { getAssetsByGroupString } from "../../../backend/src/block-functions/provider/helius/getAssetsByGroup";
import { getAssetsByOwnerString } from "../../../backend/src/block-functions/provider/helius/getAssetsByOwner";
import { getBalanceString } from "../../../backend/src/block-functions/provider/helius/getBalance";
import { getBlockCommitmentString } from "../../../backend/src/block-functions/provider/helius/getBlockCommitment";
import { getBlockHeightString } from "../../../backend/src/block-functions/provider/helius/getBlockHeight";
import { getBlockProductionString } from "../../../backend/src/block-functions/provider/helius/getBlockProduction";
import { getBlocksString } from "../../../backend/src/block-functions/provider/helius/getBlocks";
import { getBlockTimeString } from "../../../backend/src/block-functions/provider/helius/getBlockTime";
import { getClusterNodesString } from "../../../backend/src/block-functions/provider/helius/getClusterNodes";
import { getCompressedBalanceByOwnerString } from "../../../backend/src/block-functions/provider/helius/getCompressedBalanceByOwner";
import { getCompressedAccountString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccount";
import { getCompressedAccountProofString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccountProof";
import { getCompressedAccountsByOwnerString } from "../../../backend/src/block-functions/provider/helius/getCompressedAccountsByOwner";
import { getCompressedBalanceString } from "../../../backend/src/block-functions/provider/helius/getCompressedBalance";
import { getCompressedMintTokenHoldersString } from "../../../backend/src/block-functions/provider/helius/getCompressedMintTokenHolders";
import { getCompressedTokenAccountBalanceString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenAccountBalance";
import { getCompressedTokenAccountsByDelegateString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenAccountsByDelegate";
import { getCompressedTokenBalancesByOwnerString } from "../../../backend/src/block-functions/provider/helius/getCompressedTokenBalancesByOwner";
import { getCompressionSignaturesForAccountString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForAccount";
import { getCompressionSignaturesForAddressString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForAddress";
import { getCompressionSignaturesForOwnerString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForOwner";
import { getCompressionSignaturesForTokenOwnerString } from "../../../backend/src/block-functions/provider/helius/getCompressionSignaturesForTokenOwner";
import { getEnhancedTransactionString } from "../../../backend/src/block-functions/provider/helius/getEnhancedTransaction";
import { getEpochInfoString } from "../../../backend/src/block-functions/provider/helius/getEpochInfo";
import { getEpochScheduleString } from "../../../backend/src/block-functions/provider/helius/getEpochSchedule";
import { getFeeForMessageString } from "../../../backend/src/block-functions/provider/helius/getFeeForMessage";
import { getFirstAvailableBlockString } from "../../../backend/src/block-functions/provider/helius/getFirstAvailableBlock";
import { getGenesisHashString } from "../../../backend/src/block-functions/provider/helius/getGenesisHash";
import { getHealthString } from "../../../backend/src/block-functions/provider/helius/getHealth";
import { getHighestSnapshotSlotString } from "../../../backend/src/block-functions/provider/helius/getHighestSnapshotSlot";
import { getIdentityString } from "../../../backend/src/block-functions/provider/helius/getIdentity";
import { getIndexerHealthString } from "../../../backend/src/block-functions/provider/helius/getIndexerHealth"; 
import { getIndexerSlotString } from "../../../backend/src/block-functions/provider/helius/getIndexerSlot";
import { getInflationGovernorString } from "../../../backend/src/block-functions/provider/helius/getInflationGovernor";
import { getInflationRateString } from "../../../backend/src/block-functions/provider/helius/getInflationRate";
import { getLargestAccountsString } from "../../../backend/src/block-functions/provider/helius/getLargestAccounts";
import { getLatestBlockhashString } from "../../../backend/src/block-functions/provider/helius/getLatestBlockhash";
import { getLatestCompressionSignaturesString } from "../../../backend/src/block-functions/provider/helius/getLatestCompressionSignatures";
import { getLatestNonVotingSignaturesString } from "../../../backend/src/block-functions/provider/helius/getLatestNonVotingSignatures";
import { getLeaderScheduleString } from "../../../backend/src/block-functions/provider/helius/getLeaderSchedule";
import { getMaxRetransmitSlotString } from "../../../backend/src/block-functions/provider/helius/getMaxRetransmitSlot";
import { getMaxShredInsertSlotString } from "../../../backend/src/block-functions/provider/helius/getMaxShredInsertSlot";
import { getMinimumBalanceForRentExemptionString } from "../../../backend/src/block-functions/provider/helius/getMinimumBalanceForRentExemption";
import { getMultipleCompressedAccountsString } from "../../../backend/src/block-functions/provider/helius/getMultipleCompressedAccounts";
import { getMultipleCompressedAccountProofsString } from "../../../backend/src/block-functions/provider/helius/getMultipleCompressedAccountProofs";
import { getMultipleNewAddressProofsString } from "../../../backend/src/block-functions/provider/helius/getMultipleNewAddressProofs";
import { getNftEditionsString } from "../../../backend/src/block-functions/provider/helius/getNftEditions";
import { getPriorityFeeEstimateString } from "../../../backend/src/block-functions/provider/helius/getPriorityFeeEstimate";
import { getProgramAccountsString } from "../../../backend/src/block-functions/provider/helius/getProgramAccounts";
import { getRecentPerformanceSamplesString } from "../../../backend/src/block-functions/provider/helius/getRecentPerformanceSamples";
import { getSignaturesForAddressString } from "../../../backend/src/block-functions/provider/helius/getSignaturesForAddress";
import { getSignaturesForAssetString } from "../../../backend/src/block-functions/provider/helius/getSignaturesForAsset";
import { getSlotString } from "../../../backend/src/block-functions/provider/helius/getSlot";
import { getSlotLeaderString } from "../../../backend/src/block-functions/provider/helius/getSlotLeader";
import { getStakeMinimumDelegationString } from "../../../backend/src/block-functions/provider/helius/getStakeMinimumDelegation";
import { getSupplyString } from "../../../backend/src/block-functions/provider/helius/getSupply";
import { getTokenAccountBalanceString } from "../../../backend/src/block-functions/provider/helius/getTokenAccountBalance";
import { getTokenAccountsString } from "../../../backend/src/block-functions/provider/helius/getTokenAccounts";
import { getTokenLargestAccountsString } from "../../../backend/src/block-functions/provider/helius/getTokenLargestAccounts";
import { getTokenSupplyString } from "../../../backend/src/block-functions/provider/helius/getTokenSupply";
import { getTransactionString } from "../../../backend/src/block-functions/provider/helius/getTransaction";
import { getTransactionHistoryString } from "../../../backend/src/block-functions/provider/helius/getTransactionHistory";
import { getTransactionWithCompressionInfoString } from "../../../backend/src/block-functions/provider/helius/getTransactionWithCompressionInfo"; 
import { getValidityProofString } from "../../../backend/src/block-functions/provider/helius/getValidityProof";
import { getVersionString } from "../../../backend/src/block-functions/provider/helius/getVersion";
import { getVoteAccountsString } from "../../../backend/src/block-functions/provider/helius/getVoteAccounts";
import { isBlockhashValidString } from "../../../backend/src/block-functions/provider/helius/isBlockhashValid";
import { minimumLedgerSlotString } from "../../../backend/src/block-functions/provider/helius/minimumLedgerSlot";

export const functionStringMap: Record<string, string> = {
  // Core functions
  mintToken: mintTokenString,
  transferToken: transferTokenString,
  uploadImageToPinata: uploadImageToPinataString,
  uploadMetadataToPinata: uploadMetadataToPinataString,
  createFileFromUrl: createFileFromUrlString,
  
  // Birdeye functions
  getBaseQuoteOHLCV: getBaseQuoteOHLCVString,
  getHistoricalPrice: getHistoricalPriceString,
  getNewTokens: getNewTokensString,
  getPairOHLCV: getPairOHLCVString,
  getPairOverview: getPairOverviewString,
  getPairTrades: getPairTradesString,
  getPrice: getPriceString,
  getPriceAtUnixTime: getPriceAtUnixTimeString,
  getPriceVolume: getPriceVolumeString,
  getTokenAllMarkets: getTokenAllMarketsString,
  getTokenAllTrades: getTokenAllTradesString,
  getTokenCreationInfo: getTokenCreationInfoString,
  getTokenHolders: getTokenHoldersString,
  getTokenList: getTokenListString,
  getTokenMarketData: getTokenMarketDataString,
  getTokenMetadata: getTokenMetadataString,
  getTokenMintBurn: getTokenMintBurnString,
  getTokenOHLCV: getTokenOHLCVString,
  getTokenOverview: getTokenOverviewString,
  getTokenSecurity: getTokenSecurityString,
  getTokenTopTraders: getTokenTopTradersString,
  getTokenTradeData: getTokenTradeDataString,
  getTokenTrades: getTokenTradesString,
  getTraderGainersAndLosers: getTraderGainersAndLosersString,
  getTradesLatestBlockNumber: getTradesLatestBlockNumberString,
  getTrendingTokens: getTrendingTokensString,
  getWalletPortfolio: getWalletPortfolioString,
  getWalletTokenBalance: getWalletTokenBalanceString,
  getWalletTransactionHistory: getWalletTransactionHistoryString,
  
  // Helius functions
  getAccountInfo: getAccountInfoString,
  getAsset: getAssetString,
  getAssetProof: getAssetProofString,
  getAssetsByAuthority: getAssetsByAuthorityString,
  getAssetsByCreator: getAssetsByCreatorString,
  getAssetsByGroup: getAssetsByGroupString,
  getAssetsByOwner: getAssetsByOwnerString,
  getBalance: getBalanceString,
  getBlockCommitment: getBlockCommitmentString,
  getBlockHeight: getBlockHeightString,
  getBlockProduction: getBlockProductionString,
  getBlocks: getBlocksString,
  getBlockTime: getBlockTimeString,
  getClusterNodes: getClusterNodesString,
  getCompressedAccount: getCompressedAccountString,
  getCompressedAccountProof: getCompressedAccountProofString,
  getCompressedAccountsByOwner: getCompressedAccountsByOwnerString,
  getCompressedBalance: getCompressedBalanceString,
  getCompressedBalanceByOwner: getCompressedBalanceByOwnerString,
  getCompressedMintTokenHolders: getCompressedMintTokenHoldersString,
  getCompressedTokenAccountBalance: getCompressedTokenAccountBalanceString,
  getCompressedTokenAccountsByDelegate: getCompressedTokenAccountsByDelegateString,
  getCompressedTokenBalancesByOwner: getCompressedTokenBalancesByOwnerString,
  getCompressionSignaturesForAccount: getCompressionSignaturesForAccountString,
  getCompressionSignaturesForAddress: getCompressionSignaturesForAddressString,
  getCompressionSignaturesForOwner: getCompressionSignaturesForOwnerString,
  getCompressionSignaturesForTokenOwner: getCompressionSignaturesForTokenOwnerString,
  getEnhancedTransaction: getEnhancedTransactionString,
  getEpochInfo: getEpochInfoString,
  getEpochSchedule: getEpochScheduleString,
  getFeeForMessage: getFeeForMessageString,
  getFirstAvailableBlock: getFirstAvailableBlockString,
  getGenesisHash: getGenesisHashString,
  getHealth: getHealthString,
  getHighestSnapshotSlot: getHighestSnapshotSlotString,
  getIdentity: getIdentityString,
  getIndexerHealth: getIndexerHealthString,
  getIndexerSlot: getIndexerSlotString,
  getInflationGovernor: getInflationGovernorString,
  getInflationRate: getInflationRateString,
  getLargestAccounts: getLargestAccountsString,
  getLatestBlockhash: getLatestBlockhashString,
  getLatestCompressionSignatures: getLatestCompressionSignaturesString,
  getLatestNonVotingSignatures: getLatestNonVotingSignaturesString,
  getLeaderSchedule: getLeaderScheduleString,
  getMaxRetransmitSlot: getMaxRetransmitSlotString,
  getMaxShredInsertSlot: getMaxShredInsertSlotString,
  getMinimumBalanceForRentExemption: getMinimumBalanceForRentExemptionString,
  getMultipleCompressedAccounts: getMultipleCompressedAccountsString,
  getMultipleCompressedAccountProofs: getMultipleCompressedAccountProofsString,
  getMultipleNewAddressProofs: getMultipleNewAddressProofsString,
  getNftEditions: getNftEditionsString,
  getPriorityFeeEstimate: getPriorityFeeEstimateString,
  getProgramAccounts: getProgramAccountsString,
  getRecentPerformanceSamples: getRecentPerformanceSamplesString,
  getSignaturesForAddress: getSignaturesForAddressString,
  getSignaturesForAsset: getSignaturesForAssetString,
  getSlot: getSlotString,
  getSlotLeader: getSlotLeaderString,
  getStakeMinimumDelegation: getStakeMinimumDelegationString,
  getSupply: getSupplyString,
  getTokenAccountBalance: getTokenAccountBalanceString,
  getTokenAccounts: getTokenAccountsString,
  getTokenLargestAccounts: getTokenLargestAccountsString,
  getTokenSupply: getTokenSupplyString,
  getTransaction: getTransactionString,
  getTransactionHistory: getTransactionHistoryString,
  getTransactionWithCompressionInfo: getTransactionWithCompressionInfoString,
  getValidityProof: getValidityProofString,
  getVersion: getVersionString,
  getVoteAccounts: getVoteAccountsString,
  isBlockhashValid: isBlockhashValidString,
  minimumLedgerSlot: minimumLedgerSlotString,
};