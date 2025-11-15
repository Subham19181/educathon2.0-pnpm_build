"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Settings } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

const lineChartData = [
  { week: "Week 1", avgScore: 62, quizzesTaken: 3 },
  { week: "Week 2", avgScore: 68, quizzesTaken: 4 },
  { week: "Week 3", avgScore: 72, quizzesTaken: 5 },
  { week: "Week 4", avgScore: 75, quizzesTaken: 4 },
  { week: "Week 5", avgScore: 81, quizzesTaken: 6 },
  { week: "Week 6", avgScore: 85, quizzesTaken: 5 },
];

const pieChartData = [
  { name: "Mathematics", value: 28 },
  { name: "Science", value: 22 },
  { name: "History", value: 18 },
  { name: "Literature", value: 32 },
];

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#ef4444"];

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Quiz Score Trend Line Chart */}
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Score Progress & Activity 📈</h3>
          <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />
            <Line type="monotone" dataKey="avgScore" stroke="#60a5fa" strokeWidth={2} dot={{ fill: "#60a5fa" }} name="Avg Score (%)" />
            <Line type="monotone" dataKey="quizzesTaken" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399" }} name="Quizzes Taken" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </Card>

      {/* Topic Mastery Pie Chart */}
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Quizzes by Subject 🎯</h3>
          <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RechartsPieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
