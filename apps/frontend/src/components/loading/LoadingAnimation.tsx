"use client";

import { FC } from 'react';

interface LoadingAnimationProps {
  message?: string;
}

export const LoadingAnimation: FC<LoadingAnimationProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p>{message}</p>
    </div>
  );
};