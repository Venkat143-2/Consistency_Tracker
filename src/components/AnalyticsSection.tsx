/**
 * @license
 * Apache-2.0
 */

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Heatmap } from "./Heatmap";

interface DailyStats {
  id: string;
  userId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

interface AnalyticsSummary {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  averageCompletion: number;
  accountAge: number;
  fullyCompletedDays: number;
  bestMonth: string;
  consistencyScore: number;
}

interface AnalyticsSectionProps {
  stats: DailyStats[];
  summary: AnalyticsSummary;
  categoryDistribution: { name: string; value: number }[];
  currentDayTasks: { id: string; completedToday: boolean }[];
  token: string;
  user: any;
}

export function AnalyticsSection({
  stats,
  summary,
  categoryDistribution,
  currentDayTasks,
  token,
  user,
}: AnalyticsSectionProps) {

  // Calculate top stats row
  const completedToday = currentDayTasks.filter((t) => t.completedToday).length;
  const pendingToday = currentDayTasks.length - completedToday;
  const todayPercentage = currentDayTasks.length > 0 
    ? Math.round((completedToday / currentDayTasks.length) * 100) 
    : 0;

  // Monthly average (%)
  const monthlyStats = stats.slice(-30);
  const monthPercentage = monthlyStats.length > 0
    ? Math.round(monthlyStats.reduce((sum, s) => sum + s.completionPercentage, 0) / monthlyStats.length)
    : todayPercentage || 0;

  // Yearly average (%)
  const yearlyStats = stats.slice(-365);
  const yearPercentage = yearlyStats.length > 0
    ? Math.round(yearlyStats.reduce((sum, s) => sum + s.completionPercentage, 0) / yearlyStats.length)
    : monthPercentage || todayPercentage || 0;

  // Prepare full chronological line graph trend
  const progressGraphData = React.useMemo(() => {
    const sorted = [...stats].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) {
      // Return beautiful default curve for empty state
      return Array.from({ length: 10 }, (_, i) => ({
        date: `Day ${i + 1}`,
        "Consistency Trend": Math.round(Math.sin((i / 3) * Math.PI) * 15 + 75),
      }));
    }
    return sorted.map((s) => ({
      date: s.date.slice(5), // "MM-DD"
      "Consistency Trend": s.completionPercentage,
    }));
  }, [stats]);

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-250">
      
      {/* Header and Title (Matching Image 4 exactly) */}
      <div className="space-y-1 pb-2 border-b border-slate-800/60">
        <h2 className="text-3xl font-black text-white tracking-tight">Analytics</h2>
      </div>

      {/* 3-Column Stats Row Cards (Modeled from Screenshot 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: GOALS ALIGNED */}
        <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#04D9C4] opacity-80" />
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Goals Aligned</div>
          <div className="mt-2 text-3xl font-black text-white tracking-tight">
            {currentDayTasks.length}
          </div>
        </div>

        {/* Card 2: TOTAL COMPLETES */}
        <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10b981] opacity-80" />
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Total Completes</div>
          <div className="mt-2 text-3xl font-black text-[#10b981] tracking-tight">
            {summary.totalTasksCompleted}
          </div>
        </div>

        {/* Card 3: SUCCESS STREAK */}
        <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 opacity-80" />
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Success Streak</div>
          <div className="mt-2 text-3xl font-black text-amber-500 tracking-tight flex items-baseline gap-1">
            {summary.currentStreak}
            <span className="text-xs text-slate-400 font-bold uppercase">Days</span>
          </div>
        </div>
      </div>

      {/* Consistency Graph */}
      <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#04D9C4]" />
            Consistency Graph Trend
          </h3>
          <span className="text-[9px] font-black uppercase bg-[#020e17] text-[#04D9C4] px-2 py-0.5 rounded border border-[#083047]">
            Live Feed
          </span>
        </div>

        <div className="h-[210px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressGraphData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#083047" opacity={0.4} />
              <XAxis dataKey="date" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#020e17", borderColor: "#083047", borderRadius: "10px" }}
                labelStyle={{ color: "#fff", fontWeight: "black", fontSize: "11px" }}
                itemStyle={{ color: "#04D9C4", fontSize: "11px" }}
              />
              <Line
                type="monotone"
                dataKey="Consistency Trend"
                stroke="#04D9C4"
                strokeWidth={3}
                dot={{ r: 4, fill: "#04D9C4", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-slate-500 text-center uppercase tracking-wide">
          Daily rate rating leading up to present day
        </div>
      </div>

      {/* GitHub Style Heatmap Grid Wrap */}
      <div className="rounded-xl border border-[#083047] overflow-hidden bg-[#041a27] p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          HEATMAP
        </h3>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[620px]">
            <Heatmap stats={stats} token={token} summary={summary} user={user} />
          </div>
        </div>
      </div>

    </div>
  );
}
