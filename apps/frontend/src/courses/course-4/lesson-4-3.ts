import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Fetching Wallet Portfolio',
  description: '',
  xp: 100,
  steps: [
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      description: 'This lesson requires a paid Birdeye API key with a tier of Starter or higher. The lesson can still be completed but the output will be an error.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return true;
      },
    },
    {
      id: 'add-birdeye-node',
      title: 'Add a BIRDEYE node',
      description: 'Drag a BIRDEYE node onto the canvas and select "getWalletPortfolio" from the function dropdown to query a token. This will use the [wallet portfolio API](https://docs.birdeye.so/reference/get-v1-wallet-token_list) and return the portfolio of the wallet.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'BIRDEYE' && 
          n.data?.inputs?.function?.value === 'getWalletPortfolio'
        );
      },
    },
    {
      id: 'add-const',
      title: 'Add a CONST node',
      description: 'Drag a CONST node onto the canvas and set its type to "string". Enter in a wallet address or use this: A4DCAjDwkq5jYhNoZ5Xn2NbkTLimARkerVv81w2dhXgL',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) =>
        nodes.some(
          (n: FlowNode) =>
            n.type === 'CONST' && 
          n.data?.inputs?.dataType?.value === 'string' && 
          n.data?.inputs?.value?.value && 
          String(n.data.inputs.value.value).length > 0
        ),
    },
    {
      id: 'connect-const-to-birdeye',
      title: 'Connect CONST to BIRDEYE',
      description: 'Connect the output handle of the CONST node to the address input handle of the BIRDEYE node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNode = nodes.find((n: FlowNode) => n.type === 'CONST');
        const birdeyeNode = nodes.find((n: FlowNode) => n.type === 'BIRDEYE');
        
        return !!(constNode && birdeyeNode && 
          edges?.some((e: FlowEdge) => e.source === constNode.id && e.target === birdeyeNode.id));
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
      id: 'connect-birdeye-to-print',
      title: 'Connect BIRDEYE to PRINT',
      description: 'Connect the output handle of the BIRDEYE node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const birdeyeNode = nodes.find((n: FlowNode) => n.type === 'BIRDEYE');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');

        return !!(birdeyeNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === birdeyeNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. You should see the wallet portfolio data printed in the console. ',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
    {
      id: 'add-helius-node',
      title: 'Add a HELIUS node',
      description: 'Another way to fetch the wallet portfolio is to use Helius. Drag a HELIUS node onto the canvas and select "getTokenAccountsByOwner" from the function dropdown to query a token. This will use the [token accounts by owner API](https://www.helius.dev/docs/rpc/guides/gettokenaccountsbyowner) and return the token accounts of the wallet.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return nodes.some((n: FlowNode) => 
          n.type === 'HELIUS' && 
          n.data?.inputs?.function?.value === 'getTokenAccountsByOwner'
        );
      },
    },
    {
      id: 'connect-const-to-helius',
      title: 'Connect CONST to HELIUS',
      description: 'Connect the output handle of the CONST node to the address input handle of the HELIUS node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constNode = nodes.find((n: FlowNode) => n.type === 'CONST');
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS');
        
        return !!(constNode && heliusNode && 
          edges?.some((e: FlowEdge) => e.source === constNode.id && e.target === heliusNode.id));
      },
    },
    {
      id: 'connect-helius-to-print',
      title: 'Connect HELIUS to PRINT',
      description: 'Connect the bottom handle of the HELIUS node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const heliusNode = nodes.find((n: FlowNode) => n.type === 'HELIUS');
        const printNode = nodes.find((n: FlowNode) => n.type === 'PRINT');

        return !!(heliusNode && printNode && 
          edges?.some((e: FlowEdge) => e.source === heliusNode.id && e.target === printNode.id));
      },
    },
    {
      id: 'run-flow',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. You should see the wallet portfolio data printed in the console. ',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
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
                  "value": "Fetch Wallet Portfolio"
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