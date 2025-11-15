import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentReference,
  collection,
  addDoc
} from 'firebase/firestore';

// This is the correct, safe way to read Next.js keys from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase services
// Check if app is already initialized (this is a fix for Next.js hot-reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Define user data interface 
// (Adapted from your 'learnit' project logic, as it's needed for the demo)
interface UserData {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  credits: number;
  friends: string[];
  createdAt: any; // FirebaseFirestore.FieldValue
  lastLogin: any; // FirebaseFirestore.FieldValue
  totalQuizzesTaken: number;
  totalCreditsEarned: number;
}

/**
 * Initializes a new user in Firestore or updates last login time for existing user.
 * This is a critical part of the auth flow.
 */
export const initializeUserInFirestore = async (user: User): Promise<void> => {
  const userRef: DocumentReference = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userData: UserData = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      credits: 100, // Starting credits
      friends: [],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      totalQuizzesTaken: 0,
      totalCreditsEarned: 0
    };
    
    await setDoc(userRef, userData);
  } else {
    // Just update last login time
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      // Also update photoURL in case it changed
      photoURL: user.photoURL 
    });
  }
};

/**
 * Step 3: Save quiz score to Firestore
 */
export const saveQuizScore = async (
  userId: string,
  score: number,
  total: number,
  topic: string
): Promise<void> => {
  try {
    console.log('[Step 3] Saving quiz score to Firestore...');
    
    // Check if in demo mode
    const { DEMO_MODE } = await import('./mock_auth');
    if (DEMO_MODE) {
      console.log('[DEMO MODE] Simulating score save to Firestore');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[Step 3] ✅ Quiz score saved (demo mode)');
      return;
    }
    
    const quizHistoryRef = collection(db, 'users', userId, 'quiz_history');
    await addDoc(quizHistoryRef, {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      topic,
      timestamp: serverTimestamp(),
    });
    console.log('[Step 3] ✅ Quiz score saved');
  } catch (error) {
    console.error('[Step 3] ❌ Error saving quiz score:', error);
    throw error;
  }
};
