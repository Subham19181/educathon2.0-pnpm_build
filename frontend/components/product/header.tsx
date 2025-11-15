"use client"

import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export function Header() {
  const user = useAppStore((state) => state.user)
  const signOut = useAppStore((state) => state.signOut)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">StudyWise</div>
        </div>

        <div className="flex items-center gap-4">
          {/* Points/Score */}
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-sm">40616</span>
          </div>

          {/* Streak Fire Icon */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium">0</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          <Button variant="ghost" size="icon" title={`Sign out (${user?.email})`} onClick={handleSignOut}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitial()}
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}
