import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Fetching Asset Data',
  description: '',
  steps: [
    {
      id: 'welcome',
      title: 'Fetching assets',
      description: 'We\'re going to use Helius\' DAS (Digital Asset Standard) API to fetch data of an asset (tokens or NFTs).',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'add-function-node',
      title: 'Add a FUNCTION node',
      description: 'Drag a FUNCTION node onto the canvas to act as the starting point for our flow and name it "Get asset data".',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'FUNCTION' && n.data?.inputs?.name?.value === 'Get asset data'),
    },
    {
      id: 'add-helius-node',
      title: 'Add a HELIUS node',
      description: 'Drag a HELIUS node onto the canvas. This node lets you access Helius\' APIs right here on openSOL.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'HELIUS'),
    },
    {
      id: 'select-get-asset',
      title: 'Choose "getAsset"',
      description: 'Open the HELIUS node and select "getAsset" from the function dropdown to query an asset. This function requires an "assetId" which is the address of the token or NFT. You can find these addresses easily on any DEX/marketplace/terminal like [Dexscreener](https://dexscreener.com/), [Magic Eden](https://magiceden.us/solana), or [Axiom](https://axiom.trade/). Enter in an assetId or use this: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) =>
        nodes.some(
          (n: FlowNode) =>
            n.type === 'HELIUS' && n.data?.inputs?.function?.value === 'getAsset' && n.data?.inputs?.assetId?.value && String(n.data.inputs.assetId.value).length > 0
        ),
    },
    {
      id: 'connect-function-to-helius',
      title: 'Connect FUNCTION to HELIUS',
      description: 'Connect the bottom handle of the Function node to the top handle of the HELIUS node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const funcIds = nodes.filter((n: FlowNode) => n.type === 'FUNCTION').map((n: FlowNode) => n.id);
        const heliusIds = nodes.filter((n: FlowNode) => n.type === 'HELIUS').map((n: FlowNode) => n.id);
        return edges?.some((e: FlowEdge) => funcIds.includes(e.source) && heliusIds.includes(e.target));
      },
    },
    {
      id: 'add-print-node',
      title: 'Add a PRINT node',
      description: 'Drag a PRINT node onto the canvas and type "$output$" into the template field.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'PRINT' && n.data?.inputs?.template?.value === '$output$'),
    },
    {
      id: 'connect-helius-to-print',
      title: 'Connect HELIUS to PRINT',
      description: 'Connect the output of the HELIUS node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const heliusIds = nodes.filter((n: FlowNode) => n.type === 'HELIUS').map((n: FlowNode) => n.id);
        const printIds = nodes.filter((n: FlowNode) => n.type === 'PRINT').map((n: FlowNode) => n.id);
        return edges?.some(
          (e: FlowEdge) =>
            heliusIds.includes(e.source) && printIds.includes(e.target)
        );
      },
    },
    {
      id: 'run-flow-and-check-output',
      title: 'Run the flow',
      description: 'Click the Run button to execute the flow. You should see the asset data printed in the console.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        return !!(output && output.length > 0);
      },
    },
  ],
};