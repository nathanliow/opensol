import { TutorialUnit } from '../../types';

const introductionToBlocks: TutorialUnit = {
  id: 'introduction-to-blocks',
  title: 'Introduction to Blocks',
  chapter: 'Introduction to openSOL',
  steps: [
    {
      id: 'add-get-node',
      title: 'Add a "Get" Node',
      description: 'From the sidebar, drag a "GET" node onto the canvas. This node lets you retrieve data from the blockchain.',
      checkComplete: ({ nodes }) => {
        return nodes.some((n) => n.type === 'GET');
      },
    },
    {
      id: 'select-get-user-sol-balance',
      title: 'Select the "getUserSolBalance" function',
      description: 'In the GET node’s function dropdown, choose "getUserSolBalance" to query an account balance.',
      checkComplete: ({ nodes }) => {
        return nodes.some((n) => n.type === 'GET' && n.data?.inputs?.function?.value === 'getUserSolBalance');
      },
    },
  ],
};

export default introductionToBlocks; 