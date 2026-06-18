/**
 * @license
 * Apache-2.0
 */

import React from "react";
import { Flame, Trophy, CheckCircle2, ShieldCheck, Sparkles, BarChart3, Award, Lock, Unlock } from "lucide-react";
import { Badge, User } from "../types";

interface MissionsSectionProps {
  badges: Badge[];
  user: User;
}

export function MissionsSection({ badges, user }: MissionsSectionProps) {
  // We can calculate precise progress scores for each badge configuration
  const getBadgeProgress = (badgeId: string) => {
    switch (badgeId) {
      case "login_streak_7":
        return {
          current: Math.max(user.currentStreak, user.longestStreak),
          target: 7,
          label: "Days logged active",
        };
      case "login_streak_100":
        return {
          current: Math.max(user.currentStreak, user.longestStreak),
          target: 100,
          label: "Days logged active",
        };
      case "streak_7":
        return {
          current: user.longestStreak,
          target: 7,
          label: "Consecutive Days Completed",
        };
      case "streak_30":
        return {
          current: user.longestStreak,
          target: 30,
          label: "Consecutive Days Completed",
        };
      case "streak_100":
        return {
          current: user.longestStreak,
          target: 100,
          label: "Consecutive Days Completed",
        };
      case "volume_7":
        return {
          current: user.totalTasksCompleted,
          target: 7,
          label: "Tasks Completed",
        };
      case "volume_100":
        return {
          current: user.totalTasksCompleted,
          target: 100,
          label: "Tasks Completed",
        };
      case "volume_500":
        return {
          current: user.totalTasksCompleted,
          target: 500,
          label: "Tasks Completed",
        };
      default:
        return {
          current: 0,
          target: 10,
          label: "Progress value",
        };
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="h-6 w-6 stroke-[2]" />;
      case "Trophy":
        return <Trophy className="h-6 w-6 stroke-[2]" />;
      case "CheckCircle2":
        return <CheckCircle2 className="h-6 w-6 stroke-[2]" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-6 w-6 stroke-[2]" />;
      case "Sparkles":
        return <Sparkles className="h-6 w-6 stroke-[2]" />;
      case "BarChart3":
        return <BarChart3 className="h-6 w-6 stroke-[2]" />;
      case "Award":
        return <Award className="h-6 w-6 stroke-[2]" />;
      default:
        return <Award className="h-6 w-6 stroke-[2]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mini Title Stats */}
      <div className="rounded-2xl border border-blue-950 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            All System Missions
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Build habits continuously to satisfy milestones and gain permanent identity rewards.
          </p>
        </div>
        <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 px-3.5 py-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider shrink-0">
          🔓 {badges.filter((b) => b.unlockedAt).length} / {badges.length} Unlocked
        </div>
      </div>

      {/* Grid of locked / unlocked badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((b) => {
          const isUnlocked = !!b.unlockedAt;
          const prog = getBadgeProgress(b.id);
          const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden select-none ${
                isUnlocked
                  ? "bg-slate-900/40 border-blue-500/30 hover:border-blue-500/60 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10"
                  : "bg-slate-950/30 border-slate-800/80 text-slate-400"
              }`}
            >
              {/* Unlock effect status header */}
              <div className="flex items-start justify-between">
                <div
                  className={`rounded-xl border p-3 ${
                    isUnlocked
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                      : "bg-slate-900/60 border-slate-850 text-slate-500"
                  }`}
                >
                  {getIcon(b.iconName)}
                </div>

                {isUnlocked ? (
                  <div className="inline-flex items-center space-x-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                    <Unlock className="h-2.5 w-2.5" />
                    <span>Unlocked</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <Lock className="h-2.5 w-2.5" />
                    <span>Locked</span>
                  </div>
                )}
              </div>

              {/* Title & info description */}
              <div className="mt-4">
                <h4 className={`text-sm font-extrabold leading-tight ${isUnlocked ? "text-white" : "text-slate-300"}`}>
                  {b.name}
                </h4>
                <p className="text-xs text-slate-500 leading-normal mt-1 min-h-[36px]">
                  {b.description}
                </p>
              </div>

              {/* Progress Bar Indicators */}
              <div className="mt-5 space-y-1.5 pt-3 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>{prog.label}</span>
                  <span className={isUnlocked ? "text-blue-400 font-bold" : "font-medium"}>
                    {prog.current} / {prog.target} ({pct}%)
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-slate-700"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
