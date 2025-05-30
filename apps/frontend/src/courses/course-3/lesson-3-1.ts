import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'What is Helius?',
  description: '',
  steps: [
    {
      id: 'what-is-helius',
      title: 'What is Helius?',
      description: 'Helius is a Solana RPC provider that allows you to fetch data and send transactions on the Solana blockchain. First, obtain an API key at [dashboard.helius.dev](https://dashboard.helius.dev/) and add it in the top right menu dropdown. OpenSOL stores all API keys locally in your own device and never saves it. Feel free to visit their [docs](https://www.helius.dev/docs).',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'helius-use-cases',
      title: 'Helius Use Cases',
      description: 'Helius provides APIs for getting Solana data, data streaming, and event listening. They also provide dedicated nodes for advanced builders to achieve lower latency and higher performance. This allows Helius to be used to perform essentially any action you can think of on Solana.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};