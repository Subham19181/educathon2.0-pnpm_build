"use client"

import { Header } from "@/components/product/header"
import { Sidebar } from "@/components/product/sidebar"
import { StreakCard } from "@/components/product/streak-card"
import { AchievementsCard } from "@/components/product/achievements-card"
import { UpNextCard } from "@/components/product/upnext-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { api } from "@/lib/api/router"
import type { Course } from "@/lib/db/types"
import { useEffect, useState } from "react"
import { MOCK_TOPICS } from "@/lib/mock_data"

function DashboardContent() {
  const user = useAppStore((s) => s.user)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoadingCourses(false)
        return
      }
      try {
        const res = await api.course.getAll(user.uid)
        if (res.success && Array.isArray(res.data)) {
          setCourses(res.data as Course[])
        }
      } finally {
        setLoadingCourses(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Continue & Study Paths */}
              <div className="lg:col-span-2 space-y-6">
                {/* Continue Learning Section */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">Your Learning</h2>
                  <Button size="sm" variant="outline" onClick={() => router.push("/product/courses/new")}>
                    + Create Course
                  </Button>
                </div>
                <UpNextCard />

                {/* Your Courses */}
                <div>
                  <h2 className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans mb-2">Your Courses</h2>
                  {loadingCourses ? (
                    <p className="text-xs text-muted-foreground">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No courses yet. Create one to get a guided path.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {courses.map((c) => (
                        <Card key={c.id} className="p-3 cursor-pointer hover:shadow-md" onClick={() => router.push("/product/study?topic=" + encodeURIComponent(c.title))}>
                          <p className="text-xs text-muted-foreground mb-1">Course</p>
                          <h3 className="text-sm font-semibold line-clamp-2">{c.title}</h3>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{c.goal}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Study Topics Section */}
                <div>
                  <h2 className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans mb-4">Popular Study Topics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_TOPICS.map((t) => (
                      <TopicCard
                        key={t.id}
                        topicId={t.id}
                        title={t.subject}
                        subtitle={t.subtitle}
                        duration={t.duration}
                        icon={t.icon}
                        color={t.color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Progress & Achievements */}
              <div className="space-y-6">
                <StreakCard />
                <AchievementsCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function StudyPage() {
  return (
    <ProtectedRouteWrapper>
      <DashboardContent />
    </ProtectedRouteWrapper>
  )
}

interface TopicCardProps {
  topicId: string
  title: string
  subtitle: string
  duration: string
  icon: string
  color: string
}

function TopicCard({ topicId, title, subtitle, duration, icon, color }: TopicCardProps) {
  const router = useRouter()
  const { setLessonText } = useAppStore()

  const handleStart = async () => {
    const topic = MOCK_TOPICS.find((t) => t.id === topicId)
    if (topic) {
      // preload lesson text so study tabs & quizzes have something rich to show
      setLessonText(topic.lesson)
      router.push("/product/study?topic=" + encodeURIComponent(topic.title))
    } else {
      router.push("/product/study?topic=" + encodeURIComponent(`${title}: ${subtitle}`))
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg hover:scale-105 transition-all cursor-pointer group">
      <div className={`${color} h-32 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <h3 className="font-semibold text-base mb-2">{subtitle}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{duration}</span>
          <Button size="sm" onClick={handleStart} className="bg-primary hover:bg-primary/90">
            Start
          </Button>
        </div>
      </div>
    </Card>
  )
}
