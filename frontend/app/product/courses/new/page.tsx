"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/product/header";
import { Sidebar } from "@/components/product/sidebar";
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI } from "@/lib/ai";
import { api } from "@/lib/api/router";
import { useAppStore } from "@/lib/store";
import type { CourseModule } from "@/lib/db/types";
import { Loader2 } from "lucide-react";

function NewCourseContent() {
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [hours, setHours] = useState("10");
  const [modules, setModules] = useState<CourseModule[] | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Describe what you want to learn.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const outline = await AI.course.outline(goal, level);
      if (!outline || outline.length === 0) {
        setError("AI could not generate a course. Try a clearer goal.");
        setModules(null);
        return;
      }
      setModules(outline);
      if (!title) {
        setTitle(goal.length > 60 ? goal.slice(0, 57) + "..." : goal);
      }
    } catch (err) {
      console.error("Course generation error", err);
      setError("Failed to generate course. Check your AI key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !modules || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.course.save({
        userId: user.uid,
        title: title.trim(),
        description: goal.trim(),
        goal: goal.trim(),
        level,
        estimatedDurationHours: Number(hours) || 10,
        modules,
      });
      if (!res.success || !res.data) {
        setError(res.error || "Failed to save course");
        return;
      }
      router.push("/product");
    } catch (err) {
      console.error("Save course error", err);
      setError("Failed to save course. Check database config.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            <Card className="p-6 space-y-4">
              <h1 className="text-2xl font-semibold">Create a custom learning path</h1>
              <p className="text-sm text-muted-foreground">
                Tell StudyWise what you want to achieve. We will generate a structured course with modules and topics.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">What do you want to learn?</label>
                <Textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Master Kinematics for JEE in 2 weeks"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-sm font-medium">Hours</label>
                  <Input
                    type="number"
                    min={1}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating...</span>
                ) : (
                  "Generate Course"
                )}
              </Button>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </Card>

            {modules && (
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. JEE Kinematics Crash Path"
                  />
                </div>

                <div className="space-y-4">
                  {modules.map((m, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-2 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm">Module {idx + 1}: {m.title}</h3>
                      </div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      )}
                      <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                        {m.topics.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave} disabled={saving || !user} className="w-full">
                  {saving ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                  ) : (
                    user ? "Save Course" : "Sign in to save course"
                  )}
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <ProtectedRouteWrapper>
      <NewCourseContent />
    </ProtectedRouteWrapper>
  );
}
