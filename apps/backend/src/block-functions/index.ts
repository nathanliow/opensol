import { getUserSolBalance } from './default/get/getUserSolBalance';
import { usdToSol } from './misc/usdToSol';
import { solToUsd } from './misc/solToUsd';
import { BlockTemplate } from '../../../frontend/src/components/services/blockTemplateService';
import { getAccountInfo } from './default/helius/getAccountInfo';
import { getAsset } from './default/helius/getAsset';
import { getAssetProof } from './default/helius/getAssetProof';
import { getAssetsByAuthority } from './default/helius/getAssetsByAuthority';
import { getAssetsByCreator } from './default/helius/getAssetsByCreator';
import { getAssetsByGroup } from './default/helius/getAssetsByGroup';
import { getAssetsByOwner } from './default/helius/getAssetsByOwner';
import { getBalance } from './default/helius/getBalance';
import { getBlockCommitment } from './default/helius/getBlockCommitment';
import { getBlockHeight } from './default/helius/getBlockHeight';
import { getBlockProduction } from './default/helius/getBlockProduction';
import { getBlocks } from './default/helius/getBlocks';
import { getBlockTime } from './default/helius/getBlockTime';
import { getClusterNodes } from './default/helius/getClusterNodes';
import { getEpochInfo } from './default/helius/getEpochInfo';
import { getEpochSchedule } from './default/helius/getEpochSchedule';
import { getFeeForMessage } from './default/helius/getFeeForMessage';
import { getFirstAvailableBlock } from './default/helius/getFirstAvailableBlock';
import { getGenesisHash } from './default/helius/getGenesisHash';
import { getHealth } from './default/helius/getHealth';
import { getHighestSnapshotSlot } from './default/helius/getHighestSnapshotSlot';
import { getIdentity } from './default/helius/getIdentity';
import { getInflationGovernor } from './default/helius/getInflationGovernor';
import { getInflationRate } from './default/helius/getInflationRate';
import { getLargestAccounts } from './default/helius/getLargestAccounts';
import { getLatestBlockhash } from './default/helius/getLatestBlockhash';
import { getLeaderSchedule } from './default/helius/getLeaderSchedule';
import { getMaxRetransmitSlot } from './default/helius/getMaxRetransmitSlot';
import { getMaxShredInsertSlot } from './default/helius/getMaxShredInsertSlot';
import { getMinimumBalanceForRentExemption } from './default/helius/getMinimumBalanceForRentExemption';
import { getNftEditions } from './default/helius/getNftEditions';
import { getProgramAccounts } from './default/helius/getProgramAccounts';
import { getRecentPerformanceSamples } from './default/helius/getRecentPerformanceSamples';
import { getSignaturesForAddress } from './default/helius/getSignaturesForAddress';
import { getSignaturesForAsset } from './default/helius/getSignaturesForAsset';
import { getSlot } from './default/helius/getSlot';
import { getSlotLeader } from './default/helius/getSlotLeader';
import { getStakeMinimumDelegation } from './default/helius/getStakeMinimumDelegation';
import { getSupply } from './default/helius/getSupply';
import { getTokenAccountBalance } from './default/helius/getTokenAccountBalance';
import { getTokenAccounts } from './default/helius/getTokenAccounts';
import { getTokenLargestAccounts } from './default/helius/getTokenLargestAccounts';
import { getTokenSupply } from './default/helius/getTokenSupply';
import { getTransaction } from './default/helius/getTransaction';
import { getTransactionCount } from './default/helius/getTransactionCount';
import { getVersion } from './default/helius/getVersion';
import { getVoteAccounts } from './default/helius/getVoteAccounts';
import { isBlockhashValid } from './default/helius/isBlockhashValid';
import { minimumLedgerSlot } from './default/helius/minimumLedgerSlot';

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
  MISC: {
    solToUsd,
    usdToSol
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