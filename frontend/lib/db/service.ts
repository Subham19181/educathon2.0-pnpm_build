/**
 * Database Service Layer
 * Handles all Firestore operations for student data
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  StudentProfile,
  QuizAttempt,
  LessonProgress,
  StudentStats,
  TopicMastery,
  Course,
  APIResponse
} from './types';

/**
 * Get or create student profile
 */
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  try {
    const userRef = doc(db, 'students', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as StudentProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return null;
  }
};

/**
 * Create or update student profile
 */
export const upsertStudentProfile = async (profile: Partial<StudentProfile>): Promise<StudentProfile | null> => {
  try {
    const userId = profile.userId;
    if (!userId) throw new Error('userId is required');

    const userRef = doc(db, 'students', userId);
    const userDoc = await getDoc(userRef);

    const dataToSave = {
      ...profile,
      lastLogin: serverTimestamp(),
      // Preserve existing data if updating
      ...(userDoc.exists() && {
        createdAt: userDoc.data().createdAt,
        streak: userDoc.data().streak || 0,
        totalQuizzesTaken: userDoc.data().totalQuizzesTaken || 0,
        averageScore: userDoc.data().averageScore || 0,
      }),
      // For new profiles
      ...(!userDoc.exists() && {
        createdAt: serverTimestamp(),
        streak: 0,
        totalQuizzesTaken: 0,
        averageScore: 0,
        preferredSubjects: [],
      })
    };

    await setDoc(userRef, dataToSave, { merge: true });
    return dataToSave as StudentProfile;
  } catch (error) {
    console.error('Error upserting student profile:', error);
    return null;
  }
};

/**
 * Save quiz attempt
 */
export const saveQuizAttempt = async (attempt: Omit<QuizAttempt, 'id'>): Promise<QuizAttempt | null> => {
  try {
    const { userId, topic, score, total, percentage } = attempt;
    
    const quizRef = collection(db, 'students', userId, 'quizzes');
    const docRef = await addDoc(quizRef, {
      ...attempt,
      timestamp: serverTimestamp(),
    });

    // Update student stats
    await updateStudentStats(userId, { topic, percentage });

    return {
      ...attempt,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return null;
  }
};

/**
 * Get all quiz attempts for a student
 */
export const getStudentQuizzes = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const quizzesRef = collection(db, 'students', userId, 'quizzes');
    const querySnapshot = await getDocs(quizzesRef);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as QuizAttempt));
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    return [];
  }
};

/**
 * Get quizzes by topic
 */
export const getQuizzesByTopic = async (userId: string, topic: string): Promise<QuizAttempt[]> => {
  try {
    const quizzesRef = collection(db, 'students', userId, 'quizzes');
    const q = query(quizzesRef, where('topic', '==', topic));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as QuizAttempt));
  } catch (error) {
    console.error('Error fetching quizzes by topic:', error);
    return [];
  }
};

/**
 * Save lesson progress
 */
export const saveLessonProgress = async (progress: Omit<LessonProgress, 'id'>): Promise<LessonProgress | null> => {
  try {
    const { userId, topic } = progress;

    const lessonsRef = collection(db, 'students', userId, 'lessons');
    
    // Check if lesson already exists
    const q = query(lessonsRef, where('topic', '==', topic));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      // Update existing lesson
      const docRef = querySnapshot.docs[0];
      await updateDoc(docRef.ref, {
        ...progress,
        lastAccessed: serverTimestamp(),
      });
      return { ...progress, id: docRef.id } as LessonProgress;
    } else {
      // Create new lesson
      const docRef = await addDoc(lessonsRef, {
        ...progress,
        lastAccessed: serverTimestamp(),
      });
      return { ...progress, id: docRef.id } as LessonProgress;
    }
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    return null;
  }
};

/**
 * Get student statistics
 */
export const getStudentStats = async (userId: string): Promise<StudentStats | null> => {
  try {
    const statsRef = doc(db, 'students', userId, 'stats', 'summary');
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      return statsDoc.data() as StudentStats;
    }

    // Calculate stats if document doesn't exist
    const quizzes = await getStudentQuizzes(userId);
    if (quizzes.length === 0) {
      return null;
    }

    const averageScore = Math.round(
      quizzes.reduce((sum, q) => sum + q.percentage, 0) / quizzes.length
    );

    // Group by topic
    const topicMap = new Map<string, QuizAttempt[]>();
    quizzes.forEach((q) => {
      if (!topicMap.has(q.topic)) {
        topicMap.set(q.topic, []);
      }
      topicMap.get(q.topic)!.push(q);
    });

    const topicBreakdown: TopicMastery[] = Array.from(topicMap.entries()).map(
      ([topic, attempts]) => ({
        topic,
        quizzesTaken: attempts.length,
        averageScore: Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        ),
        lastAttempted: attempts[attempts.length - 1].timestamp,
        mastered: true // Will update to average >= 80
      })
    );

    const stats: StudentStats = {
      userId,
      totalQuizzesTaken: quizzes.length,
      averageScore,
      streak: 0,
      topicsMastered: topicBreakdown.filter((t) => t.averageScore >= 80).length,
      totalTimeSpent: 0,
      lastActivityDate: quizzes[quizzes.length - 1].timestamp,
      topicBreakdown,
    };

    // Save calculated stats
    await setDoc(statsRef, stats);
    return stats;
  } catch (error) {
    console.error('Error getting student stats:', error);
    return null;
  }
};

/**
 * Update student stats (called after each quiz)
 */
const updateStudentStats = async (
  userId: string,
  quizData: { topic: string; percentage: number }
): Promise<void> => {
  try {
    const stats = await getStudentStats(userId);
    
    if (!stats) {
      // First quiz, create initial stats
      const newStats: StudentStats = {
        userId,
        totalQuizzesTaken: 1,
        averageScore: quizData.percentage,
        streak: 1,
        topicsMastered: quizData.percentage >= 80 ? 1 : 0,
        totalTimeSpent: 0,
        lastActivityDate: serverTimestamp(),
        topicBreakdown: [
          {
            topic: quizData.topic,
            quizzesTaken: 1,
            averageScore: quizData.percentage,
            lastAttempted: serverTimestamp(),
            mastered: quizData.percentage >= 80,
          }
        ]
      };
      const statsRef = doc(db, 'students', userId, 'stats', 'summary');
      await setDoc(statsRef, newStats);
      return;
    }

    // Update existing stats
    const updatedStats: StudentStats = {
      ...stats,
      totalQuizzesTaken: stats.totalQuizzesTaken + 1,
      averageScore: Math.round(
        (stats.averageScore * stats.totalQuizzesTaken + quizData.percentage) /
          (stats.totalQuizzesTaken + 1)
      ),
      lastActivityDate: serverTimestamp(),
    };

    // Update topic breakdown
    const topicIndex = updatedStats.topicBreakdown.findIndex(
      (t) => t.topic === quizData.topic
    );

    if (topicIndex >= 0) {
      const existingTopic = updatedStats.topicBreakdown[topicIndex];
      existingTopic.quizzesTaken += 1;
      existingTopic.averageScore = Math.round(
        (existingTopic.averageScore * (existingTopic.quizzesTaken - 1) +
          quizData.percentage) /
          existingTopic.quizzesTaken
      );
      existingTopic.lastAttempted = serverTimestamp();
      existingTopic.mastered = existingTopic.averageScore >= 80;
    } else {
      updatedStats.topicBreakdown.push({
        topic: quizData.topic,
        quizzesTaken: 1,
        averageScore: quizData.percentage,
        lastAttempted: serverTimestamp(),
        mastered: quizData.percentage >= 80,
      });
    }

    updatedStats.topicsMastered = updatedStats.topicBreakdown.filter(
      (t) => t.mastered
    ).length;

    const statsRef = doc(db, 'students', userId, 'stats', 'summary');
    await setDoc(statsRef, updatedStats);
  } catch (error) {
    console.error('Error updating student stats:', error);
  }
};

/**
 * Get lesson progress for a student
 */
export const getLessonProgress = async (userId: string): Promise<LessonProgress[]> => {
  try {
    const lessonsRef = collection(db, 'students', userId, 'lessons');
    const querySnapshot = await getDocs(lessonsRef);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as LessonProgress));
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return [];
  }
};

/**
 * Get last lesson for "continue where you left off"
 */
export const getLastLesson = async (userId: string): Promise<LessonProgress | null> => {
  try {
    const lessons = await getLessonProgress(userId);
    if (lessons.length === 0) return null;

    // Sort by lastAccessed and return most recent
    lessons.sort((a, b) => {
      const timeA = a.lastAccessed?.toMillis?.() || 0;
      const timeB = b.lastAccessed?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return lessons[0];
  } catch (error) {
    console.error('Error getting last lesson:', error);
    return null;
  }
};

/**
 * Courses (learning paths)
 */
export const saveCourse = async (course: Omit<Course, 'id' | 'createdAt'>): Promise<Course | null> => {
  try {
    const coursesRef = collection(db, 'students', course.userId, 'courses');
    const docRef = await addDoc(coursesRef, {
      ...course,
      createdAt: serverTimestamp(),
    });
    return { ...course, id: docRef.id } as Course;
  } catch (error) {
    console.error('Error saving course:', error);
    return null;
  }
};

export const getCourses = async (userId: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, 'students', userId, 'courses');
    const snapshot = await getDocs(coursesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Course));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};
