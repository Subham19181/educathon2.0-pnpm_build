import {
  GoogleGenerativeAI,
  GenerationConfig,
} from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * Step 2: Generate quiz JSON from lesson text
 * CRITICAL: Must return ONLY valid JSON
 */
export const generateQuizFromLesson = async (lessonText: string): Promise<string> => {
  const prompt = `You are an expert test maker. Based ONLY on the following text, create a 5-question multiple-choice quiz. Each question must have 3 options (A, B, C). 

RESPOND WITH ONLY A VALID JSON OBJECT. DO NOT add any markdown, explanations, or extra text before or after the JSON.

The JSON format MUST be exactly:
{
  "quiz": [
    {
      "question": "What is...",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3"],
      "answer": "B. Option 2"
    }
  ]
}

LESSON TEXT:
${lessonText}`;

  try {
    console.log("[Step 2] Generating quiz from lesson...");
    const response = await model.generateContent(prompt);
    let jsonText = response.response.text();
    console.log("[Step 2] Raw Gemini response:", jsonText.substring(0, 200) + "...");
    
    // Strip markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Validate it's valid JSON before returning
    try {
      JSON.parse(jsonText);
      console.log("[Step 2] ✅ Valid JSON generated");
      return jsonText;
    } catch (parseError) {
      console.error("[Step 2] ❌ Invalid JSON from Gemini:", jsonText);
      throw new Error(`Gemini returned invalid JSON: ${jsonText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error("[Step 2] Error generating quiz:", error);
    throw error;
  }
};
