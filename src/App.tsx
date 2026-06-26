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
import { User, Task, DailyStats, Badge } from "./types";
import { supabase } from "./lib/supabaseClient";
import {
  LayoutGrid,
  CheckSquare,
  BarChart3,
  User as UserIcon,
  LogOut,
  Flame,
  Bell,
  Menu,
  X,
  RefreshCcw,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  Compass,
  Trophy,
  Target,
  ChevronLeft,
  ChevronRight,
  Map
} from "lucide-react";

// Robust retry wrapper to completely avoid transient "Failed to fetch" errors
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 5, delay = 800): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err: any) {
      if (i === retries - 1) {
        throw err;
      }
      console.warn(`Fetch to ${url} failed, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Fetch to ${url} failed after ${retries} attempts.`);
};

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("ct_token");
    return (t === "undefined" || t === "null" || !t) ? null : t;
  });
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "mapping" | "analytics" | "missions" | "achievements" | "profile">("dashboard");
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
    }
  }, [sessionLoading, user, token, currentPath]);

  // Load active session with Supabase and sync with local state
  useEffect(() => {
    let mounted = true;
    const fetchSession = async () => {
      try {
        let session = null;
        try {
          const { data } = await supabase.auth.getSession();
          session = data?.session;
        } catch (supabaseErr) {
          console.warn("Supabase getSession failed, falling back to local session:", supabaseErr);
        }

        if (session?.user) {
          if (session.user.email && !session.user.email_confirmed_at) {
            console.warn("Blocked session on startup: Email is unconfirmed.");
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error("Error signing out unconfirmed user:", err);
            }
            if (mounted) {
              setToken(null);
              setUser(null);
              localStorage.removeItem("ct_token");
            }
            return;
          }

          const usernameVal = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User";
          const res = await fetchWithRetry("/api/auth/sync", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ id: session.user.id, email: session.user.email, username: usernameVal }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user && mounted) {
              setUser(data.user);
              setToken(session.access_token);
              localStorage.setItem("ct_token", session.access_token);
              await syncTrackerData(data.user.id, session.access_token);
            }
          } else if (mounted) {
            setToken(null);
            setUser(null);
            localStorage.removeItem("ct_token");
          }
        } else {
          // Local fallback using ct_token from localStorage
          const rawLocalToken = localStorage.getItem("ct_token");
          const localToken = (rawLocalToken === "undefined" || rawLocalToken === "null" || !rawLocalToken) ? null : rawLocalToken;
          if (localToken) {
            try {
              const res = await fetchWithRetry("/api/auth/me", {
                headers: { Authorization: `Bearer ${localToken}` },
              });
              if (res.ok) {
                const data = await res.json();
                if (data.user && mounted) {
                  setUser(data.user);
                  setToken(localToken);
                  await syncTrackerData(data.user.id, localToken);
                  if (mounted) {
                    setSessionLoading(false);
                  }
                  return;
                }
              }
            } catch (err) {
              console.error("Local session token validation failed:", err);
            }
          }

          if (mounted) {
            setToken(null);
            setUser(null);
            localStorage.removeItem("ct_token");
          }
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        if (mounted) {
          setSessionLoading(false);
        }
      }
    };
    fetchSession();

    // Setup an auth trace callback to keep systems fully synced reactive
    let subscription: any = null;
    try {
      const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          if (session.user.email && !session.user.email_confirmed_at) {
            console.warn("Blocked reactive session change: Email is unconfirmed.");
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error("Error signing out unconfirmed user:", err);
            }
            setUser(null);
            setToken(null);
            localStorage.removeItem("ct_token");
            return;
          }

          const usernameVal = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User";
          try {
            const res = await fetchWithRetry("/api/auth/sync", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ id: session.user.id, email: session.user.email, username: usernameVal }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setUser(data.user);
                setToken(session.access_token);
                localStorage.setItem("ct_token", session.access_token);
                await syncTrackerData(data.user.id, session.access_token);
              }
            }
          } catch (syncErr) {
            console.error("Error syncing active Supabase session with local backend:", syncErr);
          }
        } else {
          // Only clear if we aren't currently authenticating locally
          // (mock local logins won't trigger a Supabase session)
          const localToken = localStorage.getItem("ct_token");
          if (!localToken) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("ct_token");
          }
        }
      });
      subscription = authListener?.data?.subscription;
    } catch (authChangeErr) {
      console.warn("Supabase onAuthStateChange failed:", authChangeErr);
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sync tasks, metrics, badges, charts
  const syncTrackerData = async (userId: string, activeToken: string) => {
    setDataSyncing(true);
    try {
      // 1. Fetch tasks for today
      const tasksRes = await fetchWithRetry("/api/tasks", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        const rawTasks = tasksData.tasks || [];
        setTasks(rawTasks);
      }

      // 2. Fetch badges lists
      const badgesRes = await fetchWithRetry("/api/badges", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);
      }

      // 3. Fetch analytics
      const analyticsRes = await fetchWithRetry("/api/analytics", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase sign out error:", err);
    }
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
      if (res.ok) {
        const data = await res.json();
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
  const handleReorderTasks = async (reordered: Task[]) => {
    setTasks(reordered);
    const orderIds = reordered.map((t) => t.id);
    if (user && token) {
      localStorage.setItem(`ct_order_${user.id}`, JSON.stringify(orderIds));
      try {
        const res = await fetch("/api/tasks/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taskIds: orderIds }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) {
            setTasks(data.tasks);
          }
        }
      } catch (err) {
        console.error("Backend reorder sync failed:", err);
      }
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

  // Global auth routes: always accessible even if logged in (for multiple accounts, switching, etc.)
  if (currentPath === "/login") {
    return (
      <Auth
        onLoginSuccess={handleLoginSuccess}
        defaultView="login"
        onViewChange={(view) => navigateTo(view === "login" ? "/login" : "/signup")}
        onNavigateHome={() => navigateTo("/")}
      />
    );
  }
  if (currentPath === "/register" || currentPath === "/signup") {
    return (
      <Auth
        onLoginSuccess={handleLoginSuccess}
        defaultView="register"
        onViewChange={(view) => navigateTo(view === "login" ? "/login" : "/signup")}
        onNavigateHome={() => navigateTo("/")}
      />
    );
  }

  // If no sessions, render Landing Page
  if (!user || !token) {
    // Default to LandingPage for "/" or other pages
    return <LandingPage onNavigate={navigateTo} isLoggedIn={false} />;
  }

  // If already logged in, check if visiting "/":
  if (currentPath === "/") {
    return <LandingPage onNavigate={navigateTo} isLoggedIn={true} />;
  }

  // Set colors based on chosen theme: Consistent with UI design guidelines
  // Dark Theme: Deep Teal-Black #010e17, Cards #041a27, Accent Emerald #10b981.
  const isDark = user.theme === "dark";
  const bgClass = isDark ? "bg-[#010e17] text-slate-100" : "bg-[#F8FAFC] text-slate-800";
  const cardClass = isDark ? "bg-[#042130] border-[#083047] hover:border-[#10b981]/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.03)]" : "bg-white border-slate-200 hover:border-blue-500/10";
  const navbarClass = isDark ? "bg-[#010e17]/85 border-[#042130]/80" : "bg-white/80 border-slate-200/80";
  const textWhiteClass = isDark ? "text-white" : "text-slate-900";
  const textMutedClass = isDark ? "text-slate-400" : "text-slate-500";
  const hoverActiveMenuClass = isDark ? "hover:bg-[#052b3e] text-white" : "hover:bg-slate-100 text-slate-900";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${bgClass}`}>
      
      {/* Decorative Orbs inside background */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[150px]" />
          <div className="absolute bottom-1/4 left-10 -z-10 h-96 w-96 rounded-full bg-teal-500/5 blur-[150px]" />
        </>
      )}

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
            {a.type === "success" ? <Sparkles className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 text-teal-400 shrink-0" />}
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
              isDark ? "bg-[#010e17] border-[#083047] text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:text-slate-950"
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>

          {/* Logo brand */}
          <div className="flex items-center space-x-3 mb-8 justify-center md:justify-start">
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-2 text-[#04D9C4] shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-base font-black tracking-widest leading-none text-[#04D9C4]">CT</h1>
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
                      ? "bg-[#10b981] text-[#010e17] shadow-md shadow-[#10b981]/20"
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
          <div className="mt-auto border-t border-slate-800/40 pt-4">
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

              <div className="hidden sm:block select-none">
                <h2 className="text-lg font-black tracking-tight text-[#04D9C4] leading-none">
                  Consistency Tracker
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
                        Daily reminder alarm is active.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>


          {/* --- VIEW ROUTER AND PAGE MARGIN --- */}
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
            
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-250">
                
                {/* Header Date and Welcome Section */}
                <div className="space-y-4 select-none">
                  <p className="text-xs text-slate-400 font-medium tracking-wide">
                    {(() => {
                      const d = new Date();
                      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
                      const day = d.getDate();
                      const month = d.toLocaleDateString("en-US", { month: "long" });
                      const year = d.getFullYear();
                      return `${weekday}, ${day} ${month} ${year}`;
                    })()}
                  </p>
                  
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      Hello, {user.username} 👋
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">
                      Welcome back. Let's make today count.
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats Cards Grid Row (6 cards in a responsive row) */}
                {analyticsSummary && (
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 select-none">
                    
                    {/* Total Tasks */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Total Tasks</div>
                        <div className="text-2xl font-black text-white">{tasks.length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                        <LayoutGrid className="h-4.5 w-4.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Completed */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Completed</div>
                        <div className="text-2xl font-black text-white">{tasks.filter((t) => t.completedToday).length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] shrink-0">
                        <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Pending */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Pending</div>
                        <div className="text-2xl font-black text-white">{tasks.filter((t) => !t.completedToday).length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                        <Circle className="h-4.5 w-4.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Daily % */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Daily</div>
                        <div className="text-2xl font-extrabold text-[#04D9C4] drop-shadow-[0_0_8px_rgba(4,217,196,0.15)]">
                          {tasks.length > 0 ? Math.round((tasks.filter((t) => t.completedToday).length / tasks.length) * 100) : 0}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                        <Flame className="h-4.5 w-4.5 fill-emerald-500/20" />
                      </div>
                    </div>

                    {/* Monthly % */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Monthly</div>
                        <div className="text-2xl font-extrabold text-[#04D9C4]">
                          {stats.slice(-30).length > 0 ? Math.round(stats.slice(-30).reduce((sum, s) => sum + s.completionPercentage, 0) / stats.slice(-30).length) : 0}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    {/* Yearly % */}
                    <div className={`rounded-xl border p-4.5 flex items-center justify-between shadow-lg transition-all duration-300 ${cardClass}`}>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Yearly</div>
                        <div className="text-2xl font-extrabold text-[#04D9C4]">
                          {analyticsSummary.consistencyScore}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                        <BarChart3 className="h-4.5 w-4.5" />
                      </div>
                    </div>

                  </div>
                )}

                {/* ⚡ Quick Navigation Cards */}
                <div className="space-y-3.5 select-none text-left">
                  <h3 className="text-sm font-black text-white tracking-wider uppercase">Quick navigation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Tasks */}
                    <div
                      onClick={() => setActiveTab("tasks")}
                      className={`rounded-xl border p-5 cursor-pointer ease-out transition-all duration-200 active:scale-[0.985] flex flex-col justify-between aspect-video ${cardClass}`}
                    >
                      <CheckSquare className="h-5 w-5 text-teal-400 mb-3 stroke-[2.5]" />
                      <div>
                        <h5 className="text-sm font-extrabold text-white">Tasks</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Plan today's tasks</p>
                      </div>
                    </div>

                    {/* Mapping */}
                    <div
                      onClick={() => setActiveTab("mapping")}
                      className={`rounded-xl border p-5 cursor-pointer ease-out transition-all duration-200 active:scale-[0.985] flex flex-col justify-between aspect-video ${cardClass}`}
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-3 stroke-[2.5]" />
                      <div>
                        <h5 className="text-sm font-extrabold text-white">Mapping</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Mark them complete</p>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div
                      onClick={() => setActiveTab("analytics")}
                      className={`rounded-xl border p-5 cursor-pointer ease-out transition-all duration-200 active:scale-[0.985] flex flex-col justify-between aspect-video ${cardClass}`}
                    >
                      <BarChart3 className="h-5 w-5 text-teal-400 mb-3 stroke-[2.5]" />
                      <div>
                        <h5 className="text-sm font-extrabold text-white">Analytics</h5>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">See your trends</p>
                      </div>
                    </div>

                    {/* Profile */}
                    <div
                      onClick={() => setActiveTab("profile")}
                      className={`rounded-xl border p-5 cursor-pointer ease-out transition-all duration-200 active:scale-[0.985] flex flex-col justify-between aspect-video ${cardClass}`}
                    >
                      <UserIcon className="h-5 w-5 text-emerald-400 mb-3 stroke-[2.5]" />
                      <div>
                        <h5 className="text-sm font-extrabold text-white">Profile</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Account & overall</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 🎯 Active Mission & Latest Achievement row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                  
                  {/* Active Mission Card */}
                  <div className={`rounded-xl border p-5 flex items-center gap-4.5 transition-all duration-300 ${cardClass}`}>
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Target className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Active Mission</h4>
                      <p className="text-xs font-bold text-white truncate">All missions complete — legendary work.</p>
                    </div>
                  </div>

                  {/* Latest Achievement Card */}
                  <div className={`rounded-xl border p-5 flex items-center gap-4.5 transition-all duration-300 ${cardClass}`}>
                    <div className="h-10 w-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider">Latest Achievement</h4>
                      <p className="text-xs text-slate-400 truncate">
                        {badges.filter((b) => b.unlockedAt).length === 0 
                          ? "Complete tasks to unlock your first badge." 
                          : `${badges.filter((b) => b.unlockedAt).slice(-1)[0]?.name || "First badge"} unlocked 🎉`}
                      </p>
                    </div>
                  </div>

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
                user={user}
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
                consistencyScore={analyticsSummary?.consistencyScore}
                onLogout={handleLogout}
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
                <span className={`text-sm font-black uppercase tracking-wider ${textWhiteClass}`}>CT</span>
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
