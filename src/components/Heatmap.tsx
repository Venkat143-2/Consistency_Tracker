/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { Calendar, CheckSquare, ChevronDown, Check } from "lucide-react";

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
  summary?: any;
  user?: any;
}

export function Heatmap({ stats, token, summary, user }: HeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<string>("Current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalTasks, setModalTasks] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const startYear = React.useMemo(() => {
    if (user?.createdAt) {
      return new Date(user.createdAt).getFullYear();
    }
    if (stats && stats.length > 0) {
      const years = stats.map((s) => new Date(s.date).getFullYear());
      return Math.min(...years, currentYear);
    }
    return currentYear;
  }, [user, stats, currentYear]);

  const yearsList = React.useMemo(() => {
    const list: string[] = ["Current"];
    for (let y = currentYear - 1; y >= startYear; y--) {
      list.push(String(y));
    }
    return list;
  }, [startYear, currentYear]);

  const todayDateStr = React.useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }, []);

  const createdDateStr = React.useMemo(() => {
    if (user?.createdAt) {
      try {
        const d = new Date(user.createdAt);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${date}`;
      } catch {
        return null;
      }
    }
    return null;
  }, [user]);

  const fallbackCreatedDateStr = React.useMemo(() => {
    if (stats.length === 0) return todayDateStr;
    const sortedDates = stats.map((s) => s.date).sort();
    return sortedDates[0];
  }, [stats, todayDateStr]);

  const effectiveCreatedDateStr = createdDateStr || fallbackCreatedDateStr;

  const targetYear = React.useMemo(() => {
    const today = new Date();
    return selectedYear === "Current" ? today.getFullYear() : parseInt(selectedYear);
  }, [selectedYear]);

  const isCurrentYear = React.useMemo(() => {
    return targetYear === new Date().getFullYear();
  }, [targetYear]);

  // Helper to construct aligned dates list for a specific selected year/month index
  const getMonthGridTiles = (year: number, monthIndex: number) => {
    const tiles: { date: string; isPadding: boolean; isFuture?: boolean }[] = [];
    
    // First day of the month
    const firstDay = new Date(year, monthIndex, 1);
    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Weekday of the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const startDayOfWeek = firstDay.getDay();
    
    // Add leading padding tiles for days in the first week before the 1st of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      tiles.push({
        date: `padding-start-${monthIndex}-${i}`,
        isPadding: true,
      });
    }
    
    // Add actual days of the month
    const today = new Date();
    const daysInMonth = lastDay.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, monthIndex, d);
      const offset = currDate.getTimezoneOffset();
      const adjusted = new Date(currDate.getTime() - offset * 60 * 1000);
      const dateStr = adjusted.toISOString().split("T")[0];
      
      // Check if it is a future date relative to today
      const isFuture = currDate > today;
      
      tiles.push({
        date: dateStr,
        isPadding: isFuture,
        isFuture,
      });
    }
    
    // Add trailing padding tiles to complete the last week (column)
    const remaining = tiles.length % 7;
    if (remaining > 0) {
      const padCount = 7 - remaining;
      for (let i = 0; i < padCount; i++) {
        tiles.push({
          date: `padding-end-${monthIndex}-${i}`,
          isPadding: true,
        });
      }
    }
    
    return tiles;
  };

  const monthGrids = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const list: { monthIndex: number; name: string; tiles: { date: string; isPadding: boolean; isFuture?: boolean }[] }[] = [];
    
    const today = new Date();
    const limitMonth = isCurrentYear ? today.getMonth() : 11;
    for (let m = 0; m <= limitMonth; m++) {
      list.push({
        monthIndex: m,
        name: months[m],
        tiles: getMonthGridTiles(targetYear, m),
      });
    }
    return list;
  }, [targetYear, isCurrentYear]);

  const allVisibleDates = React.useMemo(() => {
    const dates: string[] = [];
    monthGrids.forEach(mg => {
      mg.tiles.forEach(t => {
        if (!t.isPadding && !t.isFuture) {
          dates.push(t.date);
        }
      });
    });
    return dates;
  }, [monthGrids]);

  // Map dates list to completion percentage
  const statsMap = React.useMemo(() => {
    const map: Record<string, DailyStats> = {};
    stats.forEach((s) => {
      map[s.date] = s;
    });
    return map;
  }, [stats]);

  // Dynamic Metrics calculations based on selected visible year
  const yearStats = React.useMemo(() => {
    const dateSet = new Set(allVisibleDates);
    return stats.filter(s => dateSet.has(s.date));
  }, [stats, allVisibleDates]);

  const totalSubmissions = React.useMemo(() => {
    return yearStats.reduce((sum, s) => sum + s.completedTasks, 0);
  }, [yearStats]);

  const { computedActiveDays, computedMaxStreak } = React.useMemo(() => {
    if (!effectiveCreatedDateStr) {
      return { computedActiveDays: 0, computedMaxStreak: 0 };
    }

    const [startY, startM, startD] = effectiveCreatedDateStr.split("-").map(Number);
    const [endY, endM, endD] = todayDateStr.split("-").map(Number);
    
    const start = new Date(startY, startM - 1, startD);
    const end = new Date(endY, endM - 1, endD);
    
    let activeDaysCount = 0;
    let maxStrk = 0;
    let currStrk = 0;

    let curr = new Date(start);
    while (curr <= end) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, "0");
      const date = String(curr.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${date}`;

      const isCompleted = (statsMap[dateStr]?.completedTasks ?? 0) > 0;
      if (isCompleted) {
        activeDaysCount++;
        currStrk++;
        if (currStrk > maxStrk) {
          maxStrk = currStrk;
        }
      } else {
        currStrk = 0;
      }

      curr.setDate(curr.getDate() + 1);
    }

    return {
      computedActiveDays: activeDaysCount,
      computedMaxStreak: maxStrk
    };
  }, [effectiveCreatedDateStr, todayDateStr, statsMap]);

  // Color tier mapping 
  // Levels: 0-24% (default empty), 25-49%, 50-74%, 75-99%, 100%
  const getTierColor = (dateStr: string) => {
    const dayStat = statsMap[dateStr];
    if (!dayStat || dayStat.completedTasks === 0) {
      return "bg-slate-800/30 hover:bg-slate-700/60 border border-slate-905/40"; // Tier 0
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

  const rangeLabel = selectedYear === "Current" ? "the past one year" : selectedYear;

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            Consistency Grid
          </h3>
        </div>

        {/* Year Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <span>{selectedYear}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-slate-800 bg-slate-950 p-1 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {yearsList.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex items-center justify-between font-semibold cursor-pointer ${
                      selectedYear === y
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span>{y}</span>
                    {selectedYear === y && <Check className="h-3 w-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Summary bar representing the 3rd image style */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-slate-800/40 pb-4 text-xs text-slate-400">
        <div>
          Total active days: <strong className="text-white font-bold text-sm ml-1">{computedActiveDays}</strong>
        </div>
        <div>
          Max streak: <strong className="text-white font-bold text-sm ml-1">{computedMaxStreak}</strong>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2 select-none scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex flex-row items-start gap-4 pr-4 justify-start">
          {monthGrids.map((mg) => (
            <div key={mg.name} className="flex flex-col gap-2 shrink-0 items-center">
              {/* 7-row Column-first Grid for the month */}
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {mg.tiles.map(({ date: dt, isPadding }) => {
                  if (isPadding) {
                    return (
                      <div
                        key={dt}
                        className="h-[14px] w-[14px] rounded-sm bg-slate-900/10 border border-slate-950/20"
                      />
                    );
                  }
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
              
              {/* Month Label below the month's grid */}
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">
                {mg.name}
              </span>
            </div>
          ))}
        </div>

        {/* Grid Color Legend Footer */}
          <div className="mt-6 flex items-center justify-end text-[11px] text-slate-500 pr-4">
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
