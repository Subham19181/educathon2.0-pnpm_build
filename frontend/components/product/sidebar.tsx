"use client"

import { useEffect, useState } from "react"
import { Menu, BookOpen, HelpCircle, BarChart3, AreaChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BookOpen, href: "/product" },
  { id: "study", label: "Study", icon: HelpCircle, href: "/product/study" },
  { id: "test", label: "Test", icon: BarChart3, href: "/product/test" },
  { id: "analytics", label: "Analytics", icon: AreaChart, href: "/product/analytics" },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [activeItem, setActiveItem] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!pathname) return
    // Try exact match first
    let matched = navItems.find((n) => n.href === pathname)
    // Fallback to startsWith if no exact match
    if (!matched) {
      matched = navItems.find((n) => n.href && pathname.startsWith(n.href))
    }
    if (matched) setActiveItem(matched.id)
  }, [pathname])

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen flex flex-col",
        isOpen ? "w-48" : "w-20",
      )}
    >
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
              )}
              onClick={() => {
                if (item.href) router.push(item.href)
              }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
