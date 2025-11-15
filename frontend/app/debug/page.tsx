"use client"

import { useAppStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const user = useAppStore((state) => state.user)
  const loading = useAppStore((state) => state.loading)
  const credits = useAppStore((state) => state.credits)
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null)

  useEffect(() => {
    // Log all env vars to console for debugging
    console.log("=== DEBUG INFO ===")
    console.log("User:", user?.email)
    console.log("Loading:", loading)
    console.log("Credits:", credits)
    console.log("Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + "***")
    console.log("Firebase Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log("Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    
    setFirebaseConfig({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + "***",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 10) + "***",
      geminiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10) + "***",
    })
  }, [user, loading, credits])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Debug Info</h1>
        
        <div className="space-y-6">
          {/* Auth State */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Auth State</h2>
            <div className="space-y-2">
              <p><strong>User Authenticated:</strong> {user ? "✅ Yes" : "❌ No"}</p>
              <p><strong>User Email:</strong> {user?.email || "N/A"}</p>
              <p><strong>User Name:</strong> {user?.displayName || "N/A"}</p>
              <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
              <p><strong>Credits:</strong> {credits}</p>
            </div>
          </div>

          {/* Firebase Config */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Firebase Config</h2>
            <div className="space-y-2 text-sm font-mono">
              {firebaseConfig && Object.entries(firebaseConfig).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value || "NOT SET"}
                </p>
              ))}
            </div>
            {firebaseConfig?.projectId === "NOT SET" && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
                ⚠️ Firebase config is missing! Check <code>.env.local</code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
              <Button onClick={() => window.location.href = "/product"} variant="outline">
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => {
                  console.log("=== FULL DEBUG LOG ===")
                  console.log("User:", user)
                  console.log("Loading:", loading)
                  console.log("Credits:", credits)
                  alert("Check browser console for full debug info")
                }} 
                variant="secondary"
              >
                Log Full Info to Console
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🔍 Debugging Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-900">
              <li>Check that all Firebase config values are present above</li>
              <li>Open browser console (F12) and look for AuthInitializer logs</li>
              <li>Try clicking "Go to Login" and use Google auth</li>
              <li>Watch the console for "Auth state changed" messages</li>
              <li>If errors appear, note the error code and message</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
