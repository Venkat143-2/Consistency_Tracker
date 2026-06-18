/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, Calendar, CheckSquare, Info } from "lucide-react";

interface DailyStats {
  id: string;
  userId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

interface HeatmapProps {
  stats: DailyStats[];
  token: string;
}

export function Heatmap({ stats, token }: HeatmapProps) {
  const [filter, setFilter] = useState<"30" | "90" | "180" | "365">("90");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalTasks, setModalTasks] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Helper to construct dates array backwards
  const getDatesRangeList = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const offset = d.getTimezoneOffset();
      const adjusted = new Date(d.getTime() - offset * 60 * 1000);
      dates.push(adjusted.toISOString().split("T")[0]);
    }
    return dates;
  };

  const activeDaysCount = parseInt(filter);
  const dateList = getDatesRangeList(activeDaysCount);

  // Map dates list to completion percentage
  const statsMap = React.useMemo(() => {
    const map: Record<string, DailyStats> = {};
    stats.forEach((s) => {
      map[s.date] = s;
    });
    return map;
  }, [stats]);

  // Color tier mapping 
  // Levels: 0-24% (default empty), 25-49%, 50-74%, 75-99%, 100%
  const getTierColor = (dateStr: string) => {
    const dayStat = statsMap[dateStr];
    if (!dayStat || dayStat.completedTasks === 0) {
      return "bg-slate-800/30 hover:bg-slate-700/60 border border-slate-900"; // Tier 0
    }
    const pct = dayStat.completionPercentage;
    if (pct < 25) {
      return "bg-blue-950/40 hover:bg-blue-950/80 border border-blue-900/30 text-blue-300"; // Tier 1
    } else if (pct < 50) {
      return "bg-blue-800/30 hover:bg-blue-800/50 border border-blue-700/30 text-blue-200"; // Tier 2
    } else if (pct < 75) {
      return "bg-blue-600/40 hover:bg-blue-600/60 border border-blue-500/40 text-blue-100"; // Tier 3
    } else if (pct < 100) {
      return "bg-blue-500 hover:bg-blue-400 border border-blue-400/50 text-white"; // Tier 4
    } else {
      return "bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/10"; // Tier 5 (100% complete!)
    }
  };

  const getPercentageString = (dateStr: string) => {
    const s = statsMap[dateStr];
    if (!s) return "0% (0 of 0 tasks)";
    return `${s.completionPercentage}% (${s.completedTasks} of ${s.totalTasks} completed)`;
  };

  // Open task inspection modal
  const handleTileClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setModalTasks(data.tasks || []);
      } else {
        setModalTasks([]);
      }
    } catch {
      setModalTasks([]);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 backdrop-blur-md">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            GitHub Style Consistency Grid
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your overall commitment. Complete all tasks on a day to light it green.
          </p>
        </div>

        {/* Heatmap Range Selection Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          {(["30", "90", "180", "365"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                filter === v
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v === "30" && "30d"}
              {v === "90" && "90d"}
              {v === "180" && "6 Months"}
              {v === "365" && "1 Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2 select-none">
        <div className="min-w-[620px]">
          {/* Main Heatmap Grid */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start">
            {dateList.map((dt) => {
              const tooltipText = `${dt}: ${getPercentageString(dt)}`;
              return (
                <div
                  key={dt}
                  onClick={() => handleTileClick(dt)}
                  title={tooltipText}
                  className={`group relative h-[14px] w-[14px] cursor-pointer rounded-sm transition-all duration-200 ${getTierColor(
                    dt
                  )}`}
                >
                  {/* Floating Micro Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex z-50 flex-col items-center">
                    <span className="whitespace-nowrap rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
                      {tooltipText}
                    </span>
                    <div className="h-1.5 w-1.5 rotate-45 bg-slate-900 border-r border-b border-slate-800 -mt-1.5"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Metadata Footer */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pr-4">
            <span className="flex items-center gap-1.5">
              <span className="text-rose-400">●</span> Recalculating live in Real-time
            </span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="h-2.5 w-2.5 rounded-sm bg-slate-800/30 border border-slate-900" />
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-950/40 border border-blue-900/30" />
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-800/30 border border-blue-700/30" />
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-600/40 border border-blue-500/40" />
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-500 border border-blue-400/50" />
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over or Modal inspection */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-all backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400 uppercase tracking-widest border border-blue-500/10">
                  Daily Habit Inspection
                </span>
                <h4 className="mt-1 text-lg font-bold text-white">
                  {selectedDate}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="rounded-lg bg-slate-900 p-1.5 text-slate-400 hover:text-white border border-slate-800/60"
              >
                &times; Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3 border border-slate-900">
                <span className="text-xs text-slate-400">Completion Score</span>
                <span className="text-sm font-bold text-emerald-400">
                  {statsMap[selectedDate]?.completionPercentage ?? 0}%
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Completed checklist details:
                </p>

                {modalLoading ? (
                  <div className="flex justify-center py-6 text-xs text-slate-500">
                    Loading daily tasks...
                  </div>
                ) : modalTasks.length === 0 ? (
                  <div className="rounded-lg bg-slate-900/30 p-4 text-center text-xs text-slate-500 border border-dashed border-slate-900">
                    No active tasks are tracked for this day.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {modalTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs border ${
                          t.completedToday
                            ? "bg-emerald-900/10 border-emerald-900/30 text-emerald-400"
                            : "bg-slate-900/40 border-slate-800/50 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className={`h-3.5 w-3.5 ${t.completedToday ? "text-emerald-400" : "text-slate-600"}`} />
                          <span className="font-semibold">{t.title}</span>
                        </div>
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500 border border-slate-800">
                          {t.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDate(null)}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
