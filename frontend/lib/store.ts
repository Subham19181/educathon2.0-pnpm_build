import { create } from 'zustand';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db, initializeUserInFirestore } from './firebase'; // Import our new firebase config
import { DEMO_MODE, mockSignIn, getMockUser } from './mock_auth'; // Demo mode fallback

// Define the shape of our state
interface AppState {
  user: User | null;
  credits: number;
  loading: boolean;
  currentLessonText: string | null; // <-- CRITICAL: For Teach -> Test loop
  
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void; // This will be called by our AuthInitializer
  setLoading: (loading: boolean) => void;
  setLessonText: (text: string) => void; // <-- CRITICAL: For Teach -> Test loop
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  credits: 0,
  loading: true, // Start as true until first auth check
  currentLessonText: null,

  // --- Core 5 AM Demo Actions ---
  setLessonText: (text: string) => set({ currentLessonText: text }),

  // --- Auth Actions ---
  setUser: (user) => {
    set({ user });
    if (user) {
      // Subscribe to user's data in Firestore for real-time updates (like credits)
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          set({ credits: doc.data().credits || 0 });
        }
      });
      // Note: In a real app, you'd manage this unsubscribe, but for the sprint, this is fine.
    } else {
      set({ credits: 0 }); // Reset credits on logout
    }
  },

  setLoading: (loading) => set({ loading }),

  signIn: async () => {
    set({ loading: true });
    try {
      if (DEMO_MODE) {
        console.log('[DEMO MODE] Using mock authentication');
        await mockSignIn();
        const mockUser = getMockUser();
        set({ user: mockUser, loading: false });
        return;
      }
      
      const provider = new GoogleAuthProvider();
      console.log('Starting Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google auth successful:', user.email);
      
      // Ensure user is initialized in Firestore
      // This will create them or update their last login
      console.log('Initializing user in Firestore...');
      await initializeUserInFirestore(user);
      console.log('User initialized in Firestore');

      // The onAuthStateChanged listener in AuthInitializer will handle setting the user
      // so we don't need to call setUser here.
      
    } catch (error: any) {
      console.error('Error during sign in:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      set({ loading: false }); // Stop loading on error
      throw error; // Re-throw so login-card can catch it
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, loading: false, credits: 0 }); // Clear user on sign out
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  },
}));