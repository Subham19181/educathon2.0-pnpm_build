/**
 * OCR (Optical Character Recognition)
 * Extracts text from images using Gemini's vision capabilities
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface OCRResult {
  text: string;
  topic?: string;
  confidence: number;
  language: string;
  extractedElements: {
    headings: string[];
    paragraphs: string[];
    equations: string[];
    lists: string[];
  };
}

/**
 * Extract text from image file
 */
export const extractTextFromImage = async (
  file: File
): Promise<OCRResult | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const mimeType = file.type || "image/jpeg";

    const prompt = `Extract all text from this image. Organize it by:
1. Headings (if any)
2. Paragraphs (main text)
3. Mathematical equations (if any)
4. Lists or bullet points (if any)

Also try to identify the primary topic/subject of the image.

Respond in JSON format:
{
  "text": "full extracted text",
  "topic": "detected topic or subject",
  "extractedElements": {
    "headings": ["heading1", "heading2"],
    "paragraphs": ["para1", "para2"],
    "equations": ["equation1"],
    "lists": ["item1", "item2"]
  },
  "language": "detected language",
  "confidence": 0.95
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

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
        throw new Error("Invalid JSON response from OCR");
      }
    }

    const ocrResult: OCRResult = {
      text: parsedResponse.text || "",
      topic: parsedResponse.topic,
      confidence: parsedResponse.confidence || 0.85,
      language: parsedResponse.language || "en",
      extractedElements: parsedResponse.extractedElements || {
        headings: [],
        paragraphs: [],
        equations: [],
        lists: [],
      },
    };

    console.log(`✓ OCR: Extracted text from image (${ocrResult.language})`);
    return ocrResult;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    return null;
  }
};

/**
 * Extract text from image URL
 */
export const extractTextFromImageURL = async (
  imageURL: string
): Promise<OCRResult | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Extract all text from this image. Organize it by:
1. Headings (if any)
2. Paragraphs (main text)
3. Mathematical equations (if any)
4. Lists or bullet points (if any)

Also try to identify the primary topic/subject of the image.

Respond in JSON format:
{
  "text": "full extracted text",
  "topic": "detected topic or subject",
  "extractedElements": {
    "headings": ["heading1", "heading2"],
    "paragraphs": ["para1", "para2"],
    "equations": ["equation1"],
    "lists": ["item1", "item2"]
  },
  "language": "detected language",
  "confidence": 0.95
}`;

    const result = await model.generateContent([
      {
        url: imageURL,
      },
      prompt,
    ]);

    const responseText = result.response.text();

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from OCR");
      }
    }

    const ocrResult: OCRResult = {
      text: parsedResponse.text || "",
      topic: parsedResponse.topic,
      confidence: parsedResponse.confidence || 0.85,
      language: parsedResponse.language || "en",
      extractedElements: parsedResponse.extractedElements || {
        headings: [],
        paragraphs: [],
        equations: [],
        lists: [],
      },
    };

    console.log(`✓ OCR: Extracted text from URL image`);
    return ocrResult;
  } catch (error) {
    console.error("Error extracting text from image URL:", error);
    return null;
  }
};

/**
 * Extract handwritten text from image
 */
export const extractHandwrittenText = async (
  file: File
): Promise<OCRResult | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const prompt = `This image contains handwritten text. Extract ALL handwritten text carefully.
Pay special attention to:
- Mathematical notations and formulas
- Sketches or diagrams with labels
- Underlined or emphasized text
- Numbered lists or steps

Respond in JSON format:
{
  "text": "all extracted handwritten text",
  "topic": "subject matter",
  "extractedElements": {
    "headings": [],
    "paragraphs": [],
    "equations": [],
    "lists": []
  },
  "handwritingQuality": "good|fair|poor",
  "confidence": 0.9
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

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

    const ocrResult: OCRResult = {
      text: parsedResponse.text || "",
      topic: parsedResponse.topic,
      confidence: parsedResponse.confidence || 0.75,
      language: "en",
      extractedElements: parsedResponse.extractedElements || {
        headings: [],
        paragraphs: [],
        equations: [],
        lists: [],
      },
    };

    console.log(`✓ Handwriting OCR: Extracted text (confidence: ${ocrResult.confidence})`);
    return ocrResult;
  } catch (error) {
    console.error("Error extracting handwritten text:", error);
    return null;
  }
};

/**
 * Analyze mathematical content in image
 */
export const analyzeMathematicalImage = async (
  file: File
): Promise<{ equations: string[]; explanations: string[]; solutions?: string } | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const prompt = `Analyze the mathematical content in this image.
Extract all equations, formulas, and mathematical expressions.
Provide step-by-step solutions if applicable.

Respond in JSON format:
{
  "equations": ["equation1", "equation2"],
  "explanations": ["explanation1", "explanation2"],
  "solutions": "step-by-step solution if applicable",
  "topic": "mathematical topic",
  "difficulty": "beginner|intermediate|advanced"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

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

    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing mathematical image:", error);
    return null;
  }
};
