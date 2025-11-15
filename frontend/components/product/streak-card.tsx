"use client"

import { Card } from "@/components/ui/card"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function StreakCard() {
  const days = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]
  const completedDays = [0, 1]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans mb-2">Streaks</h3>
          <div className="flex items-center gap-3">
            <div className="text-5xl font-bold text-gray-700">2</div>
            <div className="flex items-center gap-1">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">Current streak</span>
            </div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    completedDays.includes(index) ? "bg-primary text-primary-foreground" : "border-2 border-border",
                  )}
                >
                  {completedDays.includes(index) && "✓"}
                </div>
                <span className="text-xs text-muted-foreground text-center">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
