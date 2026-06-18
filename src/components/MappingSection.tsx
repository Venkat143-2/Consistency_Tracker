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

  return (
    <div className="space-y-6">
      {/* Mini Info Card Banner */}
      <div className="rounded-2xl border border-blue-900/10 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Daily Execution Space (Mapping)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Focus purely on execution. Mark scheduled actions completed or leave them pending. Actions translate directly into streaks!
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <div className="text-right">
            <span className="text-slate-500 block text-[10px] uppercase">Marked Ratio</span>
            <span className="text-white text-sm font-extrabold">{completedCount}/{totalCount} Done</span>
          </div>
        </div>
      </div>

      {/* Grid checklist style of mapping */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
              Active Daily Goal Mapping
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Toggle checkboxes to register progress for today</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400">
              ✔️ {completedCount} Completed
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-400">
              ❌ {pendingCount} Pending
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Fetching active goal definitions...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center text-xs text-slate-500">
            No items defined in Tasks section. Go to Tasks Section to create some goals first!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((t) => {
              const isChecked = t.completedToday;
              const catConfig = categoriesList.find((c) => c.value === t.category);

              return (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className={`flex items-center justify-between rounded-xl border p-4.5 cursor-pointer select-none transition-all duration-150 group hover:scale-[1.01] ${
                    isChecked
                      ? "bg-emerald-950/10 border-emerald-500/30 shadow-xs shadow-emerald-500/5 text-slate-400"
                      : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30 text-white"
                  }`}
                >
                  <div className="flex items-center space-x-4 max-w-[80%]">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : "border-slate-700 group-hover:border-amber-500 bg-slate-950 text-transparent"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-500 group-hover:text-amber-500" />
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-bold leading-snug transition-all ${
                          isChecked ? "line-through text-slate-500 font-medium" : "text-white"
                        }`}
                      >
                        {t.title}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                          catConfig?.color || "text-slate-400 bg-slate-900"
                        }`}
                      >
                        {t.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isChecked ? (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                        COMPLETED ✔️
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-sm">
                        PENDING ❌
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
