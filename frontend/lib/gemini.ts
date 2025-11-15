import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// This is the correct, safe way to read the Next.js key from .env.local
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in .env.local. Please check your frontend/.env.local file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Using 2.5-flash for speed and availability
});

// --- Step 1: Tutor Function ---

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * For Step 1: Takes a user's query and returns a streaming lesson from the AI tutor.
 * (Using your new BEGINNER-FRIENDLY prompt)
 */
export const runTutorChat = async (userQuery: string) => {
  const prompt = `You are an expert tutor for students preparing for competitive exams like JEE, NEET, UPSC, and GATE. A student has asked for help with the topic: "${userQuery}".

Your goal is to explain this complex topic as simply as possible, as if you are teaching a complete beginner. 
1.  Start your response with: "Of course. Here is a beginner-friendly explanation of ${userQuery}."
2.  Use easy-to-understand examples and simple analogies (like explaining electrical resistance by comparing it to water flowing through a narrow pipe) to break down the core concepts.
3.  Ensure the explanation is accurate and provides a solid foundation for someone who will study this topic in more detail for an exam.
4.  Do not include any formatting like markdown, bolding, or lists. Just provide a single, plain text explanation.

Here is the student's question: ${userQuery}`;

  try {
    const response = await model.generateContentStream(prompt);
    return response.stream;
  } catch (error) {
    console.error("Error running tutor chat:", error);
    throw error;
  }
};


// --- OCR/IMAGE FUNCTION ---

/**
 * Helper to convert a File object to a base64 string for the API.
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * For Step 1 (Advanced): Takes a user's query AND an image file for OCR/analysis with streaming.
 */
export const runTutorChatWithImage = async (
  userQuery: string,
  imageFile: File
) => {
  // Convert file to base64
  const base64Data = await fileToGenerativePart(imageFile);

  try {
    const prompt = `You are an expert tutor for students preparing for competitive exams like JEE, NEET, UPSC, and GATE. A student has uploaded an image (e.g., a math problem, a diagram, a page of text) and asked a question about it.

Your goal is to:
1.  Analyze the image (perform OCR if it's text, understand the diagram/problem).
2.  Answer the student's question about it with a clear, beginner-friendly explanation using simple analogies.
3.  Ensure the explanation is accurate and provides a solid foundation.
4.  Do not include any formatting like markdown, bolding, or lists. Just provide a single, plain text explanation.

Here is the student's question: "${userQuery}"`;

    const response = await model.generateContentStream([prompt, base64Data]);
    return response.stream;
  } catch (error) {
    console.error("Error running tutor chat with image:", error);
    throw error;
  }
};