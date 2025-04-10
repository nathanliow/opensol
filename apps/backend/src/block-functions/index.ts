import { getUserSolBalance } from './blockchain/get/getUserSolBalance';
import { usdToSol } from './code/math/usdToSol';
import { solToUsd } from './code/math/solToUsd';
import { BlockTemplate } from '../../../frontend/src/components/services/blockTemplateService';
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
import { getVersion } from './provider/helius/getVersion';
import { getVoteAccounts } from './provider/helius/getVoteAccounts';
import { isBlockhashValid } from './provider/helius/isBlockhashValid';
import { minimumLedgerSlot } from './provider/helius/minimumLedgerSlot';
import { mintToken } from './blockchain/mint/mintToken';

// Group templates by their block type
export const templates: Record<string, Record<string, BlockTemplate>> = {
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
    getVersion,
    getVoteAccounts,
    isBlockhashValid,
    minimumLedgerSlot
  },
  MATH: {
    solToUsd,
    usdToSol
  },
  MINT: {
    mintToken
  }
};

// Helper to get all templates flattened into a single record
export const getFlattenedTemplates = (): Record<string, BlockTemplate> => {
  const flattened: Record<string, BlockTemplate> = {};
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