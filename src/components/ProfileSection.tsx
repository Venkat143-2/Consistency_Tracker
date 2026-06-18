/**
 * @license
 * Apache-2.0
 */

import React, { useState, useRef } from "react";
import { User, Badge as BadgeType } from "../types";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Flame,
  Award,
  CheckCircle,
  Camera,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  Check
} from "lucide-react";

interface ProfileSectionProps {
  user: User;
  badges: BadgeType[];
  onUpdateProfile: (updates: { username?: string; email?: string; profilePicture?: string }) => void;
  token: string;
  consistencyScore?: number;
}

const AVATAR_PRESETS = [
  "linear-gradient(135deg, #3B82F6, #8B5CF6)", // Mystic Purple
  "linear-gradient(135deg, #10B981, #059669)", // Emerald Shine
  "linear-gradient(135deg, #F59E0B, #EF4444)", // Solar Flare
  "linear-gradient(135deg, #EC4899, #8B5CF6)", // Cyberpunk Magenta
  "linear-gradient(135deg, #22D3EE, #0369A1)", // Glacier Cyan
  "linear-gradient(135deg, #1E293B, #0F172A)", // Absolute Slate
];

export function ProfileSection({ user, badges, onUpdateProfile, consistencyScore = 78 }: ProfileSectionProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute overall consistency score or use default
  const visualConsistencyScore = user.longestStreak > 0
    ? Math.min(100, Math.round((user.currentStreak / Math.max(1, user.longestStreak)) * 100))
    : consistencyScore;

  const renderAvatar = () => {
    if (user.profilePicture.startsWith("letter:")) {
      const parts = user.profilePicture.split(":");
      const letter = parts[1] || user.username.charAt(0).toUpperCase();
      const colorClass = parts[2] || "bg-blue-600";
      return (
        <div className={`h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white border border-slate-700/50 ${colorClass}`}>
          {letter}
        </div>
      );
    } else if (user.profilePicture.startsWith("linear-gradient")) {
      return (
        <div
          className="h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white border border-slate-750"
          style={{ background: user.profilePicture }}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
      );
    } else {
      return (
        <img
          src={user.profilePicture}
          alt={user.username}
          referrerPolicy="no-referrer"
          className="h-24 w-24 rounded-2xl object-cover border border-slate-800"
        />
      );
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateProfile({ username: data.user.username, email: data.user.email });
        setMsg("Credentials updated successfully!");
      } else {
        setError(data.error || "Update failed.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result as string;
      try {
        const res = await fetch("/api/user/upload-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.id}`,
          },
          body: JSON.stringify({ profilePicture: b64 }),
        });
        if (res.ok) {
          onUpdateProfile({ profilePicture: b64 });
          setMsg("Profile picture uploaded successfully!");
        } else {
          setError("Failed to upload avatar.");
        }
      } catch {
        setError("Network failure during upload.");
      }
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = async (preset: string) => {
    try {
      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ profilePicture: preset }),
      });
      if (res.ok) {
        onUpdateProfile({ profilePicture: preset });
        setMsg("Abstract design applied to profile!");
      }
    } catch {
      setError("Failed to update avatar preset.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Upper Grid: Left User Info & Right mini stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Info Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center">
            {/* Avatar block */}
            <div className="relative mx-auto h-24 w-24">
              {renderAvatar()}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-lg bg-blue-600 hover:bg-blue-500 p-2 text-white border-2 border-slate-950 transition-all cursor-pointer"
                title="Upload Custom Photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="mt-4 text-base font-extrabold text-white">{user.username}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
            </div>
          </div>

          {/* Quick Backdrop Presets */}
          <div className="mt-6 border-t border-slate-900 pt-4 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-400" /> Choose Abstract Theme
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2 justify-center">
              {AVATAR_PRESETS.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => selectPreset(grad)}
                  className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-105 cursor-pointer ${
                    user.profilePicture === grad ? "border-white scale-110 shadow-md" : "border-slate-800"
                  }`}
                  style={{ background: grad }}
                  title={`Preset ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini Analytics Block */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              Core Identity Metrics
            </h3>
            <p className="text-xs text-slate-500">Your overall discipline tracker standings calculated up to present date</p>
          </div>

          {/* Mini Statistics Row Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-blue-600/5 border border-blue-500/10 p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Consistency</span>
              <span className="text-2xl font-black text-blue-400 block">{visualConsistencyScore}%</span>
            </div>

            <div className="rounded-xl bg-orange-600/5 border border-orange-500/10 p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Current Streak</span>
              <span className="text-2xl font-black text-orange-500 flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 fill-orange-500" />
                {user.currentStreak}d
              </span>
            </div>

            <div className="rounded-xl bg-amber-600/5 border border-amber-500/10 p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Best Streak</span>
              <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Award className="h-5 w-5" />
                {user.longestStreak}d
              </span>
            </div>

            <div className="rounded-xl bg-emerald-600/5 border border-emerald-500/10 p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Total Completed</span>
              <span className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle className="h-5 w-5" />
                {user.totalTasksCompleted}
              </span>
            </div>
          </div>

          {/* Activity Trend bar simulation */}
          <div className="mt-6 border-t border-slate-900 pt-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Activity Trend Ratio
              </span>
              <span className="text-slate-500">Rising Daily Consistency</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 rounded-l-full" style={{ width: "40%" }} title="DSA/Java Goals" />
              <div className="h-full bg-emerald-500" style={{ width: "30%" }} title="Communication Skills" />
              <div className="h-full bg-purple-500" style={{ width: "20%" }} title="Fitness Goals" />
              <div className="h-full bg-slate-705 rounded-r-full" style={{ width: "10%" }} title="Other Objectives" />
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 block" /> Tech</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 block" /> Soft Skills</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500 block" /> Physical</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-705 block" /> Reading/Other</span>
            </div>
          </div>
        </div>
      </div>

      {/* Under Grid: Update Credentials */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <UserIcon className="h-4 w-4 text-blue-500" /> Edit Profile Credentials
        </h3>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-xs text-rose-400">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs text-emerald-400">
            {msg}
          </div>
        )}

        <form onSubmit={handleUpdateInfo} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Username ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email Address Coordinates
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-55"
            >
              {updating ? "Saving Credentials..." : "Commit Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
