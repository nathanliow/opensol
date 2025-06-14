"use client";

import { useState, useEffect } from 'react';
import { courses } from '@/courses';
import { Lesson, LessonStep } from '@/types/CourseTypes';
import { FlowNode } from '../../../../backend/src/packages/compiler/src/types';
import { useLesson } from '@/contexts/LessonContext';
import { useUserAccountContext } from '@/app/providers/UserAccountContext';
import { Icons } from '../icons/icons';

interface LessonPanelProps {
  nodes: FlowNode[];
  edges: any[];
  output?: string;
}

// Function to parse markdown-style links [text](url)
const parseLinks = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    
    // Add the link
    parts.push({ 
      type: 'link', 
      content: match[1], 
      url: match[2] 
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }
  
  return parts;
};

const RenderedDescription = ({ description }: { description: string }) => {
  const parts = parseLinks(description);
  
  return (
    <p className="mb-6 text-gray-300 whitespace-pre-line break-words">
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
            >
              {part.content}
            </a>
          );
        }
        return part.content;
      })}
    </p>
  );
};

export default function LessonPanel({ nodes, edges, output }: LessonPanelProps) {
  const { active, courseId, lessonIndex, stepIndex, nextStep, previousStep, resetLesson, exitLesson, completeLessonProgress } = useLesson();
  const { supabaseUser } = useUserAccountContext();
  const [stepComplete, setStepComplete] = useState(false);

  const currentCourse = courseId ? courses[courseId] : undefined;
  const currentLesson: Lesson | undefined = currentCourse?.lessons[lessonIndex];
  const currentStep: LessonStep | undefined = currentLesson?.steps[stepIndex];

  useEffect(() => {
    if (!currentStep) {
      setStepComplete(false);
      return;
    }
    const completed = currentStep.checkComplete(nodes, edges, output);
    setStepComplete(completed);
  }, [nodes, edges, currentStep, output]);

  if (!active || !currentCourse || !currentLesson || !currentStep) {
    return (
      <div className="h-full w-full p-4 bg-[#1e1e1e] text-white overflow-y-auto">
        <p>No active Lesson or Lesson step found.</p>
      </div>
    );
  }

  const handleNext = async () => {
    if (!stepComplete) return;
    
    const isLastStepOfLesson = stepIndex === currentLesson!.steps.length - 1;
    const isLastLessonOfCourse = currentCourse && lessonIndex === currentCourse.lessons.length - 1;
    
    // If this is the last step of the lesson, update user progress
    if (isLastStepOfLesson && supabaseUser) {
      try {
        await completeLessonProgress(supabaseUser.id);
      } catch (error) {
        console.error('Error completing lesson progress:', error);
      }
    }
    
    nextStep();
    setStepComplete(false);
  };

  const handlePrevious = () => {
    previousStep();
    setStepComplete(false);
  };

  const isLastStepOfLesson = stepIndex === currentLesson.steps.length - 1;

  const isFirstStepOfLesson = stepIndex === 0;

  return (
    <div className="h-full w-full bg-[#1e1e1e] border-l border-gray-800 flex flex-col" style={{ minWidth: 300 }}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="break-words flex-1 min-w-0">
          <h2 className="text-lg font-bold break-words">{currentLesson.title}</h2>
          <p className="text-sm text-gray-400 break-words">{currentCourse.title}</p>
          <p className="text-sm text-gray-400">Course {courseId?.slice(-1)} - Lesson {lessonIndex + 1}</p>
        </div>
        <button 
          onClick={resetLesson} 
          className="text-xs text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
          title="Reset Lesson"
        >
          <Icons.FiRotateCcw />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto break-words">
        <h3 className="text-md font-semibold mb-2 break-words">
          Step {stepIndex + 1} / {currentLesson.steps.length}: {currentStep.title}
        </h3>
        <RenderedDescription description={currentStep.description} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={isFirstStepOfLesson}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              !isFirstStepOfLesson 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 cursor-not-allowed text-gray-500'
            }`}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!stepComplete}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              stepComplete 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 cursor-not-allowed text-gray-500'
            }`}
          >
            {isLastStepOfLesson ? 'Finish Lesson' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
} 