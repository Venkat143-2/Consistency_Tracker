/**
 * @license
 * Apache-2.0
 */

import React from "react";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { Task } from "../types";

interface MappingSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  loading: boolean;
}

export function MappingSection({ tasks, onToggleTask, loading }: MappingSectionProps) {
  const categoriesList = [
    { value: "DSA", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { value: "Java", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { value: "Communication", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { value: "Aptitude", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { value: "Fitness", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { value: "Reading", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { value: "Other", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  ];

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completedToday).length;
  const pendingCount = totalCount - completedCount;

  // Calculated efficiency rate for today
  const todayPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header with Title and Dynamic radial tag & indicator (Matching screenshot 3 exactly) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Mapping</h2>
          <p className="text-sm text-slate-400 font-medium">
            Tick what you've done. Consistency updates instantly.
          </p>
        </div>
        
        {/* Today % Indicator card Badge */}
        <div className="rounded-xl border border-[#083047] bg-[#041a27] px-5 py-3 shadow-lg flex items-center gap-3 self-start sm:self-auto shrink-0 min-w-[120px] justify-between">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Today</span>
          <span className="text-xl font-black text-[#04D9C4] drop-shadow-[0_0_8px_rgba(4,217,196,0.15)]">
            {todayPercentage}%
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          Retrieving goals telemetry...
        </div>
      ) : tasks.length === 0 ? (
        /* Empty state (As modeled in screenshot 3) */
        <div className="rounded-xl border border-dashed border-[#083047] bg-[#041a27]/30 py-20 text-center text-sm text-slate-400">
          No tasks for today. Add some in Tasks.
        </div>
      ) : (
        /* Symmetrical side-by-side Columns layout (Modeled from screenshot 3) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Pending */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/65">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Pending • <span className="text-[#04D9C4]">{pendingCount}</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingCount === 0 ? (
                <div className="rounded-xl border border-dashed border-[#083047] bg-[#041a27]/10 py-10 text-center text-xs text-slate-500">
                  Nothing here.
                </div>
              ) : (
                tasks
                  .filter((t) => !t.completedToday)
                  .map((t) => {
                    const catConfig = categoriesList.find((c) => c.value === t.category);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onToggleTask(t.id)}
                        className="flex items-center justify-between rounded-xl border border-[#083047] bg-[#041a27] p-4.5 cursor-pointer hover:border-[#10b981]/20 transition-all duration-150 group active:scale-[0.99]"
                      >
                        <div className="flex items-center space-x-3.5 max-w-[85%]">
                          <div className="h-5 w-5 rounded border border-slate-700 flex items-center justify-center text-transparent group-hover:border-[#10b981] group-hover:text-[#10b981]/40 shrink-0">
                            <Circle className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-100 truncate">{t.title}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-450 bg-[#020e17] px-2 py-0.5 rounded border border-[#083047] shrink-0">
                          PENDING
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Column 2: Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/65">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Completed • <span className="text-[#10b981]">{completedCount}</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {completedCount === 0 ? (
                <div className="rounded-xl border border-dashed border-[#083047] bg-[#041a27]/10 py-10 text-center text-xs text-slate-500">
                  Nothing here.
                </div>
              ) : (
                tasks
                  .filter((t) => t.completedToday)
                  .map((t) => {
                    const catConfig = categoriesList.find((c) => c.value === t.category);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onToggleTask(t.id)}
                        className="flex items-center justify-between rounded-xl border border-[#10b981]/15 bg-emerald-950/10 p-4.5 cursor-pointer hover:border-emerald-500/25 transition-all duration-150 group active:scale-[0.99]"
                      >
                        <div className="flex items-center space-x-3.5 max-w-[85%]">
                          <div className="h-5 w-5 rounded bg-[#10b981] border border-[#10b981] flex items-center justify-center text-[#010e17] shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold line-through text-slate-500 truncate">{t.title}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-[#020e17] px-2 py-0.5 rounded border border-[#10b981]/15 shrink-0">
                          DONE
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
