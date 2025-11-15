"use client"; // This MUST be a client component

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initializeUserInFirestore } from '@/lib/firebase'; // Use alias
import { useAppStore } from '@/lib/store'; // Use alias

/**
 * This component runs once on app load.
 * It listens for auth changes (login, logout, refresh)
 * and ensures the user is correctly set in our global state.
 * 
 * SPRINT MODE: Falls back to mock auth if Firebase Identity Toolkit is disabled
 */
export const AuthInitializer = () => {
  const setUser = useAppStore((state) => state.setUser);
  const setLoading = useAppStore((state) => state.setLoading);

  useEffect(() => {
    console.log('AuthInitializer mounting - setting up auth listener');
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser?.email || 'null');
        if (firebaseUser) {
          // User is logged in.
          // This ensures their data is in Firestore (from firebase.ts)
          console.log('User logged in, initializing in Firestore...');
          initializeUserInFirestore(firebaseUser).then(() => {
            console.log('User initialized, setting in store');
            setUser(firebaseUser); // Set user in global state
            setLoading(false);
          }).catch((err) => {
            console.error('Error initializing user in Firestore:', err);
            setLoading(false);
          });
        } else {
          // User is logged out.
          console.log('User logged out');
          setUser(null);
          setLoading(false);
        }
      });
      
      // Cleanup the listener when the component unmounts
      return () => {
        console.log('AuthInitializer unmounting');
        unsubscribe();
      }; 
    } catch (error) {
      console.warn('Firebase auth not available, using mock auth for sprint demo', error);
      // SPRINT MODE: Mock a logged-in user for demo purposes
      const mockUser = {
        uid: 'sprint-demo-user-123',
        email: 'demo@studywise.local',
        displayName: 'Demo User',
      } as any;
      setUser(mockUser);
      setLoading(false);
    }
  }, [setUser, setLoading]); // Dependencies for the effect

  // This component renders nothing
  return null;
};