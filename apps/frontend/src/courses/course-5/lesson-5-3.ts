import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_5_3: Lesson = {
  id: 'lesson-5-3',
  title: 'Transferring a token',
  description: '',
  xp: 100,
  steps: [
    {
      id: 'welcome',
      title: 'Prerequisites',
      description: 'Before continuing, make sure you have devnet SOL and you are in "Devnet" mode. You can get devnet SOL [here](https://faucet.solana.com/) and you can switch to devnet mode in the top right menu button. Also make sure you have tokens minted from the previous lesson.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'add-transfer-node',
      title: 'Add a TRANSFER node',
      description: 'Drag a TRANSFER node onto the canvas and fill out the input fields. The transfer node is used to transfer tokens from one wallet to another. You can get the token address of the tokens you have minted from Solscan or your wallet.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'TRANSFER' &&
          n.data?.inputs?.tokenAddress?.value &&
          String(n.data?.inputs?.tokenAddress?.value).length > 0 &&
          n.data?.inputs?.amount?.value &&
          String(n.data?.inputs?.amount?.value).length > 0 &&
          n.data?.inputs?.recipient?.value &&
          String(n.data?.inputs?.recipient?.value).length > 0
        );
      },
    },
    {
      id: 'add-print-node',
      title: 'Add a PRINT node',
      description: 'Drag a PRINT node onto the canvas and type "$output$" into the template field.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => 
        nodes.some((n: FlowNode) => n.type === 'PRINT' && n.data?.inputs?.template?.value === '$output$'),
    },
    {
      id: 'connect-transfer-to-print',
      title: 'Connect TRANSFER to PRINT',
      description: 'Connect the output handle of the TRANSFER node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const transferNode = nodes.find((n: FlowNode) => n.type === 'TRANSFER');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');

        return !!(transferNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === transferNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. When you transfer the token, it will ask you to confirm the transaction as you will sign and broadcast the actual minting transaction to the blockchain.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'check-code-main',
      title: 'Check the Code: main.ts',
      description: 'Click the Code tab and select main.ts to see the code that was generated for the flow.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'check-code-transferToken',
      title: 'Check the Code: transferToken.ts',
      description: `Select transferToken.ts. Note that this code uses Privy and @solana/web3.js to access the connected wallet and necessary imports to transfer a token. Understand what code is being executed in the createTokenTransferTransaction function. 
      \n 1. It first needs to fetch the metadata such as the decimals for the token by using getMint. This ensures we are using the right number of decimals for the transfer amount.
      \n 2. Then it fetches the associated token account of the sender and the recipient.
      \n 3. If the recipient doesn't have an associated token account, it creates one and adds it to the transaction.
      \n 4. Then it creates the transfer instruction with the to and from associated token accounts and the amount to transfer.
      \n 5. Then the transaction is signed and sent to the network in the transferToken function.
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
  startNodes: [
    {
      "id": "function-1748670572868",
      "type": "FUNCTION",
      "position": {
          "x": 0,
          "y": 0
      },
      "data": {
          "inputs": {
              "name": {
                  "handleId": "input-name",
                  "type": "string",
                  "value": "Transfer Token"
              }
          },
          "output": {
              "handleId": "output",
              "type": "string",
              "value": ""
          }
      },
      "measured": {
          "width": 243,
          "height": 81
      },
      "selected": false,
      "dragging": false
    }
  ],
};