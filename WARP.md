# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Studywise is a **hybrid-AI adaptive learning hub** for high-stakes exam prep (JEE/NEET/UPSC/GATE). It combines:

- A **Next.js (App Router) frontend** in `frontend/` with TailwindCSS + Shadcn UI and Firebase-based auth/user state.
- A planned **FastAPI backend** in `backend/` (Python 3.10) that will integrate Supabase/Postgres and RAG via LangChain and sentence-transformers.
- A local **Ollama** model server, orchestrated via `docker-compose.yml`, intended for low-latency on-device model inference.

The root `README.md` describes the product vision and high-level architecture; the main runnable code at present is the Next.js app in `frontend/` plus the Docker wiring for backend + Ollama.

---

## Key Commands

### Full stack via Docker

Use Docker when you want to run the full system (frontend + backend + local model server):

```bash
path=null start=null
docker-compose up --build
```

- Builds `backend/` (Python 3.10 + FastAPI) and `frontend/` (Next.js) using their `Dockerfile`s.
- Starts services:
  - `backend` on `http://localhost:8000` (runs `uvicorn main:app --reload`).
  - `frontend` on `http://localhost:3000` (runs `npm run dev`).
  - `ollama` on `http://localhost:11434`.

Common variations:

```bash
path=null start=null
# Run in background
docker-compose up -d --build

# Stop and remove containers
docker-compose down

# Rebuild only a specific service
docker-compose build backend
```

The backend service expects an `.env` file at the repo root (see `docker-compose.yml: env_file: ./.env`). Do not invent env var names; infer them from any existing `.env*` files or backend code if/when it appears.

### Frontend (Next.js app in `frontend/`)

Use `pnpm` if possible; `frontend/README.md` and `pnpm-lock.yaml` assume it.

From the repo root:

```bash
path=null start=null
cd frontend

# Install deps (preferred)
pnpm install
# or
npm install
# or
yarn install
```

Run the development server:

```bash
path=null start=null
cd frontend
pnpm run dev
# or
npm run dev
# or
yarn dev
```

Build and run a production build locally:

```bash
path=null start=null
cd frontend
pnpm run build
pnpm run start
```

Lint the frontend codebase:

```bash
path=null start=null
cd frontend
pnpm run lint
# or
npm run lint
```

### Backend (FastAPI, planned

The Docker image for `backend/` is configured to run:

```bash
path=null start=null
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

For local (non-Docker) development, once Python source files exist under `backend/`:

```bash
path=null start=null
cd backend
python -m venv .venv
. .venv/bin/activate  # adjust for Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

As of the current snapshot, there are no committed `.py` files in `backend/`; if you generate backend code, keep it compatible with the existing `Dockerfile` and `requirements.txt`.

### Tests

- No test scripts (e.g. `test`, `jest`, `pytest`) are defined in any `package.json`, and there are no `*.test.*` files checked in.
- Until tests exist, do **not** assume a test runner; if you add one, also add the appropriate script(s) to `frontend/package.json` and update this file.

---

## High-Level Architecture & Code Structure

### Top-level layout

- `frontend/` – Next.js App Router app, TailwindCSS v4, Shadcn-style UI components, Firebase + Gemini integration.
- `backend/` – Dockerized Python 3.10 FastAPI service (currently only `Dockerfile` + `requirements.txt` are present; actual app code is expected to expose `main:app`).
- `docker-compose.yml` – Orchestrates `backend`, `frontend`, and `ollama` services.
- `README.md` – Product pitch and technical overview; prefer it as the source of truth for the high-level "three pillars" concept and the hybrid AI model.

### Frontend architecture (Next.js App Router)

The frontend is where nearly all of the current functionality lives.

#### Routing and feature surfaces

Located under `frontend/app/`:

- `/` (`app/page.tsx`) – Marketing/landing page with a multi-section layout (hero, social proof, bento grid, docs, pricing, FAQ, CTA). It imports feature sections from `components/*-section.tsx`.
- `/login` (`app/login/page.tsx`) – Auth entry; wraps `components/login-card.tsx` in a layout visually consistent with the landing page header.
- `/signup` (`app/signup/page.tsx`) – Registration entry; wraps `components/signup-card.tsx` similarly.
- `/product` (`app/product/page.tsx`) – Main dashboard layout:
  - Uses `components/product/header.tsx` and `components/product/sidebar.tsx` to create the shell.
  - Shows "Up next" (`components/product/upnext-card.tsx`) and recommended content along with streak/achievement widgets.
- `/product/study` (`app/product/study/page.tsx`) – **Study workspace**:
  - Left side: tabbed view for different content types (Original, AI Notes/Summary/Flashcards/Quizzes). Currently placeholders.
  - Right side: **AI tutor chat** (`components/product/study/ai-tutor-chat.tsx`), which is the main integration point with the Gemini API and global state.
- `/product/test` (`app/product/test/page.tsx`) – **Testing/flashcards** experience:
  - Left side: card-based Q/A UI (flip to reveal answer, navigate through `currentCard` index, etc.).
  - Right side: static AI tutor explanation card for now.
- `/product/analytics` (`app/product/analytics/page.tsx`) – **Analytics dashboard**:
  - Uses dynamic import for `components/product/analytics/AnalyticsCharts.tsx` (client-only charts).
  - Renders KPI cards and metric summaries over a background hero image.

This gives you three key product experiences that correspond to the README pillars:

- **Dashboard / product pages** under `/product`.
- **Tutor** under `/product/study` via Gemini.
- **Doubt solving/testing** under `/product/test` and potential image-based queries in the tutor.

#### State & data flow

The important global state is centered around `frontend/lib/store.ts` (Zustand) and `frontend/lib/firebase.ts`:

- `firebase.ts`
  - Initializes Firebase app, `auth`, `GoogleAuthProvider`, and Firestore `db` using `NEXT_PUBLIC_FIREBASE_*` env vars.
  - Exposes `initializeUserInFirestore(user: User)` which:
    - Creates a `users/{uid}` document with profile info, credits, and basic stats on first login.
    - Updates `lastLogin` and `photoURL` on subsequent logins.
- `store.ts` (Zustand `useAppStore`):
  - `user: User | null` – current Firebase user.
  - `credits: number` – derived from Firestore `users/{uid}` document.
  - `loading: boolean` – app-wide auth loading flag.
  - `currentLessonText: string | null` – **critical link between the tutor and downstream experiences**, used for the "Teach → Test" loop.
  - Actions:
    - `setLessonText(text)` – called when AI tutor finishes streaming a lesson.
    - `signIn()` – runs `signInWithPopup` using Google provider, then ensures Firestore doc initialization.
    - `signOut()` – signs out via Firebase and resets store.
    - `setUser()` – updates the user and subscribes to Firestore changes for credits.
- `components/AuthInitializer.tsx`:
  - Client component mounted at the app root (include it near `app/layout.tsx` or in a top-level layout).
  - Subscribes to `onAuthStateChanged(auth, ...)`, calls `initializeUserInFirestore` on login, and pushes the Firebase user into `useAppStore`.

**AI Tutor → Test coupling**

- `components/product/study/ai-tutor-chat.tsx`:
  - Uses `runTutorChat` and `runTutorChatWithImage` from `lib/gemini.ts` to stream Gemini responses.
  - On each request, it:
    - Adds a user message (optionally with image preview) to local `messages` state.
    - Streams the model response into the last `model` message (`for await (const chunk of stream)`), aggregating into `fullResponse`.
    - Calls `setLessonText(fullResponse)` in the global store once streaming completes.
  - If `currentLessonText` is set, a **"Go to Quiz"** button becomes visible and navigates to `/product/test`, making that route aware that there is lesson content available.

When implementing new flows that depend on the tutor’s explanation (e.g., automatic quiz generation), prefer to:

- Extend the `useAppStore` shape with additional fields derived from `currentLessonText` (e.g., parsed question sets), rather than passing large strings via props.
- Keep the tutor → test connection via the store, not via URL params.

#### AI integrations (frontend)

Defined in `frontend/lib/gemini.ts`:

- Uses `@google/generative-ai` with `NEXT_PUBLIC_GEMINI_API_KEY` (must be present; the module throws at import time if missing).
- Configures `model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })` with a moderate generation config and standard safety settings.
- Exposes:
  - `runTutorChat(userQuery: string)` → returns a **stream** (`generateContentStream`) for text-only tutoring.
  - `fileToGenerativePart(file: File)` → converts an uploaded image to the `inlineData` format used by Gemini.
  - `runTutorChatWithImage(userQuery: string, imageFile: File)` → returns a **stream** that combines text prompt + image.

When using these helpers:

- Avoid importing `lib/gemini.ts` in server components or anywhere that executes during build without env vars; the missing key will throw.
- Prefer streaming patterns (`generateContentStream`) so UI remains responsive.

#### UI & styling

- Fonts configured in `app/layout.tsx` using `next/font` (Inter and Instrument Serif) plus additional `<link>` tags for Google Fonts.
- TailwindCSS v4 and `tailwind-merge`/`clsx` helper via `lib/utils.ts` (`cn(...)`).
- Design system-like primitives in `components/ui/` (`button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `tabs.tsx`, `textarea.tsx`).
- Higher-level marketing/product components in `components/` and `components/product/` (e.g., `AnalyticsCharts`, `dashboard-preview`, `hero-section`).

When creating new UI, keep:

- Routes under `app/` with small, layout-focused components.
- Reusable elements under `components/` or `components/product/*` and reuse the existing primitives.

### Backend architecture (planned)

The backend is only partially present in this snapshot, but its intent is clear from `backend/requirements.txt`, `backend/Dockerfile`, and `docker-compose.yml`:

- `backend/requirements.txt` includes:
  - `fastapi`, `uvicorn[standard]` – API framework and ASGI server.
  - `supabase-py` – integration with Supabase/Postgres for auth, todos, and user state.
  - `langchain`, `langchain-community`, `langchain-huggingface`, `sentence-transformers`, `pypdf` – RAG pipeline over exam PDFs.
  - `google-generativeai` – server-side calls to Gemini or other Google models.
  - `python-dotenv` – loading env vars locally.
- `backend/Dockerfile`:
  - Builds from `python:3.10-slim`, installs requirements, copies the backend code, and exposes `8000`.
  - Entrypoint is `uvicorn main:app ...`, so the expected shape is a `main.py` file with `app = FastAPI(...)`.
- `docker-compose.yml`:
  - `backend` service mounts `./backend:/app` and depends on `ollama`.
  - There is no database service; Supabase is expected to be external.

If you add or edit backend endpoints:

- Keep the entrypoint at `main:app` unless you also update `Dockerfile` and `docker-compose.yml`.
- Reuse the libraries already pinned in `requirements.txt` rather than introducing near-duplicates.
- Consider the frontend routes: `/product/study` and `/product/test` are the most likely clients of new backend APIs (e.g., storing study sessions, generating quizzes from `currentLessonText`, or logging analytics).

### Local model server (Ollama)

The `ollama` service in `docker-compose.yml` is configured as:

- Image: `ollama/ollama`.
- Ports: `11434:11434`.
- Volumes:
  - Named volume `ollama_data` → `/root/.ollama` for model cache.
  - `./ollama_models:/app/models` – a local folder for GGUF models (such as `phi-3-mini-tutor.gguf`).

The README describes a **hybrid model** approach:

- Local `phi-3-mini`-based tutor via Ollama.
- Cloud Phi-3-vision or Llava for advanced multimodal reasoning.

When implementing backend logic, prefer:

- Using Ollama for low-latency, inexpensive operations (e.g., quick tutoring, flashcards) where latency is critical.
- Deferring heavy multimodal reasoning or advanced explanations to cloud models via `google-generativeai` or other configured APIs.

---

## Environment & Configuration Notes

### Frontend `.env.local`

The frontend relies on the following patterns (names inferred from `firebase.ts` and `gemini.ts`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GEMINI_API_KEY`

These must be present for the Firebase client and Gemini tutor to work. `lib/gemini.ts` throws an error immediately if `NEXT_PUBLIC_GEMINI_API_KEY` is missing, so be cautious when importing this module in any environment where env vars might not be set.

### Backend `.env`

`docker-compose.yml` references a root-level `.env` file for the backend:

```yaml
path=null start=null
backend:
  env_file:
    - ./.env
```

Typical values (not present in the repo, so do not fabricate) would include:

- Supabase URL and service key.
- Model endpoints/keys for Gemini, Ollama, and any embedding model.

When adding backend code, read from `os.environ` or `python-dotenv` rather than hardcoding secrets.

---

## How to Work Productively in This Repo (for Future Warp Agents)

- Treat `frontend/` as the main implementation surface; the product flows, AI integrations, and UI patterns are defined there.
- For features that span tutor → quiz → analytics:
  - Use `useAppStore` for cross-route state like `currentLessonText` and derived quiz data.
  - Add new product routes under `app/product/*` and compose them with `Header` + `Sidebar` from `components/product/`.
- If you need backend behavior that is currently missing (storing sessions, generating quizzes server-side, RAG over exam PDFs):
  - Implement it under `backend/` as FastAPI routes, keeping `main:app` as the entrypoint.
  - Wire any new API paths into the frontend via `fetch`/`axios`/`Next.js` data fetching in client components (the existing app heavily favors client-side React for now).
- Keep Docker configs in sync: if you change ports or entrypoints for services, update both `Dockerfile` and `docker-compose.yml`, and adjust any hardcoded URLs in the frontend if they appear.
