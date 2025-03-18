export const initialNodes = [
  { 
    id: "a", 
    type: "input", 
    position: { x: 0, y: 0 }, 
    data: { label: "wire" } 
  },
  {
    id: "d",
    type: "output",
    position: { x: 0, y: 200 },
    data: { label: "with React Flow" },
  },
  {
    id: 'start-node',
    type: 'START',
    position: { x: 100, y: 100 },
    data: { label: 'Start' },
  },
  {
    id: 'get-node',
    type: 'GET',
    position: { x: 250, y: 200 },
    data: { label: 'GET' },
  },
  {
    id: 'object-node',
    type: 'OBJECT',
    position: { x: 350, y: 200 },
    data: { label: 'OBJECT' },
  },
];