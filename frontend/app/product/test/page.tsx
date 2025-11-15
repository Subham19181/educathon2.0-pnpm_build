"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Header } from "@/components/product/header"
import { Sidebar } from "@/components/product/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper"
import { useAppStore } from "@/lib/store"
import { generateQuizFromLesson } from "@/lib/quiz_gemini"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api/router"
import { MOCK_TOPICS } from "@/lib/mock_data"

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
}

interface QuizResponse {
  quiz: QuizQuestion[]
}

function TestPageContent() {
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [topic, setTopic] = useState<string>("Lesson Quiz")
  
  const currentLessonText = useAppStore((state) => state.currentLessonText)
  const user = useAppStore((state) => state.user)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load topic from URL
  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    if (urlTopic) {
      setTopic(decodeURIComponent(urlTopic));
    }
  }, [searchParams]);

  // Load and generate quiz
  useEffect(() => {
    const loadQuiz = async () => {
      console.log('[Step 2] Page mounted. currentLessonText:', currentLessonText?.substring(0, 100) + '...');
      
      if (!currentLessonText) {
        // Fallback: look for a mock topic quiz by topic title
        const urlTopic = searchParams.get('topic') || topic;
        const mock = MOCK_TOPICS.find((t) => t.title === urlTopic || t.id === urlTopic);
        if (mock && mock.quiz.length > 0) {
          const mockQuiz: QuizQuestion[] = mock.quiz.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          }));
          setQuizData(mockQuiz);
          setUserAnswers(new Array(mockQuiz.length).fill(null));
          setIsLoading(false);
          console.log('[Step 2] ✅ Loaded mock quiz for topic', urlTopic);
          return;
        }
        setError('No lesson text found. Please complete a lesson first.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Call Step 2: Generate quiz from lesson
        const jsonString = await generateQuizFromLesson(currentLessonText);
        
        // Parse the JSON
        const parsed: QuizResponse = JSON.parse(jsonString);
        setQuizData(parsed.quiz);
        setUserAnswers(new Array(parsed.quiz.length).fill(null));
        console.log('[Step 2] ✅ Quiz loaded successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[Step 2] ❌ Error loading quiz:', errorMsg);
        setError(`Failed to generate quiz: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [currentLessonText]);

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < (quizData?.length ?? 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    quizData?.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        score++;
      }
    });

    console.log('[Step 3] Quiz completed. Score:', score, 'Total:', quizData?.length);
    setShowResults(true);

    // Step 3: Save score & attempts via API
    if (user && quizData) {
      setIsSaving(true);
      try {
        const questionsAnswered = quizData.map((q, idx) => ({
          question: q.question,
          selectedAnswer: userAnswers[idx] || "",
          correctAnswer: q.answer,
          isCorrect: userAnswers[idx] === q.answer,
        }));

        const response = await api.quiz.save({
          userId: user.uid,
          topic,
          score,
          total: quizData.length,
          percentage: Math.round((score / quizData.length) * 100),
          questionsAnswered,
        });

        if (response.success) {
          console.log('[Step 3] ✅ Quiz attempt saved');
        } else {
          console.error('[Step 3] ❌ Failed to save quiz attempt:', response.error);
        }
      } catch (err) {
        console.error('[Step 3] ❌ Error saving quiz attempt:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Generating quiz from your lesson...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md p-6 border-red-200">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-center text-red-600 font-medium mb-4">{error}</p>
              <Button onClick={() => router.push('/product/study')} className="w-full">
                Back to Tutor
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz not loaded
  if (!quizData) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md p-6">
              <p className="text-center mb-4">No quiz generated</p>
              <Button onClick={() => router.push('/product/study')} className="w-full">
                Back to Tutor
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentIndex];
  const isAnswered = userAnswers[currentIndex] !== null;

  // Results view
  if (showResults) {
    const score = userAnswers.filter((ans, idx) => ans === quizData[idx]?.answer).length;
    const percentage = Math.round((score / quizData.length) * 100);

    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-4xl font-bold text-primary mb-2">{score}/{quizData.length}</p>
              <p className="text-lg text-muted mb-6">{percentage}% Correct</p>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving score...
                </div>
              ) : (
                <p className="text-sm text-green-600 mb-6">✅ Score saved to your profile</p>
              )}
              <div className="space-y-2">
                <Button onClick={() => router.push('/product')} className="w-full">
                  View Profile
                </Button>
                <Button onClick={() => router.push('/product/study')} variant="outline" className="w-full">
                  Take Another Quiz
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Question {currentIndex + 1} of {quizData.length}</span>
                <span className="text-sm text-muted">{Math.round(((currentIndex + 1) / quizData.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      userAnswers[currentIndex] === option
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          userAnswers[currentIndex] === option
                            ? 'bg-primary border-primary'
                            : 'border-muted'
                        }`}
                      >
                        {userAnswers[currentIndex] === option && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="flex-1"
                >
                  Previous
                </Button>

                {currentIndex === quizData.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isAnswered || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Submit Quiz'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="flex-1"
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestPage() {
  return (
    <ProtectedRouteWrapper>
      <TestPageContent />
    </ProtectedRouteWrapper>
  )
}
