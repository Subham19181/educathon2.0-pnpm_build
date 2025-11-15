/**
 * Doubt Solver & Question Answering
 * Helps students clarify concepts and solve doubts using AI
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface DoubtResponse {
  answer: string;
  explanation: string;
  keyPoints: string[];
  relatedConcepts: string[];
  resources?: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  followUpQuestions: string[];
}

export interface ProblemSolution {
  problem: string;
  solution: string;
  steps: string[];
  explanation: string;
  commonMistakes: string[];
  similarProblems: string[];
}

/**
 * Solve a student's doubt/question
 */
export const solveDoubt = async (
  doubt: string,
  topic: string,
  context?: string
): Promise<DoubtResponse | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextPrompt = context
      ? `Context from lesson: ${context}\n\n`
      : "";

    const prompt = `You are an expert tutor helping a student understand "${topic}".
${contextPrompt}
Student's Question/Doubt:
${doubt}

Provide a comprehensive but concise explanation. Structure your response as JSON:
{
  "answer": "direct answer to the question",
  "explanation": "detailed explanation suitable for a student",
  "keyPoints": ["point1", "point2", "point3"],
  "relatedConcepts": ["concept1", "concept2"],
  "difficulty": "beginner|intermediate|advanced",
  "followUpQuestions": ["potential follow-up question 1", "potential follow-up question 2"]
}

Be encouraging and make complex concepts simple. Use analogies when helpful.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from doubt solver");
      }
    }

    const doubtResponse: DoubtResponse = {
      answer: parsedResponse.answer || "",
      explanation: parsedResponse.explanation || "",
      keyPoints: parsedResponse.keyPoints || [],
      relatedConcepts: parsedResponse.relatedConcepts || [],
      difficulty: parsedResponse.difficulty || "intermediate",
      followUpQuestions: parsedResponse.followUpQuestions || [],
    };

    console.log(`✓ Doubt Solved: ${topic}`);
    return doubtResponse;
  } catch (error) {
    console.error("Error solving doubt:", error);
    return null;
  }
};

/**
 * Solve a math/science problem step by step
 */
export const solveProblem = async (
  problem: string,
  topic: string
): Promise<ProblemSolution | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Solve this ${topic} problem step by step.

Problem:
${problem}

Provide the solution in JSON format:
{
  "problem": "restate the problem clearly",
  "solution": "final answer",
  "steps": ["step1", "step2", "step3"],
  "explanation": "why this solution is correct",
  "commonMistakes": ["common mistake 1", "common mistake 2"],
  "similarProblems": ["similar problem type 1", "similar problem type 2"]
}

Make sure each step is clear and educational.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    }

    const solution: ProblemSolution = {
      problem: parsedResponse.problem || problem,
      solution: parsedResponse.solution || "",
      steps: parsedResponse.steps || [],
      explanation: parsedResponse.explanation || "",
      commonMistakes: parsedResponse.commonMistakes || [],
      similarProblems: parsedResponse.similarProblems || [],
    };

    console.log(`✓ Problem Solved: ${topic}`);
    return solution;
  } catch (error) {
    console.error("Error solving problem:", error);
    return null;
  }
};

/**
 * Explain a concept in simple terms
 */
export const explainConcept = async (
  concept: string,
  topic: string,
  level: "beginner" | "intermediate" | "advanced" = "intermediate"
): Promise<string | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const levelDescription = {
      beginner: "a complete beginner with no prior knowledge",
      intermediate: "a student with basic understanding",
      advanced: "an advanced student who wants deep understanding",
    };

    const prompt = `Explain the concept of "${concept}" from "${topic}" to ${levelDescription[level]}.

Use:
- Simple language and relatable examples
- Analogies to everyday situations
- Visual descriptions when applicable
- Step-by-step breakdown

Make it engaging and memorable.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    console.log(`✓ Concept Explained: ${concept} (${level})`);
    return explanation;
  } catch (error) {
    console.error("Error explaining concept:", error);
    return null;
  }
};

/**
 * Get hints for problem-solving without giving away the answer
 */
export const getHints = async (
  problem: string,
  topic: string,
  hintLevel: number = 1 // 1-3, where 3 is closest to solution
): Promise<string[] | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const hintDescription =
      hintLevel === 1
        ? "general hints to get started"
        : hintLevel === 2
          ? "more specific hints pointing toward solution"
          : "nearly complete hints just before the solution";

    const prompt = `For this ${topic} problem, provide ${hintDescription}:

Problem:
${problem}

Give 2-3 hints that guide the student toward solving it themselves without revealing the answer.
Format as a JSON array of strings:
["hint1", "hint2", "hint3"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let hints;
    try {
      hints = JSON.parse(responseText);
    } catch {
      const arrayMatch = responseText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        hints = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    }

    console.log(`✓ Hints Generated: ${topic} (level ${hintLevel})`);
    return Array.isArray(hints) ? hints : [hints];
  } catch (error) {
    console.error("Error getting hints:", error);
    return null;
  }
};

/**
 * Compare two concepts and highlight differences
 */
export const compareConceptsDoubt = async (
  concept1: string,
  concept2: string,
  topic: string
): Promise<{
  similarities: string[];
  differences: string[];
  whenToUse: { [key: string]: string };
} | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `In ${topic}, compare and contrast these two concepts:
- ${concept1}
- ${concept2}

Respond in JSON format:
{
  "similarities": ["similarity1", "similarity2"],
  "differences": ["difference1", "difference2"],
  "whenToUse": {
    "${concept1}": "when to use this",
    "${concept2}": "when to use this"
  }
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    }

    console.log(`✓ Concepts Compared: ${concept1} vs ${concept2}`);
    return parsedResponse;
  } catch (error) {
    console.error("Error comparing concepts:", error);
    return null;
  }
};

/**
 * Get quick conceptual clarification
 */
export const quickClarify = async (
  confusion: string,
  topic: string
): Promise<string | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `A student is confused about this in ${topic}:
"${confusion}"

Provide a very brief (1-2 sentences max) clarification that directly addresses the confusion.
Be clear and concise.`;

    const result = await model.generateContent(prompt);
    const clarification = result.response.text();

    console.log(`✓ Quick Clarification: ${topic}`);
    return clarification;
  } catch (error) {
    console.error("Error providing clarification:", error);
    return null;
  }
};
