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
      xp: data.xp || 0,
      finished_lessons: data.finished_lessons || []
    };
    
    return userData;
  }

  if (error) {
    console.error('Error getting user data:', error);
    throw error;
  }

  return data;
}

// Update user lesson progress when a lesson is completed
export async function updateUserLessonProgress(userId: string, lessonId: string, xpToAdd: number): Promise<void> {
  try {
    const currentUserData = await getUserData(userId);
    if (!currentUserData) {
      throw new Error('User data not found');
    }

    if (currentUserData.finished_lessons.includes(lessonId)) {
      console.log('Lesson already completed:', lessonId);
      return;
    }

    const updatedFinishedLessons = [...currentUserData.finished_lessons, lessonId];
    const updatedXp = currentUserData.xp + xpToAdd;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        finished_lessons: updatedFinishedLessons,
        xp: updatedXp,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user lesson progress:', error);
      throw error;
    }

    console.log(`Lesson ${lessonId} completed! Added ${xpToAdd} XP. Total XP: ${updatedXp}`);
  } catch (error) {
    console.error('Error in updateUserLessonProgress:', error);
    throw error;
  }
}

// Update user profile information
export async function updateUserProfile(userId: string, updates: {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

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
        xp: data.xp || 0,
        finished_lessons: data.finished_lessons || []
      };
      
      return userData;
    }

    return null;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}