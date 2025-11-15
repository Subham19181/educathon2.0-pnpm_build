"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/product/header"
import { Sidebar } from "@/components/product/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AiTutorChat from "@/components/product/study/ai-tutor-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper"
import { useAppStore } from "@/lib/store"
import { useSearchParams } from "next/navigation"
import { AI } from "@/lib/ai"
import type { Flashcard } from "@/lib/ai"

function StudyPageContent() {
  const currentLessonText = useAppStore((s) => s.currentLessonText)
  const searchParams = useSearchParams()
  const topicFromUrl = searchParams.get("topic") || "Lesson"

  const [notes, setNotes] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!currentLessonText) {
        setNotes(null)
        setSummary(null)
        setFlashcards(null)
        return
      }
      setAiLoading(true)
      setAiError(null)
      try {
        const [notesText, summaryText, flashcardSet] = await Promise.all([
          AI.flashcards.summarize(currentLessonText, `${topicFromUrl} - key points`),
          AI.flashcards.summarize(currentLessonText, topicFromUrl),
          AI.flashcards.generate(currentLessonText, topicFromUrl, 5),
        ])
        setNotes(notesText)
        setSummary(summaryText)
        setFlashcards(flashcardSet?.cards || [])
      } catch (err) {
        console.error("AI notes/summary/flashcards error", err)
        setAiError("Failed to generate AI notes and flashcards. Try regenerating the lesson.")
      } finally {
        setAiLoading(false)
      }
    }
    run()
  }, [currentLessonText, topicFromUrl])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Full Height */}
      <Sidebar />

      {/* Main Content Area - Header and Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto">
          {/* Main Content */}
          <div className="flex gap-6 p-6 max-w-7xl mx-auto items-stretch">
            {/* Left Column - Main Study Area */}
            <div className="flex-1 pr-4 md:pr-8 overflow-hidden flex flex-col">
              <Tabs defaultValue="original" className="w-full flex flex-col h-full">
                <TabsList className="bg-muted/40 backdrop-blur border border-border/60 rounded-full p-2 flex gap-2 w-fit mx-auto shadow">
                  {[
                    { value: "original", label: "Original" },
                    { value: "notes", label: "AI Notes" },
                    { value: "summary", label: "AI Summary" },
                    { value: "flashcards", label: "AI Flashcards" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "rounded-full px-5 py-2 text-sm font-normal transition-all duration-200 text-[#2F3037] font-sans leading-5",
                        "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow",
                        "data-[state=inactive]:text-muted-foreground hover:text-primary",
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-4 flex-1 overflow-hidden">
                  {/* Original Content */}
                  <TabsContent value="original" className="h-full">
                    <Card className="w-full h-full min-h-[50vh] max-h-[70vh] rounded-2xl p-4 bg-muted/40 overflow-auto flex items-start justify-start">
                      {!currentLessonText ? (
                        <div className="w-full h-full flex items-center justify-center text-center">
                          <p className="text-sm text-muted-foreground">
                            No lesson yet. Ask the AI Tutor on the right to generate a lesson,
                            then your content will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {currentLessonText}
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* AI Notes */}
                  <TabsContent value="notes" className="h-full">
                    <Card className="w-full h-full min-h-[50vh] max-h-[70vh] rounded-2xl p-4 bg-muted/40 overflow-auto">
                      {!currentLessonText ? (
                        <p className="text-sm text-muted-foreground text-center">
                          Generate a lesson with the AI Tutor first to see AI-powered notes.
                        </p>
                      ) : aiLoading ? (
                        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating notes from your lesson...
                        </div>
                      ) : aiError ? (
                        <p className="text-sm text-red-500 text-center">{aiError}</p>
                      ) : !notes ? (
                        <p className="text-sm text-muted-foreground text-center">No notes available.</p>
                      ) : (
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          {notes.split("\n").map((line, idx) => (
                            <li key={idx}>{line.replace(/^•\s*/, "")}</li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  </TabsContent>

                  {/* AI Summary */}
                  <TabsContent value="summary" className="h-full">
                    <Card className="w-full h-full min-h-[50vh] max-h-[70vh] rounded-2xl p-4 bg-muted/40 overflow-auto">
                      {!currentLessonText ? (
                        <p className="text-sm text-muted-foreground text-center">
                          Generate a lesson with the AI Tutor first to see a summary.
                        </p>
                      ) : aiLoading ? (
                        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Summarizing your lesson...
                        </div>
                      ) : aiError ? (
                        <p className="text-sm text-red-500 text-center">{aiError}</p>
                      ) : !summary ? (
                        <p className="text-sm text-muted-foreground text-center">No summary available.</p>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {summary}
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* AI Flashcards */}
                  <TabsContent value="flashcards" className="h-full">
                    <Card className="w-full h-full min-h-[50vh] max-h-[70vh] rounded-2xl p-4 bg-muted/40 overflow-auto">
                      {!currentLessonText ? (
                        <p className="text-sm text-muted-foreground text-center">
                          Generate a lesson with the AI Tutor first to create flashcards.
                        </p>
                      ) : aiLoading ? (
                        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating flashcards...
                        </div>
                      ) : aiError ? (
                        <p className="text-sm text-red-500 text-center">{aiError}</p>
                      ) : !flashcards || flashcards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">No flashcards generated.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {flashcards.map((card) => (
                            <div key={card.id} className="border rounded-lg p-3 bg-background/70 flex flex-col gap-2">
                              <p className="text-xs font-semibold text-muted-foreground">Question</p>
                              <p className="text-sm font-medium">{card.front}</p>
                              <p className="text-xs font-semibold text-muted-foreground mt-2">Answer</p>
                              <p className="text-sm text-foreground">{card.back}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{card.difficulty} · {topicFromUrl}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right Sidebar - AI Tutor */}
            <AiTutorChat />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudyPage() {
  return (
    <ProtectedRouteWrapper>
      <StudyPageContent />
    </ProtectedRouteWrapper>
  )
}
