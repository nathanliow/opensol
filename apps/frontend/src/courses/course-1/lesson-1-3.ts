import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Transactions',
  description: '',
  steps: [
    {
      id: 'solana-transactions-1',
      title: '',
      description: 'Transactions mutate the state of the blockchain. They are atomic, meaning that they either succeed or fail completely. It also costs a small amount of SOL to execute a transaction, similar to a gas fee on EVM chains. Transactions are also signed, usually by the sender, to prove their legitimacy and secure user funds. The complexity of a transaction is measured through the number of compute units (CUs) it consumes.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-transactions-2',
      title: '',
      description: `Transactions have four parts: 
      \n- Header: Indicates the accounts that need to sign the transaction.
      \n- Instructions: This includes the program ID, account keys, and data.
      \n- Recent Blockhash: This is a hash of the most recent block on the network.
      \n- List of account addresses: This is the list of account addresses that are being read or written to by the transaction.`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-transactions-3',
      title: '',
      description: 'Instructions are used to conduct a specific operation (mint, burn, transfer, etc.). They require the program, accounts, and data necessary for the instruction to execute. A transaction can hold a limited number of instructions, totaling up to a maximum of 1,232 bytes.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-transactions-4',
      title: '',
      description: 'The list of account addresses is a feature unique to Solana that allows for fast and cheap transactions. Providing such addresses beforehand to the transaction allows it to optimize and execute mutally exclusive operations in parallel. This list of addresses can also be used to easily filter through large amounts of data when looking for transactions specific to a certain address/account.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-transactions-5',
      title: '',
      description: 'Once a transaction is created, it can be sent to the frontend of an application for a user to sign. Then the transaction and signature are forwarded to an RPC provider like Helius who efficiently sends it to a validator node to be included in a block.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};