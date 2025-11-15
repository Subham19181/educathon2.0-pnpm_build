"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

interface LandingPageWrapperProps {
  children: React.ReactNode
}

export function LandingPageWrapper({ children }: LandingPageWrapperProps) {
  const user = useAppStore((state) => state.user)
  const loading = useAppStore((state) => state.loading)
  const router = useRouter()

  useEffect(() => {
    console.log('[LandingPageWrapper] user:', user?.email, 'loading:', loading);
    // If user is authenticated and we're done loading, redirect to dashboard
    if (user && !loading) {
      console.log('[LandingPageWrapper] Redirecting to /product - user authenticated');
      router.push('/product')
    }
  }, [user, loading, router])

  // Show loading state or landing page based on auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is authenticated, don't render the landing page
  // (redirect will happen in useEffect)
  if (user) {
    return null
  }

  // Show landing page for unauthenticated users
  return <>{children}</>
}
