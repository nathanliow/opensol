export interface FlowNode {
  id: string; // {node type}-{unix timestamp at creation}
  type: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    selectedFunction?: string;
    parameters?: { [key: string]: any };
    [key: string]: any;
  };
}

export interface FlowEdge {
  id: string;
  source: string; // id of the source node
  target: string; // id of the target node
  sourceHandle?: string;
  targetHandle?: string;
}