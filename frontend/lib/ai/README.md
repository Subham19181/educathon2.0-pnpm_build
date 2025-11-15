# StudyWise AI Features

Comprehensive AI-powered learning tools built with Gemini 2.5 Flash.

## Architecture

```
lib/ai/
├── flashcard.ts       - Flashcard generation & content summarization
├── ocr.ts            - Optical Character Recognition & image text extraction
├── doubt_solver.ts   - Question answering & concept clarification
└── index.ts          - Unified AI router
```

## Features Overview

### 1. Flashcard Generator & Summarizer
Convert lessons into study flashcards and key points.

#### Functions
- `generateFlashcards(content, topic, count)` - Create study flashcards with difficulty levels
- `summarizeContent(content, topic)` - Create 5-7 key bullet points
- `generateFlashcardsFromOCR(text, topic, count)` - Generate flashcards from OCR text
- `generateStudyGuide(flashcards, topic)` - Create comprehensive study guide

#### Usage
```typescript
import { AI } from '@/lib/ai';

// Generate 5 flashcards from lesson content
const flashcardSet = await AI.flashcards.generate(
  lessonContent,
  "Photosynthesis",
  5
);

// Get key points
const summary = await AI.flashcards.summarize(
  lessonContent,
  "Photosynthesis"
);

// Create study guide
const guide = await AI.flashcards.generateStudyGuide(
  flashcardSet.cards,
  "Photosynthesis"
);
```

### 2. OCR (Optical Character Recognition)
Extract text from images, including handwriting and mathematical equations.

#### Functions
- `extractTextFromImage(file)` - Extract text from uploaded image file
- `extractTextFromImageURL(url)` - Extract text from image URL
- `extractHandwrittenText(file)` - Specialized extraction for handwritten notes
- `analyzeMathematicalImage(file)` - Extract and solve mathematical content

#### Usage
```typescript
import { AI } from '@/lib/ai';

// Extract text from uploaded image
const imageFile = document.getElementById('imageInput').files[0];
const ocrResult = await AI.ocr.extractFromImage(imageFile);
console.log(ocrResult.text);
console.log(ocrResult.topic);

// Extract handwritten notes
const handwritingResult = await AI.ocr.extractHandwriting(notebookImage);

// Analyze math problems in image
const mathAnalysis = await AI.ocr.analyzeMath(mathProblemImage);
```

### 3. Doubt Solver & Question Answering
Help students understand concepts, solve problems, and clarify confusion.

#### Functions
- `solveDoubt(doubt, topic, context)` - Answer student questions with detailed explanations
- `solveProblem(problem, topic)` - Solve step-by-step with common mistakes
- `explainConcept(concept, topic, level)` - Explain at different difficulty levels
- `getHints(problem, topic, level)` - Provide guiding hints without revealing answer
- `compareConceptsDoubt(concept1, concept2, topic)` - Compare related concepts
- `quickClarify(confusion, topic)` - Quick 1-2 sentence clarification

#### Usage
```typescript
import { AI } from '@/lib/ai';

// Answer student doubt
const response = await AI.doubt.solve(
  "Why does photosynthesis need sunlight?",
  "Biology"
);

// Solve problem step by step
const solution = await AI.doubt.solveProblem(
  "Find the derivative of x^3 + 2x",
  "Calculus"
);

// Explain concept at beginner level
const explanation = await AI.doubt.explainConcept(
  "Derivatives",
  "Calculus",
  "beginner"
);

// Get hints (level 1 = basic, 2 = specific, 3 = near solution)
const hints = await AI.doubt.getHints(
  "Solve 2x + 5 = 13",
  "Algebra",
  1
);

// Compare concepts
const comparison = await AI.doubt.compareConceptsDoubt(
  "Mitosis",
  "Meiosis",
  "Biology"
);

// Quick clarification
const clarification = await AI.doubt.quickClarify(
  "I'm confused about when to use which formula",
  "Physics"
);
```

## Response Types

### DoubtResponse
```typescript
{
  answer: string                    // Direct answer
  explanation: string              // Detailed explanation
  keyPoints: string[]             // Key takeaways
  relatedConcepts: string[]       // Related topics
  difficulty: string              // beginner|intermediate|advanced
  followUpQuestions: string[]      // Suggested next questions
}
```

### ProblemSolution
```typescript
{
  problem: string                 // Restated problem
  solution: string               // Final answer
  steps: string[]               // Step-by-step solution
  explanation: string           // Why this is correct
  commonMistakes: string[]      // Common errors to avoid
  similarProblems: string[]     // Similar problem types
}
```

### OCRResult
```typescript
{
  text: string                  // Full extracted text
  topic?: string               // Detected subject
  confidence: number            // Confidence score (0-1)
  language: string             // Detected language
  extractedElements: {
    headings: string[]
    paragraphs: string[]
    equations: string[]
    lists: string[]
  }
}
```

### FlashcardSet
```typescript
{
  topic: string
  cards: Flashcard[]
  summary: string
}
```

## Integration Examples

### Example 1: Upload Image → OCR → Generate Flashcards
```typescript
// User uploads handwritten notes
const imageFile = await getUserImage();

// Extract text using OCR
const ocrResult = await AI.ocr.extractHandwriting(imageFile);

// Generate flashcards from extracted text
if (ocrResult) {
  const flashcards = await AI.flashcards.generateFromOCR(
    ocrResult.text,
    ocrResult.topic || "General",
    5
  );
}
```

### Example 2: Student Doubt Handler
```typescript
async function handleStudentDoubt(userQuestion: string, topic: string) {
  // Get detailed response
  const response = await AI.doubt.solve(userQuestion, topic);
  
  // Display answer
  console.log("Answer:", response.answer);
  console.log("Key Points:", response.keyPoints);
  
  // Suggest related learning
  console.log("Related Concepts:", response.relatedConcepts);
  
  // Prepare follow-up questions
  console.log("Want to know more about:", response.followUpQuestions);
}
```

### Example 3: Complete Lesson Processing Pipeline
```typescript
async function processLessonContent(content: string, topic: string) {
  // 1. Summarize
  const summary = await AI.flashcards.summarize(content, topic);
  
  // 2. Generate flashcards
  const flashcards = await AI.flashcards.generate(content, topic, 7);
  
  // 3. Create study guide
  const guide = await AI.flashcards.generateStudyGuide(
    flashcards.cards,
    topic
  );
  
  return { summary, flashcards, guide };
}
```

## Best Practices

1. **Error Handling**: Always check for null responses
```typescript
const result = await AI.flashcards.generate(content, topic);
if (result) {
  // Process result
}
```

2. **Performance**: Use loading states while AI processes
```typescript
setLoading(true);
const result = await AI.doubt.solve(question, topic);
setLoading(false);
```

3. **Context for Better Answers**: Provide lesson context when asking doubts
```typescript
const response = await AI.doubt.solve(
  "Why is this step needed?",
  "Chemistry",
  lessonContent  // Include lesson context
);
```

4. **Progressive Hints**: Use hint levels to guide learning
```typescript
// First attempt - basic hints
const hints1 = await AI.doubt.getHints(problem, topic, 1);

// If still stuck - more specific hints
const hints2 = await AI.doubt.getHints(problem, topic, 2);

// Last resort - nearly complete hints
const hints3 = await AI.doubt.getHints(problem, topic, 3);
```

5. **OCR Confidence**: Check confidence scores for important extractions
```typescript
const ocr = await AI.ocr.extractFromImage(file);
if (ocr.confidence < 0.7) {
  console.warn("Low confidence extraction, manual review recommended");
}
```

## Model Information

All AI features use **Gemini 2.5 Flash** for:
- Fast processing (ideal for real-time student interaction)
- Strong mathematical reasoning
- Vision capabilities (OCR, image analysis)
- Structured JSON responses

## Rate Limiting

Consider implementing rate limiting for production:
- Flashcard generation: ~2 per minute per user
- OCR: ~5 per minute per user
- Doubt solving: ~10 per minute per user

## Future Enhancements

- [ ] Multi-language support
- [ ] Fine-tuned models per subject
- [ ] Caching common questions/doubts
- [ ] Batch processing for multiple images
- [ ] Custom difficulty calibration
- [ ] Student performance-based explanations
- [ ] Integration with student data for personalized hints
