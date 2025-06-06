import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_7: Lesson = {
  id: 'lesson-1-7',
  title: 'Sources',
  description: '',
  xp: 50,
  steps: [
    {
      id: 'solana-sources-1',
      title: '',
      description: `Sources
      \n - [Solana - How It Works](https://solanahowitworks.xyz/)
      \n - [Solana.com](https://solana.com/)
      \n - [Helius.dev](https://www.helius.dev/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};
