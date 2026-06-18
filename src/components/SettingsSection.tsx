/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import {
  Settings,
  Bell,
  Trash2,
  Download,
  Moon,
  Sun,
  Clock,
  AlertTriangle,
  Compass,
  Check
} from "lucide-react";

interface SettingsSectionProps {
  user: User;
  onThemeToggle: (theme: "light" | "dark") => void;
  onUpdatePreferences: (updates: { reminderTime?: string; notificationEnabled?: boolean }) => void;
  onLogout: () => void;
  token: string;
}

export function SettingsSection({
  user,
  onThemeToggle,
  onUpdatePreferences,
  onLogout,
  token,
}: SettingsSectionProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(user.notificationEnabled);
  const [reminderTime, setReminderTime] = useState(user.reminderTime);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toggle OS Browser notification access
  const handleToggleNotifications = async (val: boolean) => {
    setNotificationEnabled(val);
    setErr("");
    setMsg("");
    
    if (val && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setErr("Notification permission was denied. Enable site notifications in browser settings.");
        setNotificationEnabled(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ notificationEnabled: val }),
      });
      if (res.ok) {
        onUpdatePreferences({ notificationEnabled: val });
        setMsg(val ? "Default browser notifications enabled." : "Notifications disabled.");
      }
    } catch {
      setErr("Failed to update preferences.");
    }
  };

  // Change notification reminder trigger clock
  const handleReminderChange = async (time: string) => {
    setReminderTime(time);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ reminderTime: time }),
      });
      if (res.ok) {
        onUpdatePreferences({ reminderTime: time });
        setMsg(`Goal alerts set to trigger at ${time}.`);
      }
    } catch {
      setErr("Failed to update reminder settings.");
    }
  };

  // Export metadata backup
  const handleExport = () => {
    window.open(`/api/user/export-data?userId=${user.id}`, "_blank", "noopener,noreferrer");
    setMsg("Export backup downloaded successfully.");
  };

  // Account annihilation
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}` },
      });
      if (res.ok) {
        onLogout();
      } else {
        setErr("An error occurred trying to delete account.");
      }
    } catch {
      setErr("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      
      {/* Upper Title Header */}
      <div className="flex items-center space-x-3.5 mb-6">
        <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-2 text-blue-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">SaaS Client Configurations</h2>
          <p className="text-xs text-slate-400">Manage user interfaces, themes, notification reminder clocks, and portability backup exports.</p>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {err}
        </div>
      )}

      {/* Grid preferences */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        
        {/* Preference Card 1: Theme selection */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 label text-slate-400">
            <Moon className="h-4 w-4 text-orange-400" /> Cohesive Vision theme
          </span>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Select standard high-contrast dark space slate mode or clinical bright daylight tracking options.
          </p>

          <div className="mt-4.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => onThemeToggle("dark")}
              className={`flex items-center justify-center space-x-2 rounded-lg border py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                user.theme === "dark"
                  ? "bg-slate-100 border-white text-slate-950"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark Space</span>
            </button>
            <button
              onClick={() => onThemeToggle("light")}
              className={`flex items-center justify-center space-x-2 rounded-lg border py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                user.theme === "light"
                  ? "bg-slate-100 border-white text-slate-950"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light Glow</span>
            </button>
          </div>
        </div>

        {/* Preference Card 2: Notifications scheduler */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 label text-slate-400">
            <Bell className="h-4 w-4 text-blue-400" /> Native Goal reminders
          </span>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Turn on Browser notification alarms and choose when site reminders trigger daily targets.
          </p>

          <div className="mt-4.5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Site Reminders Permissions</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white border border-slate-800" />
              </label>
            </div>

            {/* Select Alert intervals */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 stroke-[2]" /> Reminder Clock
              </span>
              <select
                value={reminderTime}
                disabled={!notificationEnabled}
                onChange={(e) => handleReminderChange(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM (Default)</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Backup and storage portability */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md">
        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 mb-1.5 label">
          <Compass className="h-4 w-4 text-emerald-400" /> Data Portability Exports (JSON)
        </span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Export all archived daily completions, streaks history, tasks categorizations, and settings config profiles. This files can be loaded anywhere.
        </p>
        <button
          onClick={handleExport}
          className="mt-4 rounded-lg bg-slate-900 hover:bg-slate-850 px-4 py-2.5 text-xs font-semibold border border-slate-800 hover:border-slate-700 text-white flex items-center gap-2 cursor-pointer transition-all"
        >
          <Download className="h-4 w-4" />
          Export Tracker Backup
        </button>
      </div>

      {/* Account Decimator Danger Area */}
      <div className="rounded-xl border border-rose-950/40 bg-rose-950/10 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Tragically Delete Account (Danger Zone)
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Once executed, your entire streaks logs, daily achievements, completions checklist history, and configurations settings will be deleted forever. There is no backup undoing.
        </p>

        {showDeleteConfirm ? (
          <div className="mt-4 rounded-lg bg-rose-950/20 border border-rose-900 px-4 py-3 text-xs">
            <p className="font-semibold text-rose-300">Are you absolutely sure? All record tracking collapses.</p>
            <div className="mt-3.5 flex space-x-2">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 font-bold text-white cursor-pointer"
              >
                {loading ? "Wiping account..." : "Yes, permanent delete."}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer"
              >
                Abort
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-400 cursor-pointer transition-all"
          >
            Permanently Wipe Consistency Account
          </button>
        )}
      </div>

    </div>
  );
}
