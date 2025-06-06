import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Blocks',
  description: '',
  xp: 50,
  steps: [
    {
      id: 'solana-blocks-1',
      title: '',
      description: 'Unlike many blockchains that construct entire blocks before broadcasting them (discrete block building), Solana uses continuous block building. This means blocks are assembled and streamed dynamically as they are created during allocated time slots, significantly reducing latency and improving network efficiency.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-blocks-2',
      title: '',
      description: 'Each slot on Solana lasts 400 milliseconds, and each leader validator is assigned four consecutive slots (1.6 seconds total) before rotating to the next leader. This rotation system ensures fair distribution of block production responsibilities across the network.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-blocks-3',
      title: '',
      description: 'Block validation requires that all transactions within a block must be valid and reproducible by other nodes. Two slots before assuming leadership, a validator stops forwarding transactions to prepare for block production.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-blocks-4',
      title: '',
      description: 'Block building happens in the Banking Stage of the Transaction Processing Unit (TPU). Here, transactions are processed in parallel and packaged into ledger "entries" - batches of 64 non-conflicting transactions. A "bank" represents the state at a given block, and when a block is finalized, account updates are flushed from the bank to disk permanently.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-blocks-5',
      title: '',
      description: 'Parallel processing is possible because each transaction includes a list of all accounts it will read and write to. Transactions conflict if they both write to the same account or if one reads while another writes to the same account. Conflicting transactions go into different entries and execute sequentially, while non-conflicting transactions execute in parallel.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-blocks-6',
      title: '',
      description: 'Six threads process transactions in parallel: four for normal transactions and two exclusively for vote transactions (essential for consensus). Once grouped into entries, transactions are executed by the Solana Virtual Machine (SVM), which locks accounts, validates transactions, executes logic, and commits changes to the bank.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};
