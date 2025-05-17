import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tutorialUnits, TutorialUnitId } from '@/tutorials';

interface TutorialContextShape {
  active: boolean;
  unitId: TutorialUnitId | null;
  stepIndex: number;
  startTutorial: (unitId: TutorialUnitId) => void;
  nextStep: () => void;
  exitTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextShape>({
  active: false,
  unitId: null,
  stepIndex: 0,
  startTutorial: () => {},
  nextStep: () => {},
  exitTutorial: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [unitId, setUnitId] = useState<TutorialUnitId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Initial load from localStorage (user came from dashboard)
  useEffect(() => {
    const stored = localStorage.getItem('tutorialUnit');
    if (stored && stored in tutorialUnits) {
      setUnitId(stored as TutorialUnitId);
    }
  }, []);

  const startTutorial = (id: TutorialUnitId) => {
    localStorage.setItem('tutorialUnit', id);
    setUnitId(id);
    setStepIndex(0);
  };

  const nextStep = () => {
    if (!unitId) return;
    const unit = tutorialUnits[unitId];
    if (stepIndex < unit.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Finished unit
      exitTutorial();
    }
  };

  const exitTutorial = () => {
    setUnitId(null);
    setStepIndex(0);
    localStorage.removeItem('tutorialUnit');
  };

  return (
    <TutorialContext.Provider
      value={{
        active: !!unitId,
        unitId,
        stepIndex,
        startTutorial,
        nextStep,
        exitTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
} 