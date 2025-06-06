import { Lesson } from "@/types/CourseTypes";
import { FlowEdge, FlowNode } from "../../../../backend/src/packages/compiler/src/types";

export const lesson_1_6: Lesson = {
  id: 'lesson-1-6',
  title: 'Ecosystem',
  description: '',
  xp: 50,
  steps: [
    {
      id: 'solana-ecosystem-1',
      title: '',
      description: `The ecosystem of apps and services are core to Solana. It's important to be familiar with some of them to understand the nature of Solana.`,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-explorer-1',
      title: '',
      description: `Solana Explorers is a tool that allows you to explore the Solana blockchain. It's a way to see the transactions and accounts on the blockchain. Top explorers include:
      \n - [Solscan](https://solscan.io/)
      \n - [Solana Explorer](https://explorer.solana.com/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-amms-1',
      title: '',
      description: `Aggregated Market Makers (AMMs) are a type of decentralized exchange that uses liquidity pools to swap tokens. This enables users to swap tokens instantly, without having to find a counterparty. Top AMMs include:
      \n - [Raydium](https://raydium.io/)
      \n - [PumpSwap](https://swap.pump.fun/)
      \n - [Meteora](https://www.meteora.ag/)
      \n - [Orca](https://www.orca.so/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-wallets-1',
      title: '',
      description: `Wallets help keep your funds safe and accessible. Top wallets include:
      \n - [Phantom](https://phantom.app/)
      \n - [Solflare](https://solflare.com/)
      \n - [Backpack](https://backpack.app/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-aggregators-1',
      title: '',
      description: `Aggregators are services that help you find the best prices for your trades. Top aggregators include:
      \n - [Jupiter](https://jup.ag/)
      \n - [Titan Exchange](https://titandex.io/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-defi-1',
      title: '',
      description: `DeFi is the decentralized finance ecosystem on Solana. It's a way to use blockchain technology to create financial applications that are not controlled by a central authority. Top DeFi protocols include:
      \n - [Drift](https://drift.trade/)
      \n - [Kamino](https://app.kamino.finance/)
      \n - [MarginFi](https://www.marginfi.com/)
      \n - [Marinade](https://marinade.finance/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-infrastructure-1',
      title: '',
      description: `Solana infrastructure is the backbone of the Solana ecosystem. Top infrastructure providers include:
      \n - [Pyth](https://pyth.network/)
      \n - [Hivemapper](https://docs.hivemapper.com/)
      \n - [Magic Block](https://www.magicblock.xyz/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
    {
      id: 'solana-nfts-1',
      title: '',
      description: `NFTs marketplaces are a way to buy and sell digital assets on the Solana blockchain. Top NFT platforms include:
      \n - [Tensor](https://tensor.trade/)
      \n - [Magic Eden](https://magiceden.io/)
      `,
      checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => true,
    },
  ],
};
