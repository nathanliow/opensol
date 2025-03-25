import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict, format, isValid } from 'date-fns';

type TimeAgoResult = {
  timeAgo: string;
  formattedDate: string;
};

export function useTimeAgo() {
  const [timestamps, setTimestamps] = useState<Map<string, TimeAgoResult>>(new Map());
  
  // Update time ago strings every second for real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimestamps(current => {
        // Only recalculate if we have timestamps to update
        if (current.size === 0) return current;
        
        const newMap = new Map(current);
        
        // Recalculate all timestamps
        newMap.forEach((_, dateString) => {
          const result = calculateTimeAgo(dateString);
          newMap.set(dateString, result);
        });
        
        return newMap;
      });
    }, 1000); // Update every second for more real-time updates
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to calculate time ago for a date string
  const calculateTimeAgo = (dateString: string): TimeAgoResult => {
    try {
      const date = new Date(dateString);
      
      if (!isValid(date)) {
        return { timeAgo: 'Invalid date', formattedDate: 'Invalid date' };
      }
      
      // Calculate difference in seconds
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // For very recent times (less than a minute), use custom formatting
      if (diffInSeconds < 60) {
        const timeAgo = diffInSeconds <= 5 
          ? 'just now'
          : `${diffInSeconds} seconds ago`;
        
        return {
          timeAgo,
          formattedDate: format(date, 'MMM d, yyyy h:mm a')
        };
      }
      
      // For everything else, use date-fns formatting
      return {
        timeAgo: formatDistanceToNowStrict(date, { addSuffix: true }),
        formattedDate: format(date, 'MMM d, yyyy h:mm a')
      };
    } catch (error) {
      return { timeAgo: 'Invalid date', formattedDate: 'Invalid date' };
    }
  };
  
  // Function to get time ago for a specific date string
  const getTimeAgo = (dateString?: string): TimeAgoResult => {
    if (!dateString) {
      return { timeAgo: 'N/A', formattedDate: 'N/A' };
    }
    
    // Check if we already have this timestamp calculated
    if (!timestamps.has(dateString)) {
      const result = calculateTimeAgo(dateString);
      setTimestamps(current => {
        const newMap = new Map(current);
        newMap.set(dateString, result);
        return newMap;
      });
      return result;
    }
    
    // Return cached result
    return timestamps.get(dateString)!;
  };
  
  return { getTimeAgo };
}