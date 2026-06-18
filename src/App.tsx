/**
 * @license
 * Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import { LandingPage } from "./components/LandingPage";
import { Heatmap } from "./components/Heatmap";
import { TaskSection } from "./components/TaskSection";
import { MappingSection } from "./components/MappingSection";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { MissionsSection } from "./components/MissionsSection";
import { AchievementsSection } from "./components/AchievementsSection";
import { ProfileSection } from "./components/ProfileSection";
import { SettingsSection } from "./components/SettingsSection";
import { User, Task, DailyStats, Badge } from "./types";
import {
  LayoutGrid,
  CheckSquare,
  BarChart3,
  User as UserIcon,
  Settings,
  LogOut,
  Flame,
  Bell,
  Menu,
  X,
  RefreshCcw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Compass,
  Trophy,
  Target,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Map
} from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("ct_token"));
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "mapping" | "analytics" | "missions" | "achievements" | "profile" | "settings">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataSyncing, setDataSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ id: string; text: string; type: "info" | "success" }[]>([
    { id: "wel", text: "Consistency is is building! Set your targets and hit the fire.", type: "info" }
  ]);

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Authentication Flow Routing redirectional logic
  useEffect(() => {
    if (!sessionLoading) {
      if (!user && !token && currentPath === "/dashboard") {
        navigateTo("/login");
      }
      if (user && token && (currentPath === "/login" || currentPath === "/register")) {
        navigateTo("/dashboard");
      }
    }
  }, [sessionLoading, user, token, currentPath]);

  // Load active session
  useEffect(() => {
    const fetchSession = async () => {
      if (!token) {
        setSessionLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          // Load other core data
          await syncTrackerData(data.user.id, token);
        } else {
          // Token expired
          setToken(null);
          localStorage.removeItem("ct_token");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSession();
  }, [token]);

  // Sync tasks, metrics, badges, charts
  const syncTrackerData = async (userId: string, activeToken: string) => {
    setDataSyncing(true);
    try {
      // 1. Fetch tasks for today
      const tasksRes = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const tasksData = await tasksRes.json();
      if (tasksRes.ok) {
        const rawTasks = tasksData.tasks || [];
        const customOrder = localStorage.getItem(`ct_order_${userId}`);
        if (customOrder) {
          try {
            const idList = JSON.parse(customOrder) as string[];
            const sorted = [...rawTasks].sort((a, b) => {
              const idxA = idList.indexOf(a.id);
              const idxB = idList.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
            setTasks(sorted);
          } catch {
            setTasks(rawTasks);
          }
        } else {
          setTasks(rawTasks);
        }
      }

      // 2. Fetch badges lists
      const badgesRes = await fetch("/api/badges", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const badgesData = await badgesRes.json();
      if (badgesRes.ok) {
        setBadges(badgesData.badges || []);
      }

      // 3. Fetch analytics
      const analyticsRes = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const analyticsData = await analyticsRes.json();
      if (analyticsRes.ok) {
        setStats(analyticsData.stats || []);
        setAnalyticsSummary(analyticsData.summary);
        setCategoryDistribution(analyticsData.categoryDistribution || []);
      }

    } catch (err) {
      console.error("Failed to synchronize tracker states:", err);
    } finally {
      setDataSyncing(false);
    }
  };

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    navigateTo("/dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
    setStats([]);
    setBadges([]);
    localStorage.removeItem("ct_token");
    setActiveTab("dashboard");
    navigateTo("/");
    setAlerts([{ id: "out", text: "Logged out successfully", type: "info" }]);
  };

  // Toggle habit checkmark completion
  const handleToggleTask = async (taskId: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistically update tasks and user metric stats immediately
        setTasks(data.tasks);
        if (data.user) {
          setUser(data.user);
          
          // Trigger special completion achievements alert if completed today matches total
          const done = data.tasks.filter((t: any) => t.completedToday).length;
          const total = data.tasks.length;
          if (done === total && total > 0) {
            triggerConfettiAlert("Perfect 100% Day Completed! Your streak increased! 🔥");
          }
        }
        // Resync analytics graphs
        await syncTrackerData(user.id, token);
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const triggerConfettiAlert = (msg: string) => {
    const id = "con_" + Math.random().toString(36).substring(2, 6);
    setAlerts((prev) => [{ id, text: msg, type: "success" }, ...prev]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  // Add task
  const handleCreateTask = async (title: string, category: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category }),
      });
      if (res.ok) {
        await syncTrackerData(user.id, token);
      }
    } catch (err) {
      console.error("Create task failed:", err);
    }
  };

  // Edit task
  const handleEditTask = async (taskId: string, title: string, category: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category }),
      });
      if (res.ok) {
        await syncTrackerData(user.id, token);
      }
    } catch (err) {
      console.error("Edit task failed:", err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await syncTrackerData(user.id, token);
      }
    } catch (err) {
      console.error("Delete task failed:", err);
    }
  };

  const handleUpdateProfile = (updates: { username?: string; email?: string; profilePicture?: string }) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };
  const handleReorderTasks = (reordered: Task[]) => {
    setTasks(reordered);
    const orderIds = reordered.map((t) => t.id);
    if (user) {
      localStorage.setItem(`ct_order_${user.id}`, JSON.stringify(orderIds));
    }
  };

  const handleUpdatePreferences = (updates: { reminderTime?: string; notificationEnabled?: boolean }) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const handleThemeToggle = async (theme: "light" | "dark") => {
    if (!user || !token) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme }),
      });
      if (res.ok) {
        setUser({ ...user, theme });
      }
    } catch (err) {
      console.error("Theme toggle failed:", err);
    }
  };

  // Load custom Browser Notification APIs if 9:00 AM matches local sandbox clock
  // Mock notifications banner trigger
  useEffect(() => {
    if (user && user.notificationEnabled) {
      const checkAlarm = setInterval(() => {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // e.g. "09:00 AM"
        if (timeStr === user.reminderTime) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Consistency Tracker Reminder", {
              body: "Don't forget today's goals. Step up and lock your streaks!",
              icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            });
          }
          triggerConfettiAlert("Notification Alarm triggered! Don't forget today's goals.");
        }
      }, 60000);
      return () => clearInterval(checkAlarm);
    }
  }, [user]);

  // Loading wrapper during session validation
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans text-slate-400">
        <div className="text-center space-y-4">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wide uppercase">Initializing Consistency Dashboard...</p>
        </div>
      </div>
    );
  }

  // If no sessions, render Auth form pages (login/signup) or Landing Page
  if (!user || !token) {
    if (currentPath === "/login") {
      return (
        <Auth
          onLoginSuccess={handleLoginSuccess}
          defaultView="login"
          onViewChange={(view) => navigateTo(view === "login" ? "/login" : "/register")}
          onNavigateHome={() => navigateTo("/")}
        />
      );
    }
    if (currentPath === "/register") {
      return (
        <Auth
          onLoginSuccess={handleLoginSuccess}
          defaultView="register"
          onViewChange={(view) => navigateTo(view === "login" ? "/login" : "/register")}
          onNavigateHome={() => navigateTo("/")}
        />
      );
    }
    // Default to LandingPage for "/" or "/dashboard" (redirected by useEffect anyway)
    return <LandingPage onNavigate={navigateTo} isLoggedIn={false} />;
  }

  // If already logged in, check if visiting "/" or Auth pages:
  if (currentPath === "/") {
    return <LandingPage onNavigate={navigateTo} isLoggedIn={true} />;
  }
  if (currentPath === "/login" || currentPath === "/register") {
    // Will be auto-redirected to /dashboard by effect, but immediately render LandingPage
    return <LandingPage onNavigate={navigateTo} isLoggedIn={true} />;
  }

  // Set colors based on chosen theme: Consistent with UI design guidelines
  // Dark Theme: Background #0F172A, Cards #1E293B, Primary #3B82F6.
  // Light Theme: Background #F8FAFC, Cards #FFFFFF, Primary #2563EB.
  const isDark = user.theme === "dark";
  const bgClass = isDark ? "bg-[#0F172A] text-slate-100" : "bg-[#F8FAFC] text-slate-800";
  const cardClass = isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-slate-200";
  const navbarClass = isDark ? "bg-[#1E293B]/60 border-slate-800/80" : "bg-white/60 border-slate-200/80";
  const textWhiteClass = isDark ? "text-white" : "text-slate-900";
  const textMutedClass = isDark ? "text-slate-400" : "text-slate-500";
  const hoverActiveMenuClass = isDark ? "hover:bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-900";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${bgClass}`}>
      
      {/* Decorative Orbs inside background */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/5 blur-[150px]" />
      <div className="absolute bottom-1/4 left-10 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[150px]" />

      {/* Floating Micro toast alerts */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm">
        {alerts.map((a) => (
          <div
            key={a.id}
            onClick={() => setAlerts((prev) => prev.filter((item) => item.id !== a.id))}
            className={`cursor-pointer rounded-xl border p-4 shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
              a.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
                : "bg-slate-950/90 border-slate-800 text-slate-200"
            }`}
          >
            {a.type === "success" ? <Sparkles className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />}
            <div>
              <p className="text-xs font-bold leading-tight">{a.text}</p>
              <p className="text-[10px] opacity-60 mt-0.5">Click to dismiss card</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1">
        
        {/* --- LEFT DESKTOP SIDEBAR --- */}
        <aside className={`hidden md:flex flex-col border-r shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${cardClass} p-5 relative`}>
          {/* Collapse/Expand toggle icon button on sidebar border */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute -right-3 top-16 z-20 h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:text-slate-950"
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          {/* Logo brand */}
          <div
            onClick={() => navigateTo("/")}
            className="flex items-center space-x-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity justify-center md:justify-start"
            title="Go to Home Landing Page"
          >
            <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-2 text-blue-500 shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className={`text-sm font-black tracking-tight leading-none ${textWhiteClass}`}>Consistency</h1>
                <span className="text-[9px] text-blue-500 font-extrabold uppercase tracking-widest leading-none block mt-0.5">Tracker</span>
              </div>
            )}
          </div>

          {/* Menus link */}
          <nav className="space-y-1 select-none">
            {([
              { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
              { id: "tasks", label: "Tasks", icon: CheckSquare },
              { id: "mapping", label: "Mapping", icon: Map },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "missions", label: "Missions", icon: Target },
              { id: "achievements", label: "Achievements", icon: Trophy },
              { id: "profile", label: "Profile", icon: UserIcon },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const).map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  title={sidebarCollapsed ? menu.label : undefined}
                  className={`w-full flex items-center shrink-0 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sidebarCollapsed ? "justify-center p-3" : "space-x-3.5 px-4 py-3"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : `${textMutedClass} ${hoverActiveMenuClass}`
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!sidebarCollapsed && <span>{menu.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout segment */}
          <div className="mt-auto border-t border-slate-900/60 pt-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-950/20 cursor-pointer transition-all ${
                sidebarCollapsed ? "justify-center p-3" : "space-x-3.5 px-4 py-3"
              }`}
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && <span>Log out</span>}
            </button>
          </div>
        </aside>


        {/* --- MAIN PAGE CONTENT CONTAINER --- */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* --- TOP NAVBAR --- */}
          <header className={`sticky top-0 z-30 border-b flex items-center justify-between px-6 py-4.5 backdrop-blur-md transition-colors ${navbarClass}`}>
            <div className="flex items-center space-x-4">
              
              {/* Mobile menu hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`md:hidden rounded-lg p-2 border cursor-pointer ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-700"}`}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Welcome back</p>
                <h2 className={`text-base font-extrabold mt-1 leading-none ${textWhiteClass}`}>
                  {user.username}
                </h2>
              </div>
            </div>

            {/* Profile metric segment */}
            <div className="flex items-center space-x-4">
              
              {/* Streak Pill indicator */}
              <div className="rounded-full bg-orange-600/10 border border-orange-500/20 px-3.5 py-1.5 flex items-center space-x-2 text-xs font-extrabold text-orange-500 cursor-help" title="Consecutive completed days">
                <Flame className="h-4.5 w-4.5 shrink-0 fill-orange-500 animate-[pulse_2s_infinite]" />
                <span>{user.currentStreak} Day Streak</span>
              </div>

              {/* Notification icon alert */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`rounded-xl p-2.5 border relative cursor-pointer ${isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {user.notificationEnabled && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  )}
                </button>

                {/* Notifications dropdown */}
                {notifDropdownOpen && (
                  <div className={`absolute right-0 mt-3 w-80 rounded-xl border p-5 shadow-2xl select-none z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-900/40 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Site Alarms</h4>
                      <button onClick={() => setNotifDropdownOpen(false)} className="text-xs text-slate-500 hover:text-white">&times;</button>
                    </div>
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="rounded-lg bg-blue-600/5 p-3 border border-blue-500/10">
                        <p className="font-semibold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Daily reminding set: {user.reminderTime}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Alarm clock is tracking browser coordinates to push goal warnings.
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 text-center">
                        Toggle notifications setup in <button onClick={() => { setActiveTab("settings"); setNotifDropdownOpen(false); }} className="text-blue-500 hover:underline">Settings</button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>


          {/* --- VIEW ROUTER AND PAGE MARGIN --- */}
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
            
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* Header Date details row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-900/40 select-none">
                  <div>
                    <h3 className={`text-base font-extrabold flex items-center gap-2 ${textWhiteClass}`}>
                      Consistency Tracker
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                {/* Micro Welcome Hero Banner */}
                <div className="relative rounded-2xl border border-blue-900/15 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden backdrop-blur-md">
                  <div className="space-y-1">
                    <span className="rounded-full bg-blue-600/10 border border-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      Commitment Progress Live
                    </span>
                    <h3 className={`text-lg font-bold ${textWhiteClass}`}>
                      Hello, {user.username} 👋
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      Welcome back. Let’s make today count. Maintain disciplines, master your career path.
                    </p>
                  </div>

                  {dataSyncing && (
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-bold bg-blue-500/5 border border-blue-500/10 rounded-full px-3 py-1">
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      <span>Syncing statistics...</span>
                    </div>
                  )}
                </div>

                {/* Dashboard Stats Cards Grid Row */}
                {analyticsSummary && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 select-none">
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Total Tasks</div>
                      <div className={`mt-1.5 text-2xl font-black ${textWhiteClass}`}>
                        {tasks.length}
                      </div>
                    </div>
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Completed</div>
                      <div className="mt-1.5 text-2xl font-black text-emerald-450">
                        {tasks.filter((t) => t.completedToday).length}
                      </div>
                    </div>
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Pending</div>
                      <div className="mt-1.5 text-2xl font-black text-amber-500">
                        {tasks.filter((t) => !t.completedToday).length}
                      </div>
                    </div>
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Daily %</div>
                      <div className="mt-1.5 text-2xl font-black text-blue-500">
                        {tasks.length > 0 ? Math.round((tasks.filter((t) => t.completedToday).length / tasks.length) * 100) : 0}%
                      </div>
                    </div>
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Monthly %</div>
                      <div className="mt-1.5 text-2xl font-black text-purple-400">
                        {stats.slice(-30).length > 0 ? Math.round(stats.slice(-30).reduce((sum, s) => sum + s.completionPercentage, 0) / stats.slice(-30).length) : 0}%
                      </div>
                    </div>
                    <div className={`rounded-xl border p-4.5 ${cardClass}`}>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Yearly %</div>
                      <div className="mt-1.5 text-2xl font-black text-teal-400">
                        {analyticsSummary.consistencyScore}%
                      </div>
                    </div>
                  </div>
                )}

                {/* ⚡ Quick Navigation Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  <div
                    onClick={() => setActiveTab("tasks")}
                    className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-blue-600/5 hover:border-blue-500/20 active:scale-[0.985] ${cardClass}`}
                  >
                    <CheckSquare className="h-5 w-5 text-blue-500 mb-2" />
                    <h5 className={`text-xs font-bold ${textWhiteClass}`}>Plan today's tasks</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Tasks Page</p>
                  </div>
                  <div
                    onClick={() => setActiveTab("mapping")}
                    className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-blue-600/5 hover:border-blue-500/20 active:scale-[0.985] ${cardClass}`}
                  >
                    <Map className="h-5 w-5 text-teal-500 mb-2" />
                    <h5 className={`text-xs font-bold ${textWhiteClass}`}>Mark them complete</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Mapping Page</p>
                  </div>
                  <div
                    onClick={() => setActiveTab("analytics")}
                    className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-blue-600/5 hover:border-blue-500/20 active:scale-[0.985] ${cardClass}`}
                  >
                    <BarChart3 className="h-5 w-5 text-purple-500 mb-2" />
                    <h5 className={`text-xs font-bold ${textWhiteClass}`}>See your trends</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Analytics Page</p>
                  </div>
                  <div
                    onClick={() => setActiveTab("profile")}
                    className={`rounded-xl border p-4 cursor-pointer transition-all hover:bg-blue-600/5 hover:border-blue-500/20 active:scale-[0.985] ${cardClass}`}
                  >
                    <UserIcon className="h-5 w-5 text-indigo-500 mb-2" />
                    <h5 className={`text-xs font-bold ${textWhiteClass}`}>Account & overall</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Profile Page</p>
                  </div>
                </div>

                {/* 🎯 Active Mission Panel & Latest Achievement Panels split row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                  {/* Active Mission Panel (Celebration empty state UI) */}
                  <div className={`rounded-xl border p-5 ${cardClass} flex flex-col justify-between min-h-[180px]`}>
                    <div className="flex items-center justify-between border-b border-slate-905 pb-3">
                      <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                        🎯 Active Mission Panel
                      </span>
                      <button
                        onClick={() => setActiveTab("missions")}
                        className="text-[10px] font-bold text-blue-500 hover:underline"
                      >
                        All Missions
                      </button>
                    </div>
                    <div className="py-6 text-center space-y-2">
                      <div className="mx-auto h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Compass className="h-4 w-4 animate-spin" style={{ animationDuration: "12s" }} />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-200">All missions complete — legendary work.</h4>
                      <p className="text-[10px] text-slate-500">Every active streak milestone satisfies fully. Keep completing tasks daily!</p>
                    </div>
                  </div>

                  {/* Latest Achievement Panel */}
                  <div className={`rounded-xl border p-5 ${cardClass} flex flex-col justify-between min-h-[180px]`}>
                    <div className="flex items-center justify-between border-b border-slate-905 pb-3">
                      <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                        🏆 Latest Achievement Panel
                      </span>
                      <button
                        onClick={() => setActiveTab("achievements")}
                        className="text-[10px] font-bold text-blue-500 hover:underline"
                      >
                        Hall of Achievements
                      </button>
                    </div>
                    {badges.filter((b) => b.unlockedAt).length === 0 ? (
                      <div className="py-6 text-center space-y-2 text-slate-500 text-[10px]">
                        <Trophy className="h-6 w-6 text-slate-650 mx-auto" />
                        <p>Complete tasks to unlock your first badge.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 py-2">
                        {badges.filter((b) => b.unlockedAt).slice(-1).map((b) => (
                          <div key={b.id} className="flex items-center space-x-3.5 bg-blue-600/5 p-3 rounded-xl border border-blue-500/10">
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 shrink-0">
                              <Trophy className="h-5 w-5" />
                            </div>
                            <div className="truncate">
                              <p className={`text-xs font-black text-slate-100 truncate`}>{b.name}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{b.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Contributions Map */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/20 overflow-hidden">
                  <Heatmap stats={stats} token={token} />
                </div>

              </div>
            )}

            {activeTab === "tasks" && (
              <TaskSection
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onReorderTasks={handleReorderTasks}
                loading={dataSyncing}
              />
            )}

            {activeTab === "mapping" && (
              <MappingSection
                tasks={tasks}
                onToggleTask={handleToggleTask}
                loading={dataSyncing}
              />
            )}

            {activeTab === "analytics" && analyticsSummary && (
              <AnalyticsSection
                stats={stats}
                summary={analyticsSummary}
                categoryDistribution={categoryDistribution}
                currentDayTasks={tasks}
                token={token}
              />
            )}

            {activeTab === "missions" && (
              <MissionsSection
                badges={badges}
                user={user}
              />
            )}

            {activeTab === "achievements" && (
              <AchievementsSection
                badges={badges}
              />
            )}

            {activeTab === "profile" && (
              <ProfileSection
                user={user}
                badges={badges}
                onUpdateProfile={handleUpdateProfile}
                token={token}
              />
            )}

            {activeTab === "settings" && (
              <SettingsSection
                user={user}
                onThemeToggle={handleThemeToggle}
                onUpdatePreferences={handleUpdatePreferences}
                onLogout={handleLogout}
                token={token}
              />
            )}

          </main>
        </div>

      </div>

      {/* --- MOBILE DRAW SLIDER MENU --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-xs select-none">
          <div className={`w-64 max-w-xs h-full flex flex-col p-6 animate-in slide-in-from-left duration-200 ${cardClass}`}>
            
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-900/40">
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo("/");
                }}
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Go to Home Landing Page"
              >
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <span className={`text-sm font-bold ${textWhiteClass}`}>Consistency</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className={`rounded-xl p-1.5 border hover:text-white cursor-pointer ${isDark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-700"}`}>
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
                { id: "tasks", label: "Tasks", icon: CheckSquare },
                { id: "mapping", label: "Mapping", icon: Map },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "missions", label: "Missions", icon: Target },
                { id: "achievements", label: "Achievements", icon: Trophy },
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((menu) => {
                const Icon = menu.icon;
                const isActive = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => {
                      setActiveTab(menu.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                        : `${textMutedClass} ${hoverActiveMenuClass}`
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-900/60 pt-5 pr-2">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-950/20 cursor-pointer transition-all`}
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span>Log out</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
