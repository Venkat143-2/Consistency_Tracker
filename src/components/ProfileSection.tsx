/**
 * @license
 * Apache-2.0
 */

import React from "react";
import { User } from "../types";
import {
  User as UserIcon,
  Mail,
  Calendar,
  TrendingUp,
  Flame,
  Award,
  LogOut
} from "lucide-react";

interface ProfileSectionProps {
  user: User;
  badges?: any;
  onUpdateProfile: (updates: { username?: string; email?: string }) => void;
  token: string;
  consistencyScore?: number;
  onLogout: () => void;
}

export function ProfileSection({ user, consistencyScore, onLogout }: ProfileSectionProps) {
  // Compute overall consistency score or use default
  const visualConsistencyScore = consistencyScore !== undefined
    ? consistencyScore
    : (user.longestStreak > 0
       ? Math.min(100, Math.round((user.currentStreak / Math.max(1, user.longestStreak)) * 100))
       : 0);

  // Format date like "17 June 2026"
  const formattedJoinDate = React.useMemo(() => {
    try {
      const joinDate = new Date(user.createdAt);
      return joinDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "17 June 2026";
    }
  }, [user.createdAt]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none font-sans animate-in fade-in slide-in-from-bottom-2 duration-250 py-4">
      {/* Title */}
      <h2 className="text-4xl font-extrabold text-white tracking-tight">Profile</h2>

      {/* Main Profile Info Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#041a27]/40 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-[#04D9C4]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="divide-y divide-slate-800/60">
          {/* Username Row */}
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Username</span>
            </div>
            <span className="text-white font-bold text-sm sm:text-base">{user.username}</span>
          </div>

          {/* Email Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Email</span>
            </div>
            <span className="text-white font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{user.email}</span>
          </div>

          {/* Member Since Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Member since</span>
            </div>
            <span className="text-white font-bold text-sm sm:text-base">{formattedJoinDate}</span>
          </div>

          {/* Overall Consistency Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Overall consistency</span>
            </div>
            <span className="text-[#04D9C4] font-extrabold text-sm sm:text-base">{visualConsistencyScore}%</span>
          </div>

          {/* Max Login Streak Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Max login streak</span>
            </div>
            <span className="text-white font-bold text-sm sm:text-base">{user.longestLoginStreak || 0} Days</span>
          </div>

          {/* Completed Tasks Row */}
          <div className="flex items-center justify-between py-4 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#04D9C4]/10 text-[#04D9C4] p-2.5 border border-[#04D9C4]/10">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-slate-400 text-sm font-medium">Completed tasks</span>
            </div>
            <span className="text-white font-bold text-sm sm:text-base">{user.totalTasksCompleted || 0} Tasks</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full rounded-2xl bg-red-500/90 hover:bg-red-500 py-4.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.99] border-0"
      >
        <LogOut className="h-5 w-5 stroke-[2.5]" />
        <span>Logout</span>
      </button>
    </div>
  );
}
