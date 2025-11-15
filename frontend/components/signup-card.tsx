"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export function SignupCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signIn = useAppStore((state) => state.signIn)
  const router = useRouter()

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn()
      router.push("/product")
    } catch (err) {
      console.error(err)
      setError("Failed to sign up. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start your StudyWise journey in seconds
        </CardDescription>
        <CardAction>
          <Link href="/login" className="text-primary underline-offset-4 hover:underline text-sm">
            Already have an account? Log in
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Image src="/github-logo-icon.jpg" alt="Google icon" width={16} height={16} className="mr-2 rounded-full" />
            )}
            {isLoading ? "Signing up..." : "Sign up with Google"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </CardFooter>
    </Card>
  )
}

export default SignupCard
