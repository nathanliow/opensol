import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Overview',
  description: '',
  steps: [
    {
      id: 'solana-overview-1',
      title: '',
      description: 'Solana is a high-performance blockchain that is designed to be fast, secure, and scalable. It was created by [Anatoly Yakovenko](https://x.com/aeyakovenko) and [Raj Gokal](https://x.com/rajgokal) in 2017 and launched in March 2020.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-overview-2',
      title: '',
      description: 'Many different verticals are being developed on Solana including decentralized finance (DeFi), decentralized physical infrastructure (DePIN), stablecoins, and more. They are being used to improve upon existing systems and solutions to make them faster and more efficient. Some well-known examples are [Hivemapper](https://x.com/hivemapper), [DoubleZero](https://x.com/doublezero), and [Solana Pay](https://x.com/solanapay).',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-overview-3',
      title: '',
      description: 'Solana also boasts a large international community of developers, traders, founders, and degens. [Superteam](https://x.com/superteam) is an organization that helps build communities within different countries to help developers get funding and recognition. Many more organizations also exist to ultimately help accelerate the growth of the Solana ecosystem.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-overview-4',
      title: '',
      description: 'Over the past few years, Solana has been growing rapidly in terms of volume and users. This has made it a prime environment for developers to build consumer apps, businesses, and full-fledged startups.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-overview-5',
      title: '',
      description: 'Despite this growth, Solana and the web3 industry as a whole is still in its infancy and building the skills to shape the future of Solana can be one of the greatest investments you can make for yourself.',
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};