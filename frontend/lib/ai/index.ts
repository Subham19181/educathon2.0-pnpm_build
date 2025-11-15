/**
 * StudyWise AI Hub
 * Central router for all AI-powered features
 */

// Export all AI modules
export * from './flashcard';
export * from './ocr';
export * from './doubt_solver';
export * from './course';

// Re-export commonly used types
export type { Flashcard, FlashcardSet } from './flashcard';
export type { OCRResult } from './ocr';
export type { DoubtResponse, ProblemSolution } from './doubt_solver';

// Convenience object for accessing all AI features
export const AI = {
  // Flashcard features
  flashcards: {
    generate: async (content: string, topic: string, count?: number) => {
      const { generateFlashcards } = await import('./flashcard');
      return generateFlashcards(content, topic, count);
    },
    summarize: async (content: string, topic: string) => {
      const { summarizeContent } = await import('./flashcard');
      return summarizeContent(content, topic);
    },
    generateFromOCR: async (text: string, topic: string, count?: number) => {
      const { generateFlashcardsFromOCR } = await import('./flashcard');
      return generateFlashcardsFromOCR(text, topic, count);
    },
    generateStudyGuide: async (flashcards: any[], topic: string) => {
      const { generateStudyGuide } = await import('./flashcard');
      return generateStudyGuide(flashcards, topic);
    },
  },

  // OCR features
  ocr: {
    extractFromImage: async (file: File) => {
      const { extractTextFromImage } = await import('./ocr');
      return extractTextFromImage(file);
    },
    extractFromURL: async (imageURL: string) => {
      const { extractTextFromImageURL } = await import('./ocr');
      return extractTextFromImageURL(imageURL);
    },
    extractHandwriting: async (file: File) => {
      const { extractHandwrittenText } = await import('./ocr');
      return extractHandwrittenText(file);
    },
    analyzeMath: async (file: File) => {
      const { analyzeMathematicalImage } = await import('./ocr');
      return analyzeMathematicalImage(file);
    },
  },

  // Course builder
  course: {
    outline: async (goal: string, level: 'beginner' | 'intermediate' | 'advanced') => {
      const { generateCourseOutline } = await import('./course');
      return generateCourseOutline(goal, level);
    },
  },

  // Doubt solving features
  doubt: {
    solve: async (doubt: string, topic: string, context?: string) => {
      const { solveDoubt } = await import('./doubt_solver');
      return solveDoubt(doubt, topic, context);
    },
    solveProblem: async (problem: string, topic: string) => {
      const { solveProblem } = await import('./doubt_solver');
      return solveProblem(problem, topic);
    },
    explainConcept: async (
      concept: string,
      topic: string,
      level?: 'beginner' | 'intermediate' | 'advanced'
    ) => {
      const { explainConcept } = await import('./doubt_solver');
      return explainConcept(concept, topic, level);
    },
    getHints: async (problem: string, topic: string, level?: number) => {
      const { getHints } = await import('./doubt_solver');
      return getHints(problem, topic, level);
    },
    compareConceptsDoubt: async (
      concept1: string,
      concept2: string,
      topic: string
    ) => {
      const { compareConceptsDoubt } = await import('./doubt_solver');
      return compareConceptsDoubt(concept1, concept2, topic);
    },
    quickClarify: async (confusion: string, topic: string) => {
      const { quickClarify } = await import('./doubt_solver');
      return quickClarify(confusion, topic);
    },
  },
};
