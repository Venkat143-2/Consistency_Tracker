/**
 * @license
 * Apache-2.0
 */

import React from "react";
import { 
  Flame, Trophy, CheckCircle2, ShieldCheck, Sparkles, BarChart3, Award, Lock, Unlock, 
  Gem, Crown, Sprout, Zap, Shield, Dumbbell, Rocket, Star, Book, CircleCheck, Orbit,
  Check
} from "lucide-react";
import { Badge, User } from "../types";

interface MissionsSectionProps {
  badges: Badge[];
  user: User;
}

export function MissionsSection({ badges, user }: MissionsSectionProps) {
  // Extract the target value from badge ID (e.g. login_streak_15 -> 15)
  const getTargetValue = (badgeId: string): number => {
    const parts = badgeId.split("_");
    const lastPart = parts[parts.length - 1];
    return parseInt(lastPart) || 1;
  };

  // Filter and sort all missions elegantly
  const allMissions = badges
    .filter((b) => b.id.startsWith("login_") || b.id.startsWith("task_") || b.id.startsWith("cons_") || b.id.startsWith("total_"))
    .filter((b, idx, self) => self.findIndex(t => t.id === b.id) === idx)
    .sort((a, b) => {
      const getOrderScore = (id: string) => {
        if (id.startsWith("login_streak_")) return 1000 + getTargetValue(id);
        if (id.startsWith("login_")) return 2000 + getTargetValue(id);
        if (id.startsWith("cons_")) return 3000 + getTargetValue(id);
        if (id.startsWith("task_streak_")) return 4000 + getTargetValue(id);
        if (id.startsWith("task_")) return 5000 + getTargetValue(id);
        if (id.startsWith("total_")) return 6000 + getTargetValue(id);
        return 7000;
      };
      return getOrderScore(a.id) - getOrderScore(b.id);
    });

  // Calculate precise progress scores for each badge configuration dynamically
  const getBadgeProgress = (badge: Badge) => {
    const badgeId = badge.id;
    const isUnlocked = !!badge.unlockedAt;
    const targetVal = getTargetValue(badgeId);
    
    const parts = badgeId.split("_");
    const prefix = parts[0];

    if (badgeId.startsWith("login_streak_")) {
      return {
        current: isUnlocked ? targetVal : (user.currentLoginStreak || 0),
        target: targetVal,
        label: "Login Streak Progress",
      };
    } else if (badgeId.startsWith("task_streak_")) {
      return {
        current: isUnlocked ? targetVal : (user.currentTaskStreak || 0),
        target: targetVal,
        label: "Tasks Streak Progress",
      };
    } else if (prefix === "login") {
      return {
        current: isUnlocked ? targetVal : (user.currentLoginStreak || 0),
        target: targetVal,
        label: "Login Streak Progress",
      };
    } else if (prefix === "task") {
      return {
        current: isUnlocked ? targetVal : (user.currentStreak || 0),
        target: targetVal,
        label: "100% Consistency Streak",
      };
    } else if (prefix === "cons") {
      return {
        current: isUnlocked ? targetVal : (user.currentStreak || 0),
        target: targetVal,
        label: "100% Consistency Streak",
      };
    } else if (prefix === "total") {
      return {
        current: isUnlocked ? targetVal : (user.totalTasksCompleted || 0),
        target: targetVal,
        label: "Total Tasks Completed",
      };
    }

    // Fallbacks
    return {
      current: isUnlocked ? targetVal : 0,
      target: targetVal,
      label: "Progress value",
    };
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="h-5 w-5 stroke-[2]" />;
      case "Trophy":
        return <Trophy className="h-5 w-5 stroke-[2]" />;
      case "CheckCircle2":
        return <CheckCircle2 className="h-5 w-5 stroke-[2]" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-5 w-5 stroke-[2]" />;
      case "Sparkles":
        return <Sparkles className="h-5 w-5 stroke-[2]" />;
      case "BarChart3":
        return <BarChart3 className="h-5 w-5 stroke-[2]" />;
      case "Award":
        return <Award className="h-5 w-5 stroke-[2]" />;
      case "Gem":
        return <Gem className="h-5 w-5 stroke-[2]" />;
      case "Crown":
        return <Crown className="h-5 w-5 stroke-[2]" />;
      case "Sprout":
        return <Sprout className="h-5 w-5 stroke-[2]" />;
      case "Zap":
        return <Zap className="h-5 w-5 stroke-[2]" />;
      case "Shield":
        return <Shield className="h-5 w-5 stroke-[2]" />;
      case "Dumbbell":
        return <Dumbbell className="h-5 w-5 stroke-[2]" />;
      case "Rocket":
        return <Rocket className="h-5 w-5 stroke-[2]" />;
      case "Star":
        return <Star className="h-5 w-5 stroke-[2]" />;
      case "Book":
        return <Book className="h-5 w-5 stroke-[2]" />;
      case "CircleCheck":
        return <CircleCheck className="h-5 w-5 stroke-[2]" />;
      case "Galaxy":
        return <Orbit className="h-5 w-5 stroke-[2]" />;
      default:
        return <Award className="h-5 w-5 stroke-[2]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Metrics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 100% Consistency Streak */}
        <div className="rounded-xl bg-slate-900/30 border border-slate-800/80 p-5 flex items-center space-x-4">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Perfect Streak</p>
            <h4 className="text-xl font-extrabold text-white mt-1">{user.currentStreak || 0} Days</h4>
          </div>
        </div>

        {/* Total Tasks Completed */}
        <div className="rounded-xl bg-slate-900/30 border border-slate-800/80 p-5 flex items-center space-x-4">
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-blue-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tasks</p>
            <h4 className="text-xl font-extrabold text-white mt-1">{user.totalTasksCompleted || 0} Completed</h4>
          </div>
        </div>
      </div>

      {/* Missions Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMissions.map((b) => {
          const isUnlocked = !!b.unlockedAt;
          const prog = getBadgeProgress(b);
          const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden select-none flex flex-col justify-between min-h-[220px] ${
                isUnlocked
                  ? "bg-slate-900/40 border-blue-500/30 shadow-lg shadow-blue-500/5"
                  : "bg-slate-950/30 border-slate-850/80 text-slate-400"
              }`}
            >
              <div>
                {/* Header: Icon & Lock Status */}
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl border p-2.5 ${
                      isUnlocked
                        ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-500"
                    }`}
                  >
                    {getIcon(b.iconName)}
                  </div>

                  {isUnlocked ? (
                    <div className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                      <Check className="h-2.5 w-2.5" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                {/* Mission Detail */}
                <div className="mt-4">
                  <h4 className={`text-sm font-extrabold leading-tight ${isUnlocked ? "text-white" : "text-slate-300"}`}>
                    {b.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal mt-1">
                    {b.description}
                  </p>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="mt-5 space-y-1.5 pt-3 border-t border-slate-800/40">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>{prog.label}</span>
                  <span className={isUnlocked ? "text-blue-400 font-bold" : "font-medium"}>
                    {prog.current}/{prog.target}
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
