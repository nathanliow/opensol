// Template interface
export interface FlowTemplate {
  nodes: any[];
  edges: any[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  name: string;
  description?: string; // Optional description for the template
  category?: string; // Optional category for grouping templates
}