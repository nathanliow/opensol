import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_5: Lesson = {
  id: 'lesson-1-5',
  title: 'Validators, Consensus, and Propagation',
  description: '',
  xp: 50,
  steps: [
    {
      id: 'validators-tvu-1',
      title: 'Transaction Validation Unit (TVU)',
      description: `When validators receive new blocks from leaders, they use the Transaction Validation Unit (TVU) to process and validate them. The TVU mirrors the leader's Transaction Processing Unit (TPU) and handles:
      \n - Shred Fetch Stage: Receives shreds via Turbine (explained later)
      \n - Shred Verify Stage: Validates leader signatures and performs sanity checks
      \n - Retransmit Stage: Forwards shreds to downstream validators
      \n - Replay Stage: Recreates transactions in correct order and updates the local bank`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'consensus-tower-bft-1',
      title: 'Tower BFT Consensus',
      description: `Solana uses Tower BFT (TBFT), a custom implementation of Practical Byzantine Fault Tolerance (PBFT) that leverages Proof of History's synchronized clock. Unlike traditional PBFT requiring multiple communication rounds, TBFT uses the pre-established order of events to significantly reduce messaging overhead while maintaining security against malicious nodes.`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'voting-mechanism-1',
      title: 'Validator Voting',
      description: `Validators participate in consensus by submitting votes for blocks they believe are valid. Key aspects:
      \n - Validators pay transaction fees for votes
      \n - Votes are processed by leaders and included in blocks
      \n - Successful votes earn credits, incentivizing participation
      \n - Validators vote on the "heaviest" fork they believe will be finalized`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'forks-handling-1',
      title: 'Forks and Skip Rate',
      description: `Solana doesn't wait for full consensus before producing the next block, leading to forks when multiple blocks link to the same parent. Key points:
      \n - Only one fork ultimately gets finalized
      \n - Each slot has a predetermined leader
      \n - Skip rate ranges from 2-10% of slots
      \n - Transaction status: Processed → Confirmed (⅔ supermajority) → Finalized (31+ blocks built on top)`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'gossip-network-1',
      title: 'Gossip Network',
      description: `The gossip network serves as Solana's control plane, disseminating metadata about blockchain state. Features:
      \n - Shares contact info, ledger height, and voting data
      \n - Uses peer-to-peer communication with tree broadcast
      \n - Updates every 0.1 seconds over UDP
      \n - Message types: Push, Pull/Response, Prune, Ping/Pong
      \n - Data stored in Cluster Replicated Data Store (CrdsTable)`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'turbine-propagation-1',
      title: 'Turbine Block Propagation',
      description: `Turbine efficiently propagates blocks across the network using a BitTorrent-inspired approach:
      \n - Breaks data into "shreds" (up to 1280 bytes each)
      \n - Uses erasure coding for fault tolerance
      \n - Groups shreds into Forward Error Correction (FEC) batches (64 shreds: 32 data + 32 recovery)
      \n - Can recover from up to 50% packet loss per batch
      \n - Organized in "Turbine Tree" with higher-stake validators at top`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'archive-system-1',
      title: 'Archive and Data Storage',
      description: `Solana's unique approach to data storage and archival:
      \n - Current account state is known without processing entire history
      \n - Validators typically store 1-2 epochs (2-4 days) of data
      \n - Archive managed by "warehouse nodes" run by RPC providers
      \n - Two archive types: Ledger Archive (raw data) and Google Bigtable (formatted for RPC requests)
      \n - Banks handle state updates and pruning when finalized`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};
