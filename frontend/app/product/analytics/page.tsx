"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/product/header";
import { Sidebar } from "@/components/product/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Search,
  Bell,
  Filter,
  Download,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api/router";
import type { StudentStats, QuizAttempt } from "@/lib/db/types";

const AnalyticsCharts = dynamic(
  () => import("@/components/product/analytics/AnalyticsCharts"),
  { ssr: false }
);

function AnalyticsPageContent() {
  const user = useAppStore((state) => state.user);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const [statsRes, quizzesRes] = await Promise.all([
          api.stats.get(user.uid),
          api.quiz.getAll(user.uid),
        ]);

        if (statsRes.success) {
          setStats(statsRes.data || null);
        } else {
          // Either no stats yet or a handled condition; treat as "zero data".
          setStats(null);
        }

        if (quizzesRes.success && Array.isArray(quizzesRes.data)) {
          const quizzes = quizzesRes.data as QuizAttempt[];
          // Sort by timestamp desc if available
          const toMillis = (t: any): number => {
            if (!t) return 0;
            if (typeof t.toMillis === "function") return t.toMillis();
            if (typeof t.seconds === "number") return t.seconds * 1000;
            return 0;
          };
          quizzes.sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
          setRecentQuizzes(quizzes.slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading analytics data", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const quizzesCompleted = stats?.totalQuizzesTaken ?? 0;
  const averageScoreValue = stats ? `${stats.averageScore}%` : "--";
  const streakText = stats ? `${stats.streak} days` : "0 days";
  const topicsMasteredValue = stats?.topicsMastered ?? 0;

  return (
    <div className="min-h-screen flex bg-black/50">

      {/* SIDEBAR */}
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden">

        {/* HEADER ABOVE OVERLAYS */}
        <div className="relative z-20">
          <Header />
        </div>

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fractal%20Glass%20-%204.jpg-8QPt1A02QgjJIeTqwEYV5thwZXXEGT.jpeg')",
          }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30" />

        {/* SCROLLABLE CONTENT */}
        <div className="relative z-10 h-full overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto p-6">

            {/* MAIN CONTAINER WITH MARGIN */}
            <div className="space-y-6 m-3">
              {error && (
                <Card className="backdrop-blur-xl bg-red-500/10 border border-red-400/60 rounded-2xl p-3 text-sm text-red-100">
                  {error} – check Firebase config, credentials, and that DEMO_MODE is set correctly.
                </Card>
              )}

              {/* HEADER CARD */}
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Your Performance 📈</h2>
                    <p className="text-white/60">Track your learning progress and quiz scores</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                      <Input
                        placeholder="Search analytics..."
                        className="pl-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* STATS CARDS */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  {
                    title: "Quizzes Completed",
                    value: quizzesCompleted.toString(),
                    change: quizzesCompleted > 0 ? "Based on your activity" : "Take your first quiz",
                    icon: BarChart3,
                    color: "text-blue-400",
                  },
                  {
                    title: "Average Score",
                    value: averageScoreValue,
                    change: quizzesCompleted > 0 ? "Across all quizzes" : "No data yet",
                    icon: TrendingUp,
                    color: "text-green-400",
                  },
                  {
                    title: "Study Streak",
                    value: streakText,
                    change: "Streak tracking coming soon",
                    icon: Users,
                    color: "text-orange-400",
                  },
                  {
                    title: "Topics Mastered",
                    value: topicsMasteredValue.toString(),
                    change: topicsMasteredValue > 0 ? "Mastered (avg ≥ 80%)" : "Keep practicing",
                    icon: BarChart3,
                    color: "text-purple-400",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                        <p className={`text-sm mt-2 ${stat.color}`}>{stat.change}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </Card>
                ))}
              </div>

              {/* CHARTS */}
              <AnalyticsCharts />

              {/* PERFORMANCE + KEY METRICS */}
              <div className="grid grid-cols-2 gap-6">
                {/* Topic Mastery */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Topic Mastery 🎯</h3>
                    <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {stats && stats.topicBreakdown && stats.topicBreakdown.length > 0 ? (
                      stats.topicBreakdown.slice(0, 4).map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">{metric.topic}</span>
                            <span className="text-white font-semibold text-sm">{metric.averageScore}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                              style={{ width: `${metric.averageScore}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/70 text-sm">Complete a quiz to see topic mastery.</p>
                    )}
                  </div>
                </Card>

                {/* Recent Quiz Performance */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Quizzes 📝</h3>
                    <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentQuizzes.length > 0 ? (
                      recentQuizzes.map((q, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white/70 text-sm">{q.topic}</p>
                            <p className="text-white font-semibold text-lg mt-1">{q.percentage}%</p>
                          </div>
                          <p className="text-green-400 text-sm font-medium">
                            {q.percentage >= 80 ? "Excellent" : q.percentage >= 60 ? "Good" : "Needs practice"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/70 text-sm">No quizzes yet. Complete a quiz to see your performance here.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Bottom spacing */}
              <div className="h-4" />

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper"

export default function AnalyticsPage() {
  return (
    <ProtectedRouteWrapper>
      <AnalyticsPageContent />
    </ProtectedRouteWrapper>
  )
}
