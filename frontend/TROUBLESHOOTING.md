# Google Login Troubleshooting Guide

## Quick Diagnostics

1. **Visit the debug page**: `http://localhost:3001/debug`
   - This will show you the current auth state and Firebase config
   - Verify all Firebase environment variables are loaded

2. **Open browser console** (F12 or Ctrl+Shift+I)
   - Look for messages like: `AuthInitializer mounting - setting up auth listener`
   - Look for any error messages starting with `Error during sign in:`

3. **Check the error message** on the login page when attempting to sign in

## Common Issues & Fixes

### Issue 1: "Firebase config is missing" on debug page

**Cause**: Environment variables not loaded

**Fix**:
1. Verify `frontend/.env.local` exists with all required keys:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_GEMINI_API_KEY=...
   ```

2. Restart the dev server: `npm run dev`

3. Refresh the page and check `/debug` again

### Issue 2: "Failed to sign in. Please try again." on login page

**Cause**: Firebase credentials are invalid or Google auth is not configured

**Fix**:
1. Go to `http://localhost:3001/debug`
2. Check the Firebase config section
3. If values look wrong (especially `projectId`), update `.env.local`
4. **Restart the dev server** after updating `.env.local` - this is critical!
5. The Firebase project must have:
   - Google authentication provider enabled
   - OAuth consent screen configured
   - Authorized redirect URI: `http://localhost:3001` (or whatever port you're using)

### Issue 3: Console shows "Error code: auth/configuration-not-found"

**Cause**: Firebase initialization failed

**Fix**:
1. Verify all Firebase config values in `.env.local` are correct
2. Go to Firebase Console and verify the project exists
3. In Firebase Console → Settings → General, verify the Web app config values match `.env.local`
4. Try creating a new Web app in Firebase to get fresh credentials
5. Update `.env.local` with new credentials and restart dev server

### Issue 4: Google popup appears but then nothing happens

**Cause**: User is authenticating but state not updating

**Fix**:
1. Open browser console (F12)
2. Look for these log messages in order:
   - `Starting Google sign-in...`
   - `Google auth successful: [email]`
   - `Auth state changed: [email]`
   - `User logged in, initializing in Firestore...`
   - `User initialized, setting in store`

3. If you see "Error initializing user in Firestore":
   - Firestore database not set up or Firestore rules blocking writes
   - Go to Firebase Console → Firestore Database
   - Ensure database exists and is in test mode (or has proper rules)
   - Rules should allow writes to `users/{uid}` for authenticated users

4. If process stalls after "Google auth successful":
   - Firestore initialization might be hanging
   - Check Firestore is enabled in Firebase project

### Issue 5: "User logged in" in console but not redirecting to dashboard

**Cause**: Auth state detected but redirect not triggering

**Fix**:
1. Check that all three messages appear in console:
   - `User logged in, initializing in Firestore...`
   - `User initialized, setting in store`
   - `[LandingPageWrapper] Redirecting to /product - user authenticated`

2. If you see the first two but not the redirect:
   - The LandingPageWrapper component may not be active
   - Make sure you're on the landing page (`/` or home route) when logging in
   - If on login page, you should see instead:
     - `Login card: Redirecting to /product`

3. Browser may be blocking navigation:
   - Check browser console for any security errors
   - Try a different browser or clear browser cache

### Issue 6: Stuck on loading screen after login

**Cause**: Auth state not updating or protected route wrapper stuck

**Fix**:
1. In console, watch for `[ProtectedRouteWrapper]` logs
2. If you see: `[ProtectedRouteWrapper] user: null loading: true`
   - Then after ~5 seconds: `[ProtectedRouteWrapper] user: [email] loading: false`
   - This is normal; wait a bit longer
   
3. If `loading` stays `true` forever:
   - onAuthStateChanged listener not firing
   - Check Firestore rules aren't blocking the operation
   - Check browser console for Firestore errors

4. If after logging in you see:
   - `[ProtectedRouteWrapper] Redirecting to /login - not authenticated`
   - Then user is not being stored in Zustand
   - Check for errors in `setUser` in console

## Debug Workflow

1. **Visit** `http://localhost:3001/debug`
2. **Note** all Firebase config values
3. **Go to** `http://localhost:3001/login`
4. **Open console** (F12) before clicking login
5. **Click** "Sign in with Google"
6. **Watch console** for logs in this order:
   - `Starting Google sign-in...`
   - `Google auth successful: [your-email]`
   - `Initializing user in Firestore...`
   - `User initialized`
   - Should redirect to `/product`

7. **If stuck**, note which log messages you see and which are missing
8. **Check for errors** - any red text in console

## Console Log Reference

| Log Message | Meaning |
|---|---|
| `AuthInitializer mounting` | App loaded, auth listener active |
| `Auth state changed: [email]` | Firebase detected logged-in user |
| `Auth state changed: null` | Firebase detected logged-out user |
| `Starting Google sign-in...` | Google popup about to appear |
| `Google auth successful: [email]` | Google auth popup succeeded |
| `Initializing user in Firestore...` | Creating/updating user record |
| `User initialized, setting in store` | Zustand state updated |
| `[LandingPageWrapper] Redirecting to /product` | Logged in, redirecting to dashboard |
| `[ProtectedRouteWrapper] Redirecting to /login` | Not logged in, redirecting to login |

## Still Not Working?

1. **Verify Firebase credentials one more time**
   - Go to Firebase Console
   - Project Settings → General
   - Copy ALL values exactly (including hyphens)
   - Update `.env.local`
   - **Restart dev server**

2. **Check Firestore is enabled**
   - Firebase Console → Firestore Database
   - Should show a database
   - If not, click "Create database" and choose test mode

3. **Verify Google OAuth provider**
   - Firebase Console → Authentication
   - Providers tab
   - Google should be Enabled
   - If not, enable it and configure OAuth consent screen

4. **Try in incognito/private window**
   - Can help rule out browser cache issues
   - Clears cookies and session storage

5. **Check browser dev tools Network tab**
   - When clicking "Sign in with Google"
   - Should see requests to `identitytoolkit.googleapis.com`
   - If request fails, check error response for details

6. **Create a new Firebase project**
   - Sometimes simpler than debugging existing config
   - Create new Web app
   - Copy fresh credentials
   - Update `.env.local`
   - Restart dev server

## Need More Help?

Check these logs in browser console:

**To export full logs:**
```javascript
// Paste in browser console:
copy(performance.getEntriesByType("resource").map(r => r.name))
copy(localStorage)
copy(sessionStorage)
```

The debug page will also help:
- Visit `/debug` to see current state
- Click "Log Full Info to Console" for detailed state dump
