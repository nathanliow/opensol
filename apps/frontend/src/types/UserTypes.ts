export interface UserData {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  wallet_address: string;
  email?: string;
  created_at: string;
  updated_at: string;
  starred_projects: string[];
  monthly_earnings: {
    month: string; // 1-12, 1 = January, 12 = December
    year: string;  // Ex: 2025
    earnings: number;
  }[];
  xp: number;
  finished_lessons: string[]
}
