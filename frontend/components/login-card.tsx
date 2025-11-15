"use client"; // This MUST be a client component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// --- FIX: Reverting to alias path, as this is the project's convention ---
import { useAppStore } from '@/lib/store'; // Our global state
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';

/**
 * This component is modified for the 5 AM sprint.
 * We've CUT the email/password fields to focus on
 * the fastest path: Google Sign-In.
 */
export default function CardDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useAppStore((state) => state.signIn);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn();
      // Wait a moment for Firebase auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirect to product dashboard after successful login
      router.push('/product');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const errorMsg = err?.message || err?.code || 'Failed to sign in';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Sign in with Google to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Email and Password fields CUT for 5 AM demo */}
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="mr-.5 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             // Using a placeholder icon from your /public folder
             <Image src="/github-logo-icon.jpg" alt="Google icon" width={16} height={16} className="mr-2 rounded-full" />
          )}
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>

        {error && (
          <p className="mt-2 text-center text-sm text-red-500">{error}</p>
        )}

      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {/* Original "Login" button is CUT */}
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}