# Google Authentication Setup Guide

## Overview

The StudyWise frontend now includes full Google OAuth authentication with state management, protected routes, and automatic redirects based on authentication status.

## What's Been Implemented

### 1. **Auth Flow Components**

#### `components/AuthInitializer.tsx` (Already existed)
- Listens to Firebase auth state changes
- Initializes user in Firestore on first login
- Syncs auth state to global Zustand store
- Mounts at the app root level via `app/layout.tsx`

#### `components/landing-page-wrapper.tsx` (New)
- Wraps the landing page (`app/page.tsx`)
- Redirects authenticated users to `/product` dashboard
- Shows loading state while checking auth
- Prevents authenticated users from seeing the marketing page

#### `components/protected-route-wrapper.tsx` (New)
- Wraps all product routes (`/product`, `/product/study`, `/product/test`, `/product/analytics`)
- Redirects unauthenticated users to `/login`
- Shows loading state while checking auth
- Ensures only logged-in users can access product features

#### `middleware.ts` (New)
- Placeholder for future server-side auth checks
- Currently allows all requests to proceed (client-side handles auth)
- Can be extended later for token validation or session checks

### 2. **Updated Auth Components**

#### `components/login-card.tsx` (Updated)
- Google Sign-in button with loading state
- Calls `useAppStore.signIn()` which triggers Firebase Google OAuth popup
- Redirects to `/product` dashboard on successful login
- Shows error messages if sign-in fails

#### `components/signup-card.tsx` (Updated)
- "Sign up with Google" button (same as login, Google handles account creation)
- Uses the same auth flow as login
- Redirects to `/product` dashboard on successful signup
- Shows error messages for auth failures
- Maintains visual consistency with login page

#### `components/header.tsx` (Updated)
- **For unauthenticated users**: Shows "Log in" button linking to `/login`
- **For authenticated users**: 
  - Shows greeting: "Hi, [User's Name or Email]"
  - Shows "Sign out" button
  - Clicking avatar also triggers sign out

#### `components/product/header.tsx` (Updated)
- Shows user's initial (first letter of name/email) in avatar circle
- Avatar button click triggers sign out
- Tooltip shows user's email on hover
- Maintains existing UI (points, streak, notifications)

### 3. **Protected Routes**

All product routes now use `ProtectedRouteWrapper`:

- `/product` → `DashboardContent` wrapped with `ProtectedRouteWrapper`
- `/product/study` → `StudyPageContent` wrapped with `ProtectedRouteWrapper`
- `/product/test` → `TestPageContent` wrapped with `ProtectedRouteWrapper`
- `/product/analytics` → `AnalyticsPageContent` wrapped with `ProtectedRouteWrapper`

### 4. **Root Layout Updates**

`app/layout.tsx` now includes:

```typescript
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <AuthInitializer />
  {children}
</ThemeProvider>
```

- `AuthInitializer` sets up auth listeners on app load
- `ThemeProvider` enables theme management (already had `next-themes` installed)
- `suppressHydrationWarning` added to `<html>` tag to prevent hydration mismatches

## Environment Variables Required

Create a `frontend/.env.local` file with your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**Note:** All `NEXT_PUBLIC_*` variables are public (visible in client-side code). Do NOT put secrets here. These Firebase keys are safe to expose on the frontend; they only authenticate via Firebase's OAuth flow, not direct API calls.

## User Flow

### First Time User

1. Visits `https://localhost:3000` (landing page)
2. Sees marketing content + "Try Now!" and "Log in" buttons
3. Clicks either button → redirected to `/login`
4. Clicks "Sign in with Google" or "Sign up with Google"
5. Firebase OAuth popup opens → user authenticates with Google
6. On successful auth:
   - User document created in Firestore (`users/{uid}`)
   - User state synced to Zustand store via `AuthInitializer`
   - Redirects to `/product` dashboard
7. Can navigate to `/product/study` to access AI Tutor

### Returning User

1. Visits `https://localhost:3000`
2. Auth state loads from Firebase (stored in browser session/cookie)
3. `AuthInitializer` detects user and syncs to store
4. `LandingPageWrapper` detects authenticated user
5. Auto-redirects to `/product` dashboard
6. User can access all product features

### Sign Out Flow

1. User clicks avatar in header or "Sign out" button
2. `handleSignOut()` calls `useAppStore.signOut()`
3. Firebase signs out, Zustand store resets
4. Redirects to `/` (landing page)

## State Management (Zustand Store)

Located in `lib/store.ts`:

```typescript
useAppStore state:
- user: User | null → current Firebase user
- credits: number → derived from Firestore
- loading: boolean → auth check in progress
- currentLessonText: string | null → AI tutor output (for Teach → Test flow)

useAppStore actions:
- signIn() → trigger Firebase Google OAuth
- signOut() → sign out and reset state
- setUser(user) → set user + subscribe to Firestore for credits
- setLoading(bool) → update loading state
- setLessonText(text) → store tutor explanation for later quiz generation
```

## AI Tutor Integration

The AI tutor chat (`components/product/study/ai-tutor-chat.tsx`) now:

1. **Streams Gemini responses** using `runTutorChat()` from `lib/gemini.ts`
2. **Saves lesson text** to Zustand store via `setLessonText(fullResponse)` after streaming completes
3. **Enables "Go to Quiz" button** when `currentLessonText` is set
4. **Allows image uploads** via `runTutorChatWithImage()` for doubt solving
5. **Maintains chat history** in local React state for UI

The tutor is only accessible after authentication via the `/product/study` protected route.

## Current UI Behavior

### Before Login

- Landing page: shows product pitch, features, pricing, FAQ
- Headers show: "Log in" button in top-right
- Clicking product cards → redirects to `/login`
- Clicking "Try Now!" → redirects to `/signup`

### After Login

- Landing page: auto-redirects to `/product` (dashboard)
- All headers show: user greeting + "Sign out" button
- Can navigate to:
  - `/product` → dashboard with "Up next" and recommendations
  - `/product/study` → AI Tutor chat workspace
  - `/product/test` → quiz/flashcard practice
  - `/product/analytics` → performance insights

## Next Steps (Features Not Yet Implemented)

1. **Adaptive Dashboard**
   - Store user's study topics + last accessed item
   - "Pick up where you left off" card linking to the most recent chat
   - Todo list for study goals

2. **Automatic Quiz Generation**
   - Parse `currentLessonText` on `/product/test`
   - Generate quiz questions from the lesson automatically

3. **Performance Tracking**
   - Store quiz results in Firestore
   - Display performance snapshots on dashboard and analytics

4. **Ollama Integration**
   - Backend API for local model inference
   - Fallback for quick tutoring when Gemini is unavailable

5. **RAG over PDFs**
   - Backend ingestion of exam PDFs into vector database
   - Tutor uses RAG to cite exam materials

## Testing the Auth Flow Locally

### Prerequisites

1. Install dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

2. Set up Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing
   - Enable Google auth provider
   - Copy config values to `.env.local`

3. Enable Gemini API:
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Create an API key
   - Add to `.env.local` as `NEXT_PUBLIC_GEMINI_API_KEY`

### Run Locally

```bash
cd frontend
pnpm run dev
```

Then visit:
- `http://localhost:3000` → landing page (logs out if you're already authenticated)
- `http://localhost:3000/login` → login page
- `http://localhost:3000/signup` → signup page
- `http://localhost:3000/product` → dashboard (requires auth)

### Test Scenarios

1. **First time user**: 
   - Clear browser storage
   - Visit landing page → click "Try Now!" → Google auth popup
   - Should redirect to dashboard

2. **Returning user**: 
   - Refresh page → should stay on current page (auth loads from session)
   - Visit landing page → should auto-redirect to dashboard

3. **Sign out**: 
   - Click avatar in header → click "Sign out"
   - Should redirect to landing page
   - Click "Log in" → Google auth popup
   - Should be able to sign in as different user

4. **Tutor chat**: 
   - Visit `/product/study`
   - Ask a question → Gemini response streams in
   - See "Go to Quiz" button appear
   - Click it → redirects to `/product/test`

## Debugging Tips

1. **Auth state not syncing?**
   - Check browser console for Firebase errors
   - Verify `.env.local` has correct Firebase keys
   - Clear browser cache and session storage

2. **Redirects not working?**
   - Check that `AuthInitializer` is mounted in `app/layout.tsx`
   - Verify `useRouter` from `next/navigation` (not `next/router`)
   - Check browser console for navigation errors

3. **Gemini API errors?**
   - Verify `NEXT_PUBLIC_GEMINI_API_KEY` is set
   - Check that API key has Generative Language API enabled
   - Test with Google AI Studio first

4. **Protected routes showing blank?**
   - Loading state might be too long; check network tab
   - Verify `ProtectedRouteWrapper` is wrapping component correctly
   - Check Firebase initialization in `lib/firebase.ts`

## File Summary

### New Files Created
- `middleware.ts` → Next.js middleware (placeholder)
- `components/landing-page-wrapper.tsx` → Auto-redirect for authenticated users on landing page
- `components/protected-route-wrapper.tsx` → Auto-redirect for unauthenticated users on product routes
- `frontend/AUTH_SETUP.md` → This guide

### Files Modified
- `app/layout.tsx` → Added `AuthInitializer` and `ThemeProvider`
- `components/login-card.tsx` → Integrated Google OAuth
- `components/signup-card.tsx` → Converted to "Sign up with Google"
- `components/header.tsx` → Added auth state display + sign out
- `components/product/header.tsx` → Added user avatar + sign out
- `app/page.tsx` → Wrapped with `LandingPageWrapper`
- `app/product/page.tsx` → Wrapped with `ProtectedRouteWrapper`
- `app/product/study/page.tsx` → Wrapped with `ProtectedRouteWrapper`
- `app/product/test/page.tsx` → Wrapped with `ProtectedRouteWrapper`
- `app/product/analytics/page.tsx` → Wrapped with `ProtectedRouteWrapper`

### Existing (Unchanged) Files Relied Upon
- `lib/firebase.ts` → Firebase client config + user initialization
- `lib/store.ts` → Zustand global state
- `components/AuthInitializer.tsx` → Auth listener (already existed)
- `lib/gemini.ts` → Gemini API integration (already existed)
