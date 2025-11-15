/**
 * Course (Learning Path) Generator
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CourseModule } from "@/lib/db/types";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export const generateCourseOutline = async (
  goal: string,
  level: "beginner" | "intermediate" | "advanced"
): Promise<CourseModule[] | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert curriculum designer.
Create a short, focused learning path as JSON for the goal: "${goal}".
Level: ${level}.

Output JSON ONLY in this format:
{
  "modules": [
    {
      "title": "...",
      "description": "...",
      "topics": ["topic 1", "topic 2", "topic 3"]
    }
  ]
}

Keep it practical and exam-focused. 3–5 modules max.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid JSON from course generator");
      parsed = JSON.parse(match[0]);
    }

    if (!parsed.modules || !Array.isArray(parsed.modules)) return null;

    const modules: CourseModule[] = parsed.modules.map((m: any) => ({
      title: m.title || "Module",
      description: m.description || "",
      topics: Array.isArray(m.topics) ? m.topics : [],
    }));

    return modules;
  } catch (err) {
    console.error("Error generating course outline", err);
    return null;
  }
};
