export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  // Called with current flow graph; returns true when step accomplished
  checkComplete: (context: { nodes: any[]; edges: any[] }) => boolean;
}

export interface TutorialUnit {
  id: string;
  title: string;
  chapter: string;
  steps: TutorialStep[];
} 