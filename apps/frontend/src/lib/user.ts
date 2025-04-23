import { supabase } from "./supabase";
import { UserData } from "@/types/UserTypes";

// Get all projects for a user
export async function getUserData(userId: string): Promise<UserData | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) {
    const userData: UserData = {
      id: data.id || '',
      user_id: data.user_id || '',
      display_name: data.display_name || '',
      bio: data.bio || '',
      avatar_url: data.avatar_url || '',
      wallet_address: data.wallet_address || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      starred_projects: Array.isArray(data.starred_projects) ? data.starred_projects : [],
      monthly_earnings: data.monthly_earnings || [],
    };
    
    return userData;
  }

  if (error) {
    console.error('Error getting user data:', error);
    throw error;
  }

  return data;
}