/**
 * Flashcard Generator & Summarizer
 * Uses Gemini 2.5 Flash to create study flashcards from lesson content
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  created: Date;
}

export interface FlashcardSet {
  topic: string;
  cards: Flashcard[];
  summary: string;
}

/**
 * Generate flashcards from lesson content
 */
export const generateFlashcards = async (
  content: string,
  topic: string,
  count: number = 5
): Promise<FlashcardSet | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert educator. Create exactly ${count} flashcards from the following content.
Each flashcard should have a clear question on the front and a concise answer on the back.
Include a mix of difficulty levels (easy, medium, hard).

Content:
${content}

Respond ONLY with valid JSON in this format:
{
  "cards": [
    {
      "front": "question",
      "back": "answer",
      "difficulty": "easy|medium|hard"
    }
  ],
  "summary": "brief summary of key concepts"
}

Do not include markdown formatting or code blocks. Output raw JSON only.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from Gemini");
      }
    }

    const flashcardSet: FlashcardSet = {
      topic,
      summary: parsedResponse.summary || "Study this content thoroughly",
      cards: (parsedResponse.cards || []).map((card: any, index: number) => ({
        id: `card_${Date.now()}_${index}`,
        front: card.front,
        back: card.back,
        topic,
        difficulty: card.difficulty || "medium",
        created: new Date(),
      })),
    };

    console.log(`✓ Generated ${flashcardSet.cards.length} flashcards for ${topic}`);
    return flashcardSet;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return null;
  }
};

/**
 * Summarize lesson content into key points
 */
export const summarizeContent = async (
  content: string,
  topic: string
): Promise<string | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Summarize the following educational content about "${topic}" into 5-7 key bullet points.
Make each point concise and memorable for students.

Content:
${content}

Respond with only the bullet points, starting each with "• ".`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log(`✓ Summarized content for ${topic}`);
    return summary;
  } catch (error) {
    console.error("Error summarizing content:", error);
    return null;
  }
};

/**
 * Create flashcards from image text (OCR output)
 */
export const generateFlashcardsFromOCR = async (
  extractedText: string,
  topic: string,
  count: number = 5
): Promise<FlashcardSet | null> => {
  try {
    // Use summarization first to clean up OCR text
    const cleanedContent = await summarizeContent(extractedText, topic);
    
    if (!cleanedContent) {
      return null;
    }

    // Generate flashcards from cleaned content
    return generateFlashcards(cleanedContent, topic, count);
  } catch (error) {
    console.error("Error generating flashcards from OCR:", error);
    return null;
  }
};

/**
 * Generate study guide from flashcards
 */
export const generateStudyGuide = async (
  flashcards: Flashcard[],
  topic: string
): Promise<string | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const cardsList = flashcards
      .map((card) => `Q: ${card.front}\nA: ${card.back}`)
      .join("\n\n");

    const prompt = `Create a comprehensive study guide for "${topic}" based on these flashcards:

${cardsList}

Format the guide with:
1. Key Concepts (intro paragraph)
2. Main Topics (detailed explanations)
3. Common Mistakes to Avoid
4. Practice Tips

Keep it concise and student-friendly.`;

    const result = await model.generateContent(prompt);
    const guide = result.response.text();

    console.log(`✓ Generated study guide for ${topic}`);
    return guide;
  } catch (error) {
    console.error("Error generating study guide:", error);
    return null;
  }
};
