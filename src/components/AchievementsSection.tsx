/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { Flame, Trophy, CheckCircle2, ShieldCheck, Sparkles, BarChart3, Award, Sparkle, Info } from "lucide-react";
import { Badge } from "../types";

interface AchievementsSectionProps {
  badges: Badge[];
}

export function AchievementsSection({ badges }: AchievementsSectionProps) {
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);

  const unlockedBadges = badges.filter((b) => b.unlockedAt);

  const getIcon = (iconName: string, isBig: boolean = false) => {
    const size = isBig ? "h-12 w-12" : "h-7 w-7";
    switch (iconName) {
      case "Flame":
        return <Flame className={`${size} stroke-[1.5] text-amber-500 fill-amber-500/10`} />;
      case "Trophy":
        return <Trophy className={`${size} stroke-[1.5] text-yellow-400 fill-yellow-400/10`} />;
      case "CheckCircle2":
        return <CheckCircle2 className={`${size} stroke-[1.8] text-emerald-400`} />;
      case "ShieldCheck":
        return <ShieldCheck className={`${size} stroke-[1.5] text-blue-400 fill-blue-400/10`} />;
      case "Sparkles":
        return <Sparkles className={`${size} stroke-[1.5] text-purple-400 fill-purple-400/10`} />;
      case "BarChart3":
        return <BarChart3 className={`${size} stroke-[1.8] text-cyan-400`} />;
      case "Award":
        return <Award className={`${size} stroke-[1.5] text-indigo-400 fill-indigo-400/10`} />;
      default:
        return <Award className={`${size} stroke-[1.5] text-slate-400`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="rounded-2xl border border-emerald-950/20 bg-gradient-to-r from-emerald-950/10 to-teal-950/10 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkle className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
            Hall of Achievements
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Displaying only your earned seals of extreme consistency. Keep pushing to unlock more!
          </p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs text-emerald-400 font-extrabold uppercase shrink-0">
          🏆 {unlockedBadges.length} Badges Unlocked
        </div>
      </div>

      {unlockedBadges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 py-24 text-center space-y-3.5 max-w-lg mx-auto">
          <div className="mx-auto rounded-full bg-slate-900 border border-slate-800 p-4 w-14 h-14 flex items-center justify-center text-slate-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300">No Achievements Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Complete your daily tasks, grow streaks, and log in continuous days to unlock your first discipline insignia!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {unlockedBadges.map((b) => (
            <div
              key={b.id}
              onMouseEnter={() => setHoveredBadgeId(b.id)}
              onMouseLeave={() => setHoveredBadgeId(null)}
              className="group rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-950 hover:border-blue-500/40 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 relative select-none hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden"
            >
              {/* Animated glowing unlock background */}
              <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />

              {/* Badge Visual Container */}
              <div className="relative rounded-full border border-slate-800 bg-slate-900/60 p-5 group-hover:scale-110 group-hover:bg-slate-900 group-hover:border-blue-500/30 transition-all duration-300 shadow-md">
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                {getIcon(b.iconName, true)}
              </div>

              {/* Text metadata */}
              <div className="mt-5 space-y-1.5 z-10">
                <h4 className="text-xs font-black tracking-tight text-white group-hover:text-blue-400 transition-all">
                  {b.name}
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal max-w-[150px] mx-auto opacity-80 group-hover:opacity-100 transition-all">
                  {b.description}
                </p>
              </div>

              {/* Hover detail notification overlay */}
              {hoveredBadgeId === b.id && (
                <div className="absolute bottom-2 inset-x-2 rounded-lg bg-blue-950 border border-blue-800/40 p-1.5 flex items-center justify-center space-x-1.5 text-[8px] font-bold text-blue-300 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1 duration-155">
                  <Info className="h-3 w-3 text-blue-400" />
                  <span>Permanent Badge Identity</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
