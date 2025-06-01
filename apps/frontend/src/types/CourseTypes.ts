import { CourseId } from "@/courses";
import { FlowNode } from "../../../backend/src/packages/compiler/src/types";
import { FlowEdge } from "../../../backend/src/packages/compiler/src/types";

export interface Course {
  id: CourseId;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
  startNodes?: FlowNode[];
  startEdges?: FlowEdge[];
  xp: number; // XP points for completing the lesson
} 

export interface LessonStep {
  id: string;
  title: string;
  description: string;
  // Called with current flow graph; returns true when step accomplished
  checkComplete: (nodes: FlowNode[], edges: FlowEdge[], output?: string) => boolean;
}

export interface LessonProgress {
  courseId: CourseId;
  lessonIndex: number;
  stepIndex: number;
}
