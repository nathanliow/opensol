import { Course } from '@/types/CourseTypes';
import { lesson_1_1 } from './course-1';
import { lesson_2_1, lesson_2_2 } from './course-2';
import { lesson_3_1 } from './course-3';

export const courses: Record<string, Course> = {
  'course-1': {
    id: 'course-1',
    title: 'Solana Fundamentals',
    description: 'Learn the fundamental concepts of Solana',
    lessons: [
      lesson_1_1, // Overview
      // lesson_2_2: Accounts (User accounts, Token accounts, Program accounts, System accounts)
      // lesson-2-3: Transactions (transactions change blockchain state, sending tokens, creating accounts, invoke programs)
      // lesson-2-4: Blocks (slots)
      // lesson-2-5: Validators and Consensus
      // lesson-2-6: Programs
      // lesson-2-7: Ecosystem
    ],
  },
  'course-2': {
    id: 'course-2',
    title: 'Introduction to openSOL',
    description: 'Learn the basics',
    lessons: [
      lesson_2_1, // Creating your first Flow
      lesson_2_2, // Executing a Flow
    ],
  },
  'course-3': {
    id: 'course-3',
    title: 'Reading from the Blockchain using Helius',
    description: 'Learn how to use Helius to fetch, read, and understand data from the blockchain',
    lessons: [
      lesson_3_1, // What is Helius?
      // lesson_3_2: Fetching asset data with Helius
      // lesson_3_3: Fetching transaction data with Helius (transaction history, transaction details, pagination etc.)
      // lesson_3_4: Getting PnL of a wallet
    ],
  },
  // 'course-4': {
  //   id: 'course-4',
  //   title: 'Reading from the Blockchain using Birdeye',
  //   description: 'Learn how to use Birdeye to fetch, read, and understand data from the blockchain',
  //   lessons: [
  //   ],
  // },
  // 'course-5': {
  //   id: 'course-5',
  //   title: 'Tokens',
  //   description: 'Learn how tokens work on Solana',
  //   lessons: [
  //     // lesson-4-1: Minting a token (account creation, ipfs, Associated Token Account, decimals, metadata)
  //     // lesson-4-2: Transferring a token (sending to ATA, creating ATA if not already there)
  //     // lesson-4-3: Getting information about a token (balance, metadata, liquidity, price, etc.)
  //     // lesson-4-4: something about bonding curves and swapping
  //     // lesson-4-5: something about token ecosystems (pump, launchpads, etc.)
  //   ],
  // },
  // 'course-6': {
  //   id: 'course-6',
  //   title: 'NFTs',
  //   description: 'Learn how NFTs work on Solana',
  //   lessons: [
  //     // lesson-5-1: Minting an NFT (account creation, ipfs, Associated Token Account, decimals, metadata)
  //     // lesson-5-2: Transferring an NFT (sending to ATA, creating ATA if not already there)
  //     // lesson-5-3: Getting information about an NFT (metadata, price, etc.)
  //     // lesson-5-4: something about NFT ecosystems (magic eden, tensor, etc.)
  //   ],
  // },
  // 'course-7': {
  //   id: 'course-7',
  //   title: 'Sending Transactions',
  //   description: 'Learn how to send transactions on Solana',
  //   lessons: [
  //     // lesson-7-1: Sending a transaction (sending tokens, creating accounts, invoke programs)
  //   ],
  // },
};

export type CourseId = keyof typeof courses; 