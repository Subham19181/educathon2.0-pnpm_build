"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

interface ProtectedRouteWrapperProps {
  children: React.ReactNode
}

export function ProtectedRouteWrapper({ children }: ProtectedRouteWrapperProps) {
  const user = useAppStore((state) => state.user)
  const loading = useAppStore((state) => state.loading)
  const router = useRouter()

  useEffect(() => {
    console.log('[ProtectedRouteWrapper] user:', user?.email, 'loading:', loading);
    // If not loading and user is not authenticated, redirect to login
    if (!loading && !user) {
      console.log('[ProtectedRouteWrapper] Redirecting to /login - not authenticated');
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, return null (redirect will happen in useEffect)
  if (!user) {
    return null
  }

  // Show protected content if authenticated
  return <>{children}</>
}
