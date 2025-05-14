"use client";

import { useState, useEffect } from 'react';
import { tutorialUnits } from '@/tutorials';
import { TutorialUnit, TutorialStep } from '../types';

interface TutorialPanelProps {
  unitId: string;
  nodes: any[];
  edges: any[];
}

export default function TutorialPanel({ unitId, nodes, edges }: TutorialPanelProps) {
  const unit: TutorialUnit | undefined = (tutorialUnits as any)[unitId];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);

  const currentStep: TutorialStep | undefined = unit?.steps[currentStepIndex];

  useEffect(() => {
    if (!currentStep) return;

    // Support either legacy isComplete or new checkComplete naming
    const completed = (currentStep as any).checkComplete
      ? (currentStep as any).checkComplete({ nodes, edges })
      : ((currentStep as any).isComplete.length >= 2
          ? (currentStep as any).isComplete(nodes, edges)
          : (currentStep as any).isComplete(nodes));
    setStepComplete(completed);
  }, [nodes, edges, currentStep]);

  if (!unit || !currentStep) {
    return (
      <div className="h-full w-full p-4 bg-[#1e1e1e] text-white overflow-y-auto">
        <p>Invalid tutorial.</p>
      </div>
    );
  }

  const handleNext = () => {
    if (!stepComplete) return;
    if (currentStepIndex < unit.steps.length - 1) {
      setCurrentStepIndex((idx) => idx + 1);
      setStepComplete(false);
    } else {
      // Tutorial finished – could add callback or UI here
    }
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] border-l border-gray-800 flex flex-col" style={{ minWidth: 300 }}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">{unit.title}</h2>
        <p className="text-sm text-gray-400">{unit.chapter}</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-md font-semibold mb-2">
          Step {currentStepIndex + 1} / {unit.steps.length}: {currentStep.title}
        </h3>
        <p className="mb-6 text-gray-300 whitespace-pre-line">{currentStep.description}</p>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleNext}
          disabled={!stepComplete}
          className={`w-full py-2 rounded-md font-medium transition-colors ${stepComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'}`}
        >
          {currentStepIndex < unit.steps.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
} 