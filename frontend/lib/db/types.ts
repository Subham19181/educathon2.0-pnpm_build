/**
 * Database Schema Types
 * Defines all data structures for StudyWise
 */

export interface StudentProfile {
  userId: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLogin: any;
  streak: number; // Days of consecutive study
  totalQuizzesTaken: number;
  averageScore: number;
  preferredSubjects: string[];
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  timestamp: any;
  duration?: number; // in seconds
  questionsAnswered: QuestionRecord[];
}

export interface QuestionRecord {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface LessonProgress {
  id?: string;
  userId: string;
  topic: string;
  content: string;
  lastAccessed: any;
  completed: boolean;
  timeSpent: number; // in seconds
}

export interface TopicMastery {
  topic: string;
  quizzesTaken: number;
  averageScore: number;
  lastAttempted: any;
  mastered: boolean; // true if average score >= 80
}

export interface StudentStats {
  userId: string;
  totalQuizzesTaken: number;
  averageScore: number;
  streak: number;
  topicsMastered: number;
  totalTimeSpent: number; // in minutes
  lastActivityDate: any;
  topicBreakdown: TopicMastery[];
}

// Course / learning path
export interface CourseModule {
  title: string;
  description: string;
  topics: string[];
}

export interface Course {
  id?: string;
  userId: string;
  title: string;
  description: string;
  goal: string;
  level: "beginner" | "intermediate" | "advanced";
  estimatedDurationHours: number;
  modules: CourseModule[];
  createdAt: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
