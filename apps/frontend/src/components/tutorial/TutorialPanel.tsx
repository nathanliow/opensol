import { Panel } from '@xyflow/react';
import { useEffect, useMemo } from 'react';
import { useNodes } from '@xyflow/react';
import { useTutorial } from '@/contexts/TutorialContext';
import { tutorialUnits } from '@/tutorials';

export default function TutorialPanel() {
  const { active, unitId, stepIndex, nextStep, exitTutorial } = useTutorial();
  const nodes = useNodes();

  // Retrieve current step meta
  const { step, isLastStep } = useMemo(() => {
    if (!unitId) return { step: null, isLastStep: false } as any;
    const unit = tutorialUnits[unitId];
    const step = unit.steps[stepIndex];
    return { step, isLastStep: stepIndex === unit.steps.length - 1 };
  }, [unitId, stepIndex]);

  // Auto-check completion when nodes change
  useEffect(() => {
    if (!step || !active) return;
    if (step.isComplete(nodes)) {
      // Automatically advance after small delay
      const timeout = setTimeout(() => {
        nextStep();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [nodes, step, active, nextStep]);

  if (!active || !step) return null;

  return (
    <Panel position="top-right" className="pt-[10px] pr-2 z-50">
      <div className="w-[30vw] max-w-md bg-[#1E1E1E] rounded-lg shadow-lg h-[calc(100vh-60px)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
          <h3 className="text-white font-medium text-sm">Tutorial</h3>
          <button
            onClick={exitTutorial}
            className="text-gray-400 hover:text-white text-xs"
            title="Exit tutorial"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-300 space-y-4">
          <h4 className="text-white text-base font-semibold">{step.title}</h4>
          <p>{step.description}</p>
          <div className="mt-4">
            {!isLastStep && (
              <p className="text-xs text-gray-500">Complete the action on the canvas to continue…</p>
            )}
            {isLastStep && (
              <button
                onClick={exitTutorial}
                className="mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium"
              >
                Finish Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
} 