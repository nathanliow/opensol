import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_5_1: Lesson = {
  id: 'lesson-5-1',
  title: 'How do tokens work?',
  description: '',
  xp: 100,
  steps: [
    {
      id: 'what-is-a-token',
      title: 'What is a token?',
      description: 'A token is a fungible asset meaning there is no difference between one token and another of that same token. Tokens have various purposes such as being used as a currency, a reward, or a security. They can be used to incentivze users, create markets, foster communities, or power protocols.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'token-info',
      title: 'Some more token info',
      description: 'Tokens have a mint address, name, symbol, and decimals. Tradable tokens can also have market information such as market cap, liquidity, price, volume, holders, and more. Tokens can be tradable if they have an associated liquidity pool, set up through a DEX like Raydium or Meteora.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};