import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_5_2: Lesson = {
  id: 'lesson-5-2',
  title: 'Minting a token',
  description: '',
  xp: 100,
  steps: [
    {
      id: 'welcome',
      title: 'Prerequisites',
      description: 'Before continuing, make sure you have devnet SOL and you are in "Devnet" mode. You can get devnet SOL [here](https://faucet.solana.com/) and you can switch to devnet mode in the top right menu button.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'add-mint-node',
      title: 'Add a MINT node',
      description: 'Drag a MINT node onto the canvas and fill out the input fields. As you can see, tokens need certain metadata to be significant. The name is the name of the token, the symbol is the short-form ticker of the token, the description can be used to describe what the token is used for, and the image is commonly displayed alongside the token. For context, most platforms choose to display the symbol and the image.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'MINT' &&
          n.data?.inputs?.name?.value &&
          String(n.data?.inputs?.name?.value).length > 0 &&
          n.data?.inputs?.symbol?.value &&
          String(n.data?.inputs?.symbol?.value).length > 0 &&
          n.data?.inputs?.description?.value &&
          String(n.data?.inputs?.description?.value).length > 0 &&
          n.data?.inputs?.image?.value &&
          String(n.data?.inputs?.image?.value).length > 0
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
      id: 'connect-mint-to-print',
      title: 'Connect MINT to PRINT',
      description: 'Connect the output handle of the MINT node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const mintNode = nodes.find((n: FlowNode) => n.type === 'MINT');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');

        return !!(mintNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === mintNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. When you mint the token, it will ask you to confirm the transaction as you will sign and broadcast the actual minting transaction to the blockchain. The MINT node also mints some tokens to your account for you to play with. You should see a message regarding the minting of the token.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'check-code-main',
      title: 'Check the Code: main.ts',
      description: 'Click the Code tab and select main.ts to see the code that was generated for the flow. Notice how the metadata needs to be uploaded to an IPFS provider. The provider will then provide a URI that can attached to the token and used to access the offchain data. Then the minting of the token can take place.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'check-code-mintToken',
      title: 'Check the Code: mintToken.ts',
      description: `Select mintToken.ts. Note that this code uses Privy and @solana/web3.js to access the connected wallet and necessary imports to mint a token. Understand what code is being executed in the mintToken function. 
      \n 1. It first needs to connect to the Solana network and create a Transaction so we can fill it with instructions. 
      \n 2. First instruction is creating a token account and the configuration for the token we're about to mint. Note that no tokens have been minted yet.
      \n 3. The second instruction is setting up the data account for the metadata using Metaplex.
      \n 4. The third instruction will create an Associated Token Account (ATA) for the minter (you) to hold tokens.
      \n 5. The fourth instruction will mint the tokens to the ATA.
      \nThen the transaction is signed and sent to the network.
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
                  "value": "Mint Token"
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