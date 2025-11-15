"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BookOpen, ArrowRight } from "lucide-react"

export function UpNextCard() {
  const currentLessonText = useAppStore((state) => state.currentLessonText)
  const [lastTopic, setLastTopic] = useState<string | null>(null)
  const router = useRouter()

  // Extract topic from lesson text (first line or first 50 chars)
  useEffect(() => {
    if (currentLessonText) {
      const firstLine = currentLessonText.split('\n')[0]
      const topic = firstLine.substring(0, 60).trim()
      setLastTopic(topic || 'Your last lesson')
    }
  }, [currentLessonText])

  if (!lastTopic) {
    return (
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-lg text-muted-foreground font-medium">Start your first lesson</p>
            <p className="text-sm text-muted-foreground mt-1">Go to Tutor to begin learning</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Continue Learning</p>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {lastTopic}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Pick up where you left off and test your knowledge
          </p>
          <Button 
            onClick={() => router.push('/product/study')}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-green-700" />
          </div>
        </div>
      </div>
    </Card>
  )
}
