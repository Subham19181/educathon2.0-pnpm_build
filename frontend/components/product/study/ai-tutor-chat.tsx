"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, CornerDownLeft, Brain, User, Plus, X, Loader2 } from "lucide-react"
import { runTutorChat, runTutorChatWithImage } from "@/lib/gemini"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Define the shape of a chat message
interface Message {
  role: "user" | "model"
  text: string
  image?: string // Base64 string for displaying the image
}

function AiTutorChatContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Get the setter function from our global store
  const setLessonText = useAppStore(
    (state) => state.setLessonText
  )
  const currentLessonText = useAppStore((state) => state.currentLessonText)

  // Ensure component is mounted before rendering (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to bottom of chat on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      // Create a base64 preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input && !image) return

    setIsLoading(true)
    setLessonText("") // Clear previous lesson
    const userMessageText = input
    const userMessage: Message = {
      role: "user",
      text: userMessageText,
    }
    if (imageBase64) {
      userMessage.image = imageBase64
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setImage(null)
    setImageBase64(null)

    // Add empty model message for streaming
    setMessages((prev) => [...prev, { role: "model", text: "" }])

    let fullResponse = ""
    try {
      if (image) {
        // --- OCR / Image Function ---
        const stream = await runTutorChatWithImage(userMessageText, image)
        for await (const chunk of stream) {
          const chunkText = chunk.text()
          fullResponse += chunkText
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, text: fullResponse }
                : msg
            )
          )
        }
      } else {
        // --- Text-Only Function ---
        const stream = await runTutorChat(userMessageText)
        for await (const chunk of stream) {
          const chunkText = chunk.text()
          fullResponse += chunkText
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, text: fullResponse }
                : msg
            )
          )
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error from Gemini:", errorMsg, error)
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? {
                ...msg,
                text: `Sorry, I encountered an error: ${errorMsg}`,
              }
            : msg
        )
      )
    }

    // --- CRITICAL (Step 1 Benchmark) ---
    // Once the full response is loaded, save it to the global state.
    setLessonText(fullResponse)
    // ------------------------------------

    setIsLoading(false)
  }

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full max-w-3xl mx-auto flex-col rounded-lg border shadow-lg bg-muted/30 animate-pulse" />
    )
  }

  return (
    <div className="flex h-[calc(100vh-100px)] w-full max-w-3xl mx-auto flex-col rounded-lg border shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">AI Tutor</h2>
        </div>
        {/* "Go to Quiz" button (Step 1 Benchmark) */}
        {currentLessonText && (
          <Button
            size="sm"
            onClick={() => {
              const firstLine = currentLessonText.split('\n')[0]
              const topic = (firstLine || 'Lesson Quiz').substring(0, 60).trim()
              router.push(`/product/test?topic=${encodeURIComponent(topic || 'Lesson Quiz')}`)
            }}
          >
            Go to Quiz
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Brain className="h-12 w-12 mb-4" />
            <p className="text-lg">Welcome to your AI Tutor!</p>
            <p className="text-sm">
              Ask me anything about your (JEE, NEET, UPSC, etc.) topics.
            </p>
            <p className="text-sm mt-2">
              You can also upload an image of a problem.
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "model" && (
              <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
                <Brain className="h-5 w-5" />
              </span>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                msg.role === "user"
                  ? "bg-muted text-muted-foreground"
                  : "bg-background border"
              }`}
            >
              {/* Display uploaded image if it exists */}
              {msg.image && (
                <Image
                  src={msg.image}
                  alt="User upload"
                  width={300}
                  height={300}
                  className="rounded-md mb-2"
                />
              )}
              {/* Handle newlines in the response text */}
              {msg.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {msg.role === "user" && (
              <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                <User className="h-5 w-5" />
              </span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </span>
            <div className="rounded-lg p-3 max-w-[80%] bg-background border">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="relative p-4 border-t"
      >
        {/* Image Preview */}
        {imageBase64 && (
          <div className="relative w-24 h-24 mb-2 p-1 border rounded-md">
            <Image
              src={imageBase64}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => {
                setImage(null)
                setImageBase64(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a topic or upload an image..."
          className="w-full pr-28 pl-12"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as any)
            }
          }}
        />
        {/* File Upload Button */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-6 top-1/2 -translate-y-1/2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-5 w-5" />
        </Button>
        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className="absolute right-6 top-1/2 -translate-y-1/2"
          disabled={(!input && !image) || isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}

export default function AiTutorChat() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-100px)] w-full max-w-3xl mx-auto flex-col rounded-lg border shadow-lg bg-muted/30 animate-pulse" />}>
      <AiTutorChatContent />
    </Suspense>
  )
}