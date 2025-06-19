"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { getUserData, updateUserProfile } from '@/lib/user';
import { UserData } from '@/types/UserTypes';
import { Icons } from '@/components/icons/icons';
import { courses } from '@/courses';
import { DashboardMenu } from '@/components/dashboard/DashboardMenu';
import { uploadImageToPinata } from '@/ipfs/uploadImageToPinata';
import { usePrivy } from '@privy-io/react-auth';

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { supabaseUser, userAddress, isConnected } = useUserAccountContext();
  const { user } = usePrivy();
  const router = useRouter();

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    if (supabaseUser) {
      const fetchUserData = async () => {
        try {
          const data = await getUserData(supabaseUser.id);
          setUserData(data);
          if (data) {
            setEditDisplayName(data.display_name || '');
            setEditBio(data.bio || '');
            setEditAvatarUrl(data.avatar_url || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [supabaseUser, isConnected, router]);

  // Calculate total lessons and completed lessons
  const totalLessons = Object.values(courses).reduce((total, course) => total + course.lessons.length, 0);
  const completedLessons = userData?.finished_lessons?.length || 0;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate course completion stats
  const courseStats = Object.values(courses).map(course => {
    const completedCourseLessons = course.lessons.filter(lesson => 
      userData?.finished_lessons?.includes(lesson.id)
    ).length;
    const isCompleted = completedCourseLessons === course.lessons.length;
    
    return {
      course,
      completed: completedCourseLessons,
      total: course.lessons.length,
      isCompleted
    };
  });

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAvatarFile(null);
    setPreviewUrl('');
    if (userData) {
      setEditDisplayName(userData.display_name || '');
      setEditBio(userData.bio || '');
      setEditAvatarUrl(userData.avatar_url || '');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSaveProfile = async () => {
    if (!supabaseUser) return;

    try {
      setUpdating(true);
      let finalAvatarUrl = editAvatarUrl;

      // Upload avatar to IPFS if a new file was selected
      if (avatarFile) {
        try {
          setUploadingAvatar(true);
          finalAvatarUrl = await uploadImageToPinata(avatarFile);
        } catch (error) {
          console.error('Error uploading avatar:', error);
          alert('Failed to upload avatar. Please try again.');
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const updatedData = await updateUserProfile(supabaseUser.id, {
        display_name: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
        avatar_url: finalAvatarUrl || undefined
      });

      if (updatedData) {
        setUserData(updatedData);
        setEditAvatarUrl(finalAvatarUrl);
        setIsEditingProfile(false);
        setAvatarFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getAvatarDisplay = () => {
    // Show preview if file is selected
    if (previewUrl) {
      return (
        <img 
          src={previewUrl} 
          alt="Avatar Preview" 
          className="w-full h-full object-cover"
        />
      );
    }
    
    // Show current avatar if editing but no new file
    if (editAvatarUrl && editAvatarUrl.startsWith('http')) {
      return (
        <img 
          src={editAvatarUrl} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
        {editDisplayName?.charAt(0).toUpperCase() || userAddress?.charAt(0).toUpperCase() || user?.email?.address?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!supabaseUser || !userData) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <Icons.FiUser size={48} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-gray-400 mb-4">Unable to load profile data.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-start items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <DashboardMenu/>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isEditingProfile ? (
                  <div className="relative">
                    {/* Hidden file input */}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Avatar with hover overlay */}
                    <div 
                      className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                      onClick={triggerFileInput}
                    >
                      {getAvatarDisplay()}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="text-white text-center">
                          <Icons.FiUpload size={20} className="mx-auto mb-1" />
                          <div className="text-xs font-medium">Change</div>
                        </div>
                      </div>
                    </div>
                    
                    {avatarFile && (
                      <div className="mt-2 text-xs text-green-400 text-center max-w-24">
                        Selected: {avatarFile.name.length > 12 ? avatarFile.name.substring(0, 12) + '...' : avatarFile.name}
                      </div>
                    )}
                  </div>
                ) : (
                  userData.avatar_url && userData.avatar_url.startsWith('http') ? (
                    <img 
                      src={userData.avatar_url} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
                      {userData.display_name?.charAt(0).toUpperCase() || userAddress?.charAt(0).toUpperCase() || user?.email?.address?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    {/* Inline editable display name */}
                    <div className="flex items-center gap-3 mb-3">
                      <h2 
                        className="text-3xl font-bold bg-transparent border-none outline-none hover:bg-[#2a2a2a]/50 focus:bg-[#2a2a2a] focus:px-2 focus:py-1 focus:rounded transition-colors cursor-text"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setEditDisplayName(e.currentTarget.textContent || '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        style={{ 
                          color: 'white',
                          fontStyle: 'normal'
                        }}
                      >
                        {editDisplayName || userData.display_name || 'Anonymous User'}
                      </h2>
                    </div>
                    
                    <div className="flex flex-col gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Icons.FiUser size={16} />
                        {userAddress ? (
                          <>Address: <span className="font-mono truncate">{userAddress}</span></>
                        ) : user?.email?.address ? (
                          <>Email: <span className="font-mono truncate">{user.email.address}</span></>
                        ) : (
                          <>No wallet or email connected</>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.FiCalendar size={16} />
                        Joined: <span className="font-mono truncate">{new Date(userData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Inline editable bio */}
                    <div className="mt-4">
                      <p 
                        className="text-gray-300 bg-transparent border-none outline-none min-h-[1.5rem] hover:bg-[#2a2a2a]/50 focus:bg-[#2a2a2a] focus:px-2 focus:py-1 focus:rounded transition-colors cursor-text"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setEditBio(e.currentTarget.textContent || '')}
                        onFocus={(e) => {
                          if (e.currentTarget.textContent === 'Click to add bio') {
                            e.currentTarget.textContent = '';
                          }
                        }}
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          color: editBio ? '#D1D5DB' : '#9CA3AF',
                          fontStyle: editBio ? 'normal' : 'italic'
                        }}
                      >
                        {editBio || 'Click to add bio'}
                      </p>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updating || uploadingAvatar}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md font-medium flex items-center gap-2"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Icons.FiLoader size={16} className="animate-spin" />
                            Uploading Image...
                          </>
                        ) : updating ? (
                          <>
                            <Icons.FiLoader size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icons.FiSave size={16} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updating || uploadingAvatar}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 rounded-md font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-bold">{userData.display_name || 'Anonymous User'}</h2>
                      <button
                        onClick={handleEditProfile}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Edit Profile"
                      >
                        <Icons.FiEdit2 size={18} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Icons.FiUser size={16} />
                        {userAddress ? (
                          <>Address: <span className="font-mono truncate">{userAddress}</span></>
                        ) : user?.email?.address ? (
                          <>Email: <span className="font-mono truncate">{user.email.address}</span></>
                        ) : (
                          <>No wallet or email connected</>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.FiCalendar size={16} />
                        Joined: <span className="font-mono truncate">{new Date(userData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {userData.bio && (
                      <p className="mt-4 text-gray-300">{userData.bio}</p>
                    )}
                  </>
                )}
              </div>

              {/* XP Badge */}
              <div className="text-center flex-shrink-0">
                <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-400">{userData.xp}</div>
                  <div className="text-sm text-yellow-300 mt-1">Total XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Lessons Progress */}
          <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Icons.FiBook size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Lessons Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completed</span>
                  <span className="font-medium">{completedLessons}/{totalLessons}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-lg font-bold text-blue-400">
                  {completionPercentage}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Courses Completed */}
          <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Icons.FiAward size={20} className="text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Courses</h3>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  {courseStats.filter(stat => stat.isCompleted).length}/{courseStats.length}
                </div>
                <div className="text-sm text-gray-400">Courses Completed</div>
              </div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Icons.FiDollarSign size={20} className="text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Earnings</h3>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  ${userData.monthly_earnings?.reduce((total, earning) => total + earning.earnings, 0)?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-400">Total Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress Section */}
        <div className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
              <Icons.FiBookmark size={20} />
              Course Progress
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseStats.map(({ course, completed, total, isCompleted }) => {
              const completionPercent = (completed / total) * 100;
              
              return (
                <div key={course.id} className={`rounded-lg shadow-lg overflow-hidden h-full ${isCompleted ? 'bg-green-900/30 border-2 border-green-600/50' : 'bg-[#1e1e1e]'}`}>
                  <div className={`p-6 h-full flex flex-col ${isCompleted ? 'hover:bg-green-800/20' : 'hover:bg-[#2a2a2a]'} transition-colors`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      {isCompleted && (
                        <Icons.FiCheck size={18} className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 flex-1">{course.description}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{completed}/{total} lessons</span>
                        <span className="text-sm font-medium text-white">{Math.round(completionPercent)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>
                      
                      {isCompleted && (
                        <div className="mt-2 text-xs text-green-400 font-medium">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 