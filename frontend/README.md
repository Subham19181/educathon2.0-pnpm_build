# StudyWise – AI Tutor & Adaptive Learning Platform

This project implements **StudyWise**, an AI-powered learning platform with an end-to-end loop:

> **Teach → Test → Track → Continue**

Built for hackathons and demos, it combines Gemini 2.5 Flash, Firebase (Firestore), and a polished Next.js UI.

---

## 1. Core Learning Loop

### Teach – AI Tutor
- Streaming AI tutor chat (Gemini 2.5 Flash).
- Supports **text + image** questions (OCR & math-aware vision via `lib/ai/ocr.ts`).
- Saves each lesson into global state (`currentLessonText` in `lib/store.ts`) so other features (quizzes, notes, flashcards, analytics) can use the same context.

### Test – Auto-Generated Quizzes
- `lib/quiz_gemini.ts` generates **5-question MCQ quizzes** from the lesson text.
- Quiz UI (`app/product/test/page.tsx`):
  - Progress bar, previous/next navigation.
  - Result screen with score, percentage, and status messages.
- Fallback quizzes powered by **mock topics** (`lib/mock_data.ts`) so every topic card is always quizzable.

### Track – Student Analytics
- Quiz attempts are saved via `api.quiz.save` → `saveQuizAttempt` in `lib/db/service.ts`:
  - Stored in `students/{userId}/quizzes`.
  - Each attempt includes topic, score, percentage, and detailed question-level answers.
- Aggregated stats maintained in `students/{userId}/stats/summary`:
  - `totalQuizzesTaken`, `averageScore`, `topicsMastered`, `topicBreakdown`, etc.
- Analytics dashboard (`app/product/analytics/page.tsx`):
  - Cards for **Quizzes Completed, Average Score, Study Streak, Topics Mastered**.
  - Topic mastery panel driven by real `topicBreakdown`.
  - Recent quizzes list built from the last few attempts.
  - Student-focused charts (`components/product/analytics/AnalyticsCharts.tsx`).

### Continue – Resume Learning
- `UpNextCard` (`components/product/upnext-card.tsx`) shows **“Continue where you left off”**
  based on the last lesson text and topic.

---

## 2. Database & API Architecture

### Firestore Schema

Collections under `students/{userId}`:

- `students/{userId}` – profile / summary
- `students/{userId}/quizzes` – individual quiz attempts
- `students/{userId}/lessons` – lesson progress
- `students/{userId}/stats/summary` – aggregated statistics
- `students/{userId}/courses` – custom learning paths

### Types (`lib/db/types.ts`)

Key interfaces:

- `StudentProfile`
- `QuizAttempt` and `QuestionRecord`
- `LessonProgress`
- `TopicMastery` and `StudentStats`
- `Course` and `CourseModule`

### Service Layer (`lib/db/service.ts`)

- Profile: `getStudentProfile`, `upsertStudentProfile`.
- Quizzes: `saveQuizAttempt`, `getStudentQuizzes`, `getQuizzesByTopic`.
- Lessons: `saveLessonProgress`, `getLessonProgress`, `getLastLesson`.
- Stats: `getStudentStats` + `updateStudentStats` (called after every quiz save).
- Courses: `saveCourse`, `getCourses`.

### MCP-Style API Router (`lib/api/router.ts`)

A single `api` object used across the app:

```ts
api.profile.get(userId)
api.profile.upsert(data)

api.quiz.save(attempt)
api.quiz.getAll(userId)
api.quiz.getByTopic(userId, topic)

api.lesson.save(progress)
api.lesson.getAll(userId)
api.lesson.getLast(userId)

api.stats.get(userId)

api.course.save(course)
api.course.getAll(userId)
```

This keeps components thin, testable, and decoupled from Firestore details.

---

## 3. AI Feature Hub

### AI Modules (`lib/ai/*`)

- `flashcard.ts`
  - Generate flashcards from lesson content.
  - Summarize content into bullet points.
  - Build study guides from flashcards.
- `ocr.ts`
  - OCR for images and handwriting.
  - Math-aware analysis of equations in images.
- `doubt_solver.ts`
  - Detailed doubt solving and explanations.
  - Step-by-step problem solutions.
  - Hints at different levels, concept comparison, quick clarifications.
- `course.ts`
  - AI course outline generator (modules + topics) from a goal and level.

### Unified AI Router (`lib/ai/index.ts`)

Exposes a single `AI` object:

- `AI.flashcards.generate/summarize/generateFromOCR/generateStudyGuide`
- `AI.ocr.extractFromImage/extractFromURL/extractHandwriting/analyzeMath`
- `AI.doubt.solve/solveProblem/explainConcept/getHints/compareConceptsDoubt/quickClarify`
- `AI.course.outline(goal, level)`

All AI calls use **Gemini 2.5 Flash** under the hood.

---

## 4. Study Experience (Teach + AI Workspace)

File: `app/product/study/page.tsx`

- Two-column layout:
  - **Right:** `AiTutorChat` – streaming AI tutor with image upload.
  - **Left:** Study workspace with tabs:
    - **Original** – raw lesson text from `currentLessonText`.
    - **AI Notes** – bullet-point notes from the lesson.
    - **AI Summary** – condensed textual summary.
    - **AI Flashcards** – 5 flashcards (Q/A, difficulty, topic).
- The left panel updates automatically whenever a new lesson is generated.

This makes the experience feel like a full course viewer, not just a chat box.

---

## 5. Dashboard & Learning Paths

File: `app/product/page.tsx`

- **Continue Learning**
  - Shows the last lesson and lets the student jump back in quickly.
- **Your Courses**
  - Lists saved courses from `students/{uid}/courses`.
  - Click to open the Study page for that course topic.
- **Popular Study Topics**
  - Backed by `MOCK_TOPICS` (`lib/mock_data.ts`).
  - Each card preloads a high-quality mock lesson and routes to Study, so the app always feels rich.

### Course Builder (`app/product/courses/new/page.tsx`)

- Collects:
  - Learning goal
  - Level (beginner / intermediate / advanced)
  - Approximate hours
- Uses `AI.course.outline` to generate modules and topics.
- Saves the course via `api.course.save` to Firestore.

This closely mirrors the "custom learning pathway" pitch of production AI tutor products.

---

## 6. Mock Content for Demo Mode

### `lib/mock_data.ts`

Four ready-to-use topics:

1. **Physics: Kinematics – Motion in 1D**
2. **Chemistry: Thermodynamics – Enthalpy & Spontaneity**
3. **Biology: Cell Division – Mitosis basics**
4. **Mathematics: Integration – Indefinite integrals**

Each topic includes:

- A multi-paragraph lesson with bullet points.
- A 3-question MCQ quiz.

These power:

- Dashboard "Popular Study Topics" cards (preloaded lesson + quiz).
- Test page fallback quizzes when no lesson text exists.

---

## 7. Auth, Demo Mode & Analytics Behavior

- **Demo mode** (`lib/mock_auth.ts`):
  - Mock user (`demo-user-12345`) for running the app without real Firebase Auth.
- **Store user** (`lib/store.ts`):
  - All quiz saves and analytics reads use `useAppStore().user`, so they work both in demo mode and with real Google sign-in once enabled.
- Analytics no longer shows noisy errors when stats are simply missing; it gracefully shows zeros and "Take your first quiz" instead.

---

## 8. Running & Deploying

### Requirements

- Node.js 18+
- pnpm / npm / yarn

### Local development

```bash
pnpm install   # or npm install / yarn install
pnpm run dev   # or npm run dev / yarn dev
```

The app runs at `http://localhost:3000`.

### Build & production

```bash
pnpm run build
pnpm run start
```

### Environment variables

Create a `.env.local` with at least:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

For hackathon/demo use, you can keep `DEMO_MODE = true` in `lib/mock_auth.ts` to bypass real auth while still exercising the UI and AI flows.

---

This README summarizes the current architecture and features of StudyWise and should be a solid anchor for judges, collaborators, and future development.
