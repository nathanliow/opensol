import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Create your first Flow',
  description: '',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to openSOL!',
      description: 'OpenSOL is designed to make understanding Solana development simple and easy. Nodes (or blocks) can be dragged onto the canvas and connected to each other to create a flow. Click the Next button below to begin building your first flow.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'add-function-node',
      title: 'Add a FUNCTION node',
      description: 'Drag a FUNCTION node onto the canvas. Function nodes are the starting point for all flows and they can be used to label your flow or logic.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'FUNCTION'),
    },
    {
      id: 'add-get-node',
      title: 'Add a GET node',
      description: 'Drag a GET node from the sidebar onto the canvas. This node lets you get common blockchain data.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'GET'),
    },
    {
      id: 'select-get-user-sol-balance',
      title: 'Choose "getUserSolBalance"',
      description: 'Open the GET node and select "getUserSolBalance" from the function dropdown to query an address balance.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) =>
        nodes.some(
          (n: FlowNode) =>
            n.type === 'GET' && n.data?.inputs?.function?.value === 'getUserSolBalance'
        ),
    },
    {
      id: 'connect-function-to-get',
      title: 'Connect FUNCTION to GET',
      description: 'Connect the bottom handle of the Function node to the top handle of the GET node. The top and bottom handles of each node are used for directing the flow of execution with the topmost node being the start and traversing down.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const funcIds = nodes.filter((n: FlowNode) => n.type === 'FUNCTION').map((n: FlowNode) => n.id);
        const getIds = nodes.filter((n: FlowNode) => n.type === 'GET').map((n: FlowNode) => n.id);
        return edges?.some((e: FlowEdge) => funcIds.includes(e.source) && getIds.includes(e.target));
      },
    },
    {
      id: 'add-const-node',
      title: 'Add a CONST node with wallet address',
      description: 'Drag a CONST node onto the canvas, set its type to "string" and enter a wallet address in its Value field. CONST stands for constant and these nodes can be used to store a commonly used value such as wallet addresses and mint addresses. They can then be connected to all necessary input fields without needing to re-enter the value.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) =>
        nodes.some(
          (n: FlowNode) =>
            n.type === 'CONST' && n.data?.inputs?.value?.value && String(n.data.inputs.value.value).length > 0
        ),
    },
    {
      id: 'connect-const-to-get',
      title: 'Connect CONST to GET address input',
      description: 'Connect the output of the CONST node to the GET node\'s "address" input handle. The left handles of each node are used for inputs for that node and its respective field. The right handles are the outputs for that node which can then be connected to other input handles of other nodes.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const constIds = nodes.filter((n: FlowNode) => n.type === 'CONST').map((n: FlowNode) => n.id);
        const getIds = nodes.filter((n: FlowNode) => n.type === 'GET').map((n: FlowNode) => n.id);
        return edges?.some(
          (e: FlowEdge) =>
            constIds.includes(e.source) &&
            getIds.includes(e.target) &&
            e.targetHandle === 'input-address'
        );
      },
    },
    {
      id: 'add-print-node',
      title: 'Add a PRINT node',
      description: 'Drag a PRINT node onto the canvas and type "$output$" into the template field. This node is used to display the result of the node that came before it (connected to its top handle). That result will be displayed according to the template and the result will replace the $output$ placeholder.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => nodes.some((n: FlowNode) => n.type === 'PRINT' && n.data?.inputs?.template?.value === '$output$'),
    },
    {
      id: 'connect-get-to-print',
      title: 'Connect GET to PRINT',
      description: 'Connect the output of the GET node to the top handle of the PRINT node.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => {
        const getIds = nodes.filter((n: FlowNode) => n.type === 'GET').map((n: FlowNode) => n.id);
        const printIds = nodes.filter((n: FlowNode) => n.type === 'PRINT').map((n: FlowNode) => n.id);
        return edges?.some(
          (e: FlowEdge) =>
            getIds.includes(e.source) && printIds.includes(e.target)
        );
      },
    },
  ],
};