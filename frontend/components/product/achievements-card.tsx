"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AchievementsCard() {
  const achievements = [
    { id: 1, label: "Bronze League", imageSrc: "/achievements/1.png", claimed: false },
    { id: 2, label: "Gold League", imageSrc: "/achievements/2.png", claimed: false },
    { id: 3, label: "Silver League", imageSrc: "/achievements/3.png", claimed: false },
    { id: 4, label: "Diamond League", imageSrc: "/achievements/4.png", claimed: false },
  ]

  return (
    <Card className="p-6">
      <h3 className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans mb-6">Achievements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {achievements.map((a) => (
          <div key={a.id} className="col-span-1 w-full flex flex-col items-center text-center px-2">
            <div className="relative w-full max-w-[11rem] aspect-square rounded-xl bg-transparent flex items-center justify-center overflow-hidden p-4">
              {a.imageSrc ? (
                <img src={a.imageSrc} alt={a.label} className="w-full h-full object-contain" />
              ) : (
                <div className="text-4xl">🏅</div>
              )}
            </div>

            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2.5" aria-label={`Claim ${a.label}`}>
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Claim
              </span>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border text-center">
        <Button
          className="mt-2 inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          aria-label="View all achievements"
        >
          View all
        </Button>
      </div>
    </Card>
  )
}
