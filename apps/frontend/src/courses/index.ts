import { Course } from '@/types/CourseTypes';
import { lesson_1_1, lesson_1_2, lesson_1_3 } from './course-1';
import { lesson_2_1, lesson_2_2 } from './course-2';
import { lesson_3_1, lesson_3_2, lesson_3_3 } from './course-3';
import { lesson_4_1, lesson_4_2 } from './course-4';

export const courses: Record<string, Course> = {
  'course-1': {
    id: 'course-1',
    title: 'Solana Fundamentals',
    description: 'Learn the fundamental concepts of Solana',
    lessons: [
      lesson_1_1, // Overview 50xp
      lesson_1_2, // Accounts 50xp
      lesson_1_3, // Transactions 50xp
      // lesson-1-4: Blocks (slots) 50xp
      // lesson-1-5: Validators, Consensus, and Propagation 50xp
      // lesson-1-6: Programs 50xp
      // lesson-1-7: Ecosystem 50xp
    ],
  },
  'course-2': {
    id: 'course-2',
    title: 'Introduction to openSOL',
    description: 'Learn the basics',
    lessons: [
      lesson_2_1, // Creating your first Flow 100xp
      lesson_2_2, // Executing a Flow 100xp
    ],
  },
  'course-3': {
    id: 'course-3',
    title: 'Reading from the Blockchain using Helius',
    description: 'Learn how to use Helius to fetch, read, and understand data from the blockchain',
    lessons: [
      lesson_3_1, // What is Helius? 50xp
      lesson_3_2, // Fetching asset data with Helius 100xp
      lesson_3_3, // Fetching transaction data with Helius 100xp
      // lesson_3_4: Getting PnL of a wallet 100xp
    ],
  },
  'course-4': {
    id: 'course-4',
    title: 'Reading from the Blockchain using Birdeye',
    description: 'Learn how to use Birdeye to fetch, read, and understand data from the blockchain',
    lessons: [
      lesson_4_1, // What is Birdeye? 50xp
      lesson_4_2, // Fetching token data 100xp
      // lesson_4_3, // Fetching wallet portfolio 100xp
      // lesson_4_4, // Fetching token chart data 100xp
    ],
  },
  // 'course-5': {
  //   id: 'course-5',
  //   title: 'Tokens',
  //   description: 'Learn how tokens work on Solana',
  //   lessons: [
  //     // lesson-5-1: Minting a token (account creation, ipfs, Associated Token Account, decimals, metadata) 100xp
  //     // lesson-5-2: Transferring a token (sending to ATA, creating ATA if not already there) 100xp
  //     // lesson-5-3: Getting information about a token (balance, metadata, liquidity, price, etc.) 100xp
  //     // lesson-5-4: something about bonding curves and swapping 100xp
  //     // lesson-5-5: something about token ecosystems (pump, launchpads, etc.) 100xp
  //   ],
  // },
  // 'course-6': {
  //   id: 'course-6',
  //   title: 'NFTs',
  //   description: 'Learn how NFTs work on Solana',
  //   lessons: [
  //     // lesson-5-1: Minting an NFT (account creation, ipfs, Associated Token Account, decimals, metadata) 100xp
  //     // lesson-5-2: Transferring an NFT (sending to ATA, creating ATA if not already there) 100xp
  //     // lesson-5-3: Getting information about an NFT (metadata, price, etc.) 100xp
  //     // lesson-5-4: something about NFT ecosystems (magic eden, tensor, etc.) 100xp
  //   ],
  // },
  // 'course-7': {
  //   id: 'course-7',
  //   title: 'Sending Transactions',
  //   description: 'Learn how to send transactions on Solana',
  //   lessons: [
  //     // lesson-7-1: Sending a transaction (sending tokens, creating accounts, invoke programs) 100xp
  //     // lesson-7-2: Swapping (jupiter api) 100xp
  //     // lesson-7-3: Staked connections (jupiter api) 100xp
  //     // lesson-7-4: How to land transactions efficiently (jupiter api) 100xp
  //   ],
  // },
};

export type CourseId = keyof typeof courses; 