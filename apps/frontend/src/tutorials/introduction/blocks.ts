export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  isComplete: (nodes: any[], edges: any[]) => boolean;
}

const introBlocks = {
  id: 'intro-blocks',
  chapter: 'Introduction to openSOL',
  title: 'Introduction to Blocks',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to openSOL!',
      description: 'OpenSOL is a visual programming platform that makes Solana development accessible through a no-code interface. Click the Next button below to begin building your first flow.',
      isComplete: () => true,
    },
    {
      id: 'add-function-node',
      title: 'Add a "Function" node',
      description: 'Drag a "Function" node onto the canvas. This is a simple label for your function.',
      isComplete: (nodes: any[]) => nodes.some((n: any) => n.type === 'FUNCTION'),
    },
    {
      id: 'add-get-node',
      title: 'Add a "GET" node',
      description: 'Drag a "GET" node from the sidebar onto the canvas. This node lets you retrieve blockchain data.',
      isComplete: (nodes: any[]) => nodes.some((n: any) => n.type === 'GET'),
    },
    {
      id: 'select-get-user-sol-balance',
      title: 'Choose "getUserSolBalance"',
      description: 'Open the GET node and select "getUserSolBalance" from the Function dropdown to query an address balance.',
      isComplete: (nodes: any[]) =>
        nodes.some(
          (n: any) =>
            n.type === 'GET' && n.data?.inputs?.function?.value === 'getUserSolBalance'
        ),
    },
    {
      id: 'connect-function-to-get',
      title: 'Connect Function to GET',
      description: 'Connect the bottom flow handle of the Function node to the top flow handle of the GET node.',
      isComplete: (nodes: any[], edges: any[]) => {
        const funcIds = nodes.filter((n: any) => n.type === 'FUNCTION').map((n: any) => n.id);
        const getIds = nodes.filter((n: any) => n.type === 'GET').map((n: any) => n.id);
        return edges?.some((e: any) => funcIds.includes(e.source) && getIds.includes(e.target));
      },
    },
    {
      id: 'add-const-node',
      title: 'Add a "Const" node with Wallet Address',
      description: 'Drag a "CONST" node onto the canvas, set its type to "string" and enter a wallet address in its Value field.',
      isComplete: (nodes: any[]) =>
        nodes.some(
          (n: any) =>
            n.type === 'CONST' && n.data?.inputs?.value?.value && String(n.data.inputs.value.value).length > 0
        ),
    },
    {
      id: 'connect-const-to-get',
      title: 'Connect CONST to GET address input',
      description: 'Connect the output of the CONST node to the GET node\'s "address" input handle.',
      isComplete: (nodes: any[], edges: any[]) => {
        const constIds = nodes.filter((n: any) => n.type === 'CONST').map((n: any) => n.id);
        const getIds = nodes.filter((n: any) => n.type === 'GET').map((n: any) => n.id);
        return edges?.some(
          (e: any) =>
            constIds.includes(e.source) &&
            getIds.includes(e.target) &&
            e.targetHandle === 'input-address'
        );
      },
    },
    {
      id: 'add-print-node',
      title: 'Add a "Print" node',
      description: 'Drag a "PRINT" node onto the canvas to display the result.',
      isComplete: (nodes: any[]) => nodes.some((n: any) => n.type === 'PRINT'),
    },
    {
      id: 'connect-get-to-print',
      title: 'Connect GET to PRINT',
      description: 'Connect the output of the GET node to the template input of the PRINT node.',
      isComplete: (nodes: any[], edges: any[]) => {
        const getIds = nodes.filter((n: any) => n.type === 'GET').map((n: any) => n.id);
        const printIds = nodes.filter((n: any) => n.type === 'PRINT').map((n: any) => n.id);
        return edges?.some(
          (e: any) =>
            getIds.includes(e.source) && printIds.includes(e.target)
        );
      },
    },
  ],
};

export default introBlocks; 