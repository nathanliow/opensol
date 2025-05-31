import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { courses, CourseId } from '../courses';
import { LessonProgress } from '../types/CourseTypes';

interface LessonContextShape {
  active: boolean;
  courseId: CourseId | null;
  lessonIndex: number;
  stepIndex: number;
  startLesson: (courseId: CourseId, lessonId?: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetLesson: () => void;
  exitLesson: () => void;
}

const LessonContext = createContext<LessonContextShape>({
  active: false,
  courseId: null,
  lessonIndex: 0,
  stepIndex: 0,
  startLesson: () => {},
  nextStep: () => {},
  previousStep: () => {},
  resetLesson: () => {},
  exitLesson: () => {},
});

export const useLesson = () => useContext(LessonContext);

export function LessonProvider({ children }: { children: ReactNode }) {
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const storedProgress = localStorage.getItem('lessonProgress');
    if (storedProgress) {
      try {
        const progress: LessonProgress = JSON.parse(storedProgress);
        if (progress.courseId && progress.courseId in courses) {
          setCourseId(progress.courseId);
          const course = courses[progress.courseId];
          if (course && progress.lessonIndex >= 0 && progress.lessonIndex < course.lessons.length) {
            setLessonIndex(progress.lessonIndex);
            // Also restore stepIndex if it exists
            if (typeof progress.stepIndex === 'number' && progress.stepIndex >= 0) {
              const lesson = course.lessons[progress.lessonIndex];
              if (lesson && progress.stepIndex < lesson.steps.length) {
                setStepIndex(progress.stepIndex);
              } else {
                setStepIndex(0);
              }
            } else {
              setStepIndex(0);
            }
          } else {
            setLessonIndex(0);
            setStepIndex(0);
            localStorage.setItem('lessonProgress', JSON.stringify({ courseId: progress.courseId, lessonIndex: 0, stepIndex: 0 }));
          }
        } else {
          localStorage.removeItem('lessonProgress');
        }
      } catch (error) {
        console.error("Failed to parse lesson progress from localStorage", error);
        localStorage.removeItem('lessonProgress');
      }
    }
  }, []);

  const startLesson = (id: CourseId, lessonId?: string) => {    
    let targetLessonIndex = 0;
    
    // If lessonId is provided, find the corresponding lesson index
    if (lessonId && courses[id]) {
      const course = courses[id];
      const foundLessonIndex = course.lessons.findIndex(lesson => lesson.id === lessonId);
      if (foundLessonIndex !== -1) {
        targetLessonIndex = foundLessonIndex;
      }
    }
    
    const progress: LessonProgress = { courseId: id, lessonIndex: targetLessonIndex, stepIndex: 0 };
    localStorage.setItem('lessonProgress', JSON.stringify(progress));
    setCourseId(id);
    setLessonIndex(targetLessonIndex);
    setStepIndex(0);
  };

  const nextStep = () => {
    if (!courseId) return;
    const currentCourse = courses[courseId];
    if (!currentCourse) return;

    const currentLesson = currentCourse.lessons[lessonIndex];
    if (!currentLesson) return;

    if (stepIndex < currentLesson.steps.length - 1) {
      const newStepIndex = stepIndex + 1;
      setStepIndex(newStepIndex);      const progress: LessonProgress = { courseId: courseId, lessonIndex, stepIndex: newStepIndex };
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
    } else {
      if (lessonIndex < currentCourse.lessons.length - 1) {
        const newLessonIndex = lessonIndex + 1;
        setLessonIndex(newLessonIndex);
        setStepIndex(0);
        const progress: LessonProgress = { courseId: courseId, lessonIndex: newLessonIndex, stepIndex: 0 };
        localStorage.setItem('lessonProgress', JSON.stringify(progress));
      } else {
        console.log('Lesson completed, exiting');
        exitLesson();
      }
    }
  };

  const previousStep = () => {
    if (!courseId) return;
    const currentCourse = courses[courseId];
    if (!currentCourse) return;

    if (stepIndex > 0) {
      const newStepIndex = stepIndex - 1;
      setStepIndex(newStepIndex);
      const progress: LessonProgress = { courseId: courseId, lessonIndex, stepIndex: newStepIndex };
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
    }
  };

  const resetLesson = () => {
    setStepIndex(0);
    
    if (courseId) {
      const progress: LessonProgress = { courseId, lessonIndex, stepIndex: 0 };
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
    }
  };

  const exitLesson = () => {
    setCourseId(null);
    setLessonIndex(0);
    setStepIndex(0);
    localStorage.removeItem('lessonProgress');
  };

  return (
    <LessonContext.Provider
      value={{
        active: !!courseId,
        courseId,
        lessonIndex,
        stepIndex,
        startLesson,
        nextStep,
        previousStep,
        resetLesson,
        exitLesson,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
} 