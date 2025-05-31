import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'What is Birdeye?',
  description: '',
  steps: [
    {
      id: 'what-is-birdeye',
      title: 'What is Birdeye?',
      description: 'Birdeye is a Solana data provider that allows you to fetch massive amounts of data from the Solana blockchain. First, obtain an API key at [bds.birdeye.so/user/overview](https://bds.birdeye.so/user/overview) and add it in the top right menu dropdown. OpenSOL stores all API keys locally in your own device and never saves it. Feel free to visit their [docs](https://docs.birdeye.so/docs/overview).',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'birdeye-use-cases',
      title: 'Birdeye Use Cases',
      description: 'Birdeye provides APIs for getting Solana Defi, token, wallet, and chain data. They are useful for getting the data of thousands of different assets or wallets if needed. They may also provide data that other providers do not, such as the price chart data of a specific token.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'birdeye-limitations',
      title: 'Birdeye Limitations',
      description: 'All of Birdeye\'s APIs are behind a paywall except the "Token List", "Price", and "Price-Historical" APIs. You can view the exact data accessibility packages [here](https://docs.birdeye.so/docs/data-accessibility-by-packages).',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};