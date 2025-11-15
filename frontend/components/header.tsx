"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
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

  return (
    <header className="w-full border-b border-[#37322f]/6 bg-background">
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans hover:opacity-80">
              StudyWise
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Products</button>
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Pricing</button>
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Docs</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {user.displayName || user.email}</span>
                <Button variant="ghost" className="text-[#37322f] hover:bg-[#37322f]/5" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-[#37322f] hover:bg-[#37322f]/5">
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
