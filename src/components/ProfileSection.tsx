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
  TrendingUp,
  Activity
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
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-250">
      
      {/* Header and Title (Matching Image 5 exactly) */}
      <div className="space-y-1 pb-2 border-b border-slate-800/60">
        <h2 className="text-3xl font-black text-white tracking-tight">Profile Settings</h2>
        <p className="text-sm text-slate-400 font-medium">
          Control your workspace identities and system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Identity Info Card (Modeled from Screenshot 5) */}
        <div className="lg:col-span-1 rounded-xl border border-[#083047] bg-[#041a27] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-28 w-28 bg-[#04D9C4]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center space-y-4">
            {/* Avatar block with Camera picker overlay */}
            <div className="relative mx-auto h-24 w-24">
              {renderAvatar()}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 p-2 text-[#010e17] border-2 border-[#041a27] transition-all cursor-pointer shadow-lg"
                title="Upload Custom Photo"
              >
                <Camera className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-white tracking-tight">{user.username}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {user.email}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-[#020e17] px-2.5 py-1 rounded border border-[#083047]">
                <Calendar className="h-3 w-3 text-[#04D9C4]" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
              </div>
            </div>
          </div>

          {/* Quick Backdrop Theme Presets option */}
          <div className="mt-6 border-t border-slate-800/80 pt-4 text-left">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#04D9C4]" /> Customize Avatar Preset
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2 justify-center">
              {AVATAR_PRESETS.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => selectPreset(grad)}
                  className={`h-7 w-7 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer ${
                    user.profilePicture === grad ? "border-[#04D9C4] scale-110 shadow-lg" : "border-transparent"
                  }`}
                  style={{ background: grad }}
                  title={`Preset ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Credentials form and analytics highlights */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Credentials Form Card */}
          <div className="rounded-xl border border-[#083047] bg-[#041a27] p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider pb-2 border-b border-[#083047]/60 flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-[#04D9C4]" />
              Account Credentials settings
            </h3>

            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-xs text-rose-400">
                {error}
              </div>
            )}
            {msg && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs text-[#10b981]">
                {msg}
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest">
                    Username ID
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-[#083047] bg-[#020e17] px-3.5 py-2.5 text-xs text-white focus:border-[#10b981] focus:outline-none placeholder-slate-650"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest">
                    Email Address Coordinates
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#083047] bg-[#020e17] px-3.5 py-2.5 text-xs text-white focus:border-[#10b981] focus:outline-none placeholder-slate-650"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 px-5 py-2.5 text-xs font-black text-[#010e17] cursor-pointer shadow-lg shadow-[#10b981]/15 disabled:opacity-55 transition-all"
                >
                  {updating ? "Saving Coordinates..." : "Apply Updates"}
                </button>
              </div>
            </form>
          </div>

          {/* Symmetrical Core Identity Metrics Highlight strip */}
          <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-[#04D9C4]" />
              Core Performance indexes
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#020e17] rounded-lg border border-[#083047]/40 p-3 text-center">
                <span className="text-[9px] uppercase font-black text-slate-500">Consistency</span>
                <span className="text-lg font-black text-[#04D9C4] block mt-1">{visualConsistencyScore}%</span>
              </div>
              <div className="bg-[#020e17] rounded-lg border border-[#083047]/40 p-3 text-center">
                <span className="text-[9px] uppercase font-black text-slate-500">Current Run</span>
                <span className="text-lg font-black text-[#10b981] block mt-1 flex items-center justify-center gap-0.5">
                  <Flame className="h-4 w-4 fill-[#10b981]" /> {user.currentStreak}d
                </span>
              </div>
              <div className="bg-[#020e17] rounded-lg border border-[#083047]/40 p-3 text-center">
                <span className="text-[9px] uppercase font-black text-slate-500">All-time Max</span>
                <span className="text-lg font-black text-amber-500 block mt-1 flex items-center justify-center gap-0.5">
                  <Award className="h-4 w-4" /> {user.longestStreak}d
                </span>
              </div>
              <div className="bg-[#020e17] rounded-lg border border-[#083047]/40 p-3 text-center">
                <span className="text-[9px] uppercase font-black text-slate-500">Completes</span>
                <span className="text-lg font-black text-white block mt-1">{user.totalTasksCompleted}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
