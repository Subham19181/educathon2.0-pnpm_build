/**
 * API Router (MCP-Style)
 * Centralized API handler for all student data operations
 * Provides a single interface to access database operations
 */

import { APIResponse } from '@/lib/db/types';
import {
  getStudentProfile,
  upsertStudentProfile,
  saveQuizAttempt,
  getStudentQuizzes,
  getQuizzesByTopic,
  saveLessonProgress,
  getStudentStats,
  getLessonProgress,
  getLastLesson,
  saveCourse,
  getCourses,
} from '@/lib/db/service';
import type {
  StudentProfile,
  QuizAttempt,
  LessonProgress,
  StudentStats,
  Course,
} from '@/lib/db/types';

/**
 * API request handler with typed responses
 */
export type APIAction =
  | { type: 'profile.get'; userId: string }
  | { type: 'profile.upsert'; data: Partial<StudentProfile> }
  | { type: 'quiz.save'; data: Omit<QuizAttempt, 'id'> }
  | { type: 'quiz.getAll'; userId: string }
  | { type: 'quiz.getByTopic'; userId: string; topic: string }
  | { type: 'lesson.save'; data: Omit<LessonProgress, 'id'> }
  | { type: 'lesson.getAll'; userId: string }
  | { type: 'lesson.getLast'; userId: string }
  | { type: 'stats.get'; userId: string }
  | { type: 'course.save'; data: Omit<Course, 'id' | 'createdAt'> }
  | { type: 'course.getAll'; userId: string };

/**
 * Main API dispatcher
 * Routes requests to appropriate handlers
 */
export const apiHandler = async <T = any>(
  action: APIAction
): Promise<APIResponse<T>> => {
  try {
    switch (action.type) {
      // ==================== PROFILE OPERATIONS ====================
      case 'profile.get': {
        const profile = await getStudentProfile(action.userId);
        if (!profile) {
          return {
            success: false,
            error: 'Student profile not found',
          };
        }
        return {
          success: true,
          data: profile as T,
          message: 'Profile retrieved successfully',
        };
      }

      case 'profile.upsert': {
        const profile = await upsertStudentProfile(action.data);
        if (!profile) {
          return {
            success: false,
            error: 'Failed to update profile',
          };
        }
        return {
          success: true,
          data: profile as T,
          message: 'Profile updated successfully',
        };
      }

      // ==================== QUIZ OPERATIONS ====================
      case 'quiz.save': {
        const quiz = await saveQuizAttempt(action.data);
        if (!quiz) {
          return {
            success: false,
            error: 'Failed to save quiz attempt',
          };
        }
        return {
          success: true,
          data: quiz as T,
          message: 'Quiz saved successfully',
        };
      }

      case 'quiz.getAll': {
        const quizzes = await getStudentQuizzes(action.userId);
        return {
          success: true,
          data: quizzes as T,
          message: `Retrieved ${quizzes.length} quizzes`,
        };
      }

      case 'quiz.getByTopic': {
        const quizzes = await getQuizzesByTopic(action.userId, action.topic);
        return {
          success: true,
          data: quizzes as T,
          message: `Retrieved ${quizzes.length} quizzes for topic: ${action.topic}`,
        };
      }

      // ==================== LESSON OPERATIONS ====================
      case 'lesson.save': {
        const lesson = await saveLessonProgress(action.data);
        if (!lesson) {
          return {
            success: false,
            error: 'Failed to save lesson progress',
          };
        }
        return {
          success: true,
          data: lesson as T,
          message: 'Lesson progress saved successfully',
        };
      }

      case 'lesson.getAll': {
        const lessons = await getLessonProgress(action.userId);
        return {
          success: true,
          data: lessons as T,
          message: `Retrieved ${lessons.length} lessons`,
        };
      }

      case 'lesson.getLast': {
        const lesson = await getLastLesson(action.userId);
        if (!lesson) {
          return {
            success: false,
            error: 'No lessons found',
          };
        }
        return {
          success: true,
          data: lesson as T,
          message: 'Last lesson retrieved successfully',
        };
      }

      // ==================== STATS OPERATIONS ====================
      case 'stats.get': {
        const stats = await getStudentStats(action.userId);
        if (!stats) {
          return {
            success: false,
            error: 'No statistics found',
          };
        }
        return {
          success: true,
          data: stats as T,
          message: 'Student statistics retrieved successfully',
        };
      }

      // ==================== COURSE OPERATIONS ====================
      case 'course.save': {
        const course = await saveCourse(action.data);
        if (!course) {
          return {
            success: false,
            error: 'Failed to save course',
          };
        }
        return {
          success: true,
          data: course as T,
          message: 'Course saved successfully',
        };
      }

      case 'course.getAll': {
        const courses = await getCourses(action.userId);
        return {
          success: true,
          data: courses as T,
          message: `Retrieved ${courses.length} courses`,
        };
      }

      default:
        return {
          success: false,
          error: `Unknown action type: ${(action as any).type}`,
        };
    }
  } catch (error) {
    console.error('API Handler Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Convenience hooks for common operations
 */

/**
 * Get student profile
 */
export const api = {
  profile: {
    get: (userId: string) =>
      apiHandler<StudentProfile>({ type: 'profile.get', userId }),
    upsert: (data: Partial<StudentProfile>) =>
      apiHandler<StudentProfile>({ type: 'profile.upsert', data }),
  },

  quiz: {
    save: (data: Omit<QuizAttempt, 'id'>) =>
      apiHandler<QuizAttempt>({ type: 'quiz.save', data }),
    getAll: (userId: string) =>
      apiHandler<QuizAttempt[]>({ type: 'quiz.getAll', userId }),
    getByTopic: (userId: string, topic: string) =>
      apiHandler<QuizAttempt[]>({ type: 'quiz.getByTopic', userId, topic }),
  },

  lesson: {
    save: (data: Omit<LessonProgress, 'id'>) =>
      apiHandler<LessonProgress>({ type: 'lesson.save', data }),
    getAll: (userId: string) =>
      apiHandler<LessonProgress[]>({ type: 'lesson.getAll', userId }),
    getLast: (userId: string) =>
      apiHandler<LessonProgress>({ type: 'lesson.getLast', userId }),
  },

  stats: {
    get: (userId: string) =>
      apiHandler<StudentStats>({ type: 'stats.get', userId }),
  },

  course: {
    save: (data: Omit<Course, 'id' | 'createdAt'>) =>
      apiHandler<Course>({ type: 'course.save', data }),
    getAll: (userId: string) =>
      apiHandler<Course[]>({ type: 'course.getAll', userId }),
  },
};
