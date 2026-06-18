/**
 * @license
 * Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Flame,
  Trophy,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Lock,
  Moon,
  Sun,
  Star,
  Zap,
  Check,
  Plus,
  Compass,
  Sparkles,
  Award,
  ChevronRight,
  Sparkle
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

export function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  // Theme Toggle: Defaults to true (dark theme) for maximum developer aesthetic, allows toggle
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("cl_theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("cl_theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Interactive Live Hero Preview Task list state
  const [heroTasks, setHeroTasks] = useState([
    { id: 1, title: "Solve DSA & study algorithms", completed: false, category: "DSA" },
    { id: 2, title: "Complete cardio & running", completed: true, category: "Fitness" },
    { id: 3, title: "Read 10 pages of Atomic Habits", completed: false, category: "Reading" },
  ]);

  const [interactiveStreak, setInteractiveStreak] = useState(12);
  const [showCelebration, setShowCelebration] = useState(false);

  // Toggle tasks in the interactive hero mock
  const handleToggleHeroTask = (id: number) => {
    setHeroTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      const allDone = updated.every((t) => t.completed);
      if (allDone) {
        setInteractiveStreak(13);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      } else {
        setInteractiveStreak(12);
      }
      return updated;
    });
  };

  // Prepare a dynamic mock heatmap for visualization
  const mockHeatmapCells = Array.from({ length: 48 }).map((_, i) => {
    // Generate different activity scores for visual texture
    const levels = [0, 15, 30, 45, 75, 100];
    const isToday = i === 47;
    // Base simulation level
    let val = levels[(i * 3 + 2) % levels.length];
    
    // Connect user checking off list live to today cell!
    if (isToday) {
      const completedCount = heroTasks.filter((t) => t.completed).length;
      val = Math.round((completedCount / heroTasks.length) * 100);
    }
    return val;
  });

  // Calculate dynamic consistency percentage based on hero mock state
  const completedCount = heroTasks.filter((t) => t.completed).length;
  const currentWeekConsistency = Math.round((completedCount / heroTasks.length) * 100);

  // Social Proof list placeholders
  const partners = [
    { name: "GitLab", icon: Star, text: "★★★★★ Rating" },
    { name: "Notion", icon: Sparkles, text: "Featured Choice" },
    { name: "VS Code", icon: Compass, text: "Core Extension" },
    { name: "Duolingo", icon: Trophy, text: "Habit Inspiration" },
  ];

  // How it works steps
  const steps = [
    {
      num: "01",
      title: "Pin Your Habits",
      desc: "Categorize targets like DSA, Fitness, or Java and organize priority order dynamically.",
    },
    {
      num: "02",
      title: "Check-in Daily",
      desc: "Complete checklists easily anywhere, backed up via cloud server storage nodes instantly.",
    },
    {
      num: "03",
      title: "Level Up System",
      desc: "Claim certified discipline badges, watch your heatmap glow, and establish a permanent legacy.",
    },
  ];

  // Theme-based class styling maps
  const bgThemeClass = isDark
    ? "bg-[#090D1A] text-slate-150"
    : "bg-[#F8FAFC] text-slate-800";

  const cardThemeClass = isDark
    ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md hover:border-slate-700/80"
    : "bg-white/80 border-slate-200/90 backdrop-blur-md hover:border-slate-350";

  const textHeadingTheme = isDark ? "text-white" : "text-slate-900";
  const textMutedTheme = isDark ? "text-slate-400" : "text-slate-500";
  const borderSubtleTheme = isDark ? "border-slate-800/60" : "border-slate-200/80";

  return (
    <div className={`min-h-screen ${bgThemeClass} font-sans relative overflow-x-hidden transition-colors duration-500`}>
      
      {/* 🚀 DECORATIVE FLOATING ORBS/ACCENTS */}
      <div className="absolute top-0 right-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/4 left-[-15%] -z-10 h-[600px] w-[600px] rounded-full bg-indigo-500/8 blur-[160px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[10%] right-[-10%] -z-10 h-[450px] w-[450px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* 🧭 PREMIUM SaaS NAVIGATION HEADER */}
      <header className={`sticky top-0 z-50 ${isDark ? "bg-[#090D1A]/85 border-slate-800/50" : "bg-white/85 border-slate-200/60"} backdrop-blur-md border-b px-6 py-3.5 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("/")}>
            <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-2 text-blue-500 shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className={`text-sm font-black tracking-tight leading-none ${textHeadingTheme}`}>Consistency</h1>
              <span className="text-[9px] text-blue-500 font-extrabold uppercase tracking-widest leading-none block mt-0.5">Tracker</span>
            </div>
          </div>

          {/* Quick Anchor Navigate links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <a href="#features" className={`hover:text-blue-500 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>Features</a>
            <a href="#workflow" className={`hover:text-blue-500 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>How It Works</a>
            <a href="#preview" className={`hover:text-blue-500 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>Dashboard</a>
            <a href="#badges" className={`hover:text-blue-500 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>Gamification</a>
          </nav>

          {/* Controller and Access Buttons */}
          <div className="flex items-center space-x-4">
            
            {/* Interactive Theme Switcher Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`rounded-lg p-2 border ${isDark ? "border-slate-800 bg-slate-900/60 text-yellow-400 hover:bg-slate-850" : "border-slate-250 bg-white text-slate-700 hover:bg-slate-50"} cursor-pointer transition-all duration-300`}
              aria-label="Theme Switcher"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => onNavigate("/dashboard")}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/10 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Dashboard Home</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("/login")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer hover:bg-slate-50 border border-transparent ${isDark ? "text-slate-300 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("/register")}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4.5 py-2 text-xs font-black text-white shadow-xl shadow-blue-500/15 transition-all cursor-pointer hover:scale-[1.03]"
                >
                  Join Free
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 🚀 1. HERO SECTION (MOST IMPORTANT) */}
      <section className="relative pt-12 md:pt-20 pb-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Copywriting Details */}
        <div className="lg:col-span-6 space-y-6 text-left relative z-10">
          
          {/* Micro Ribbon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center space-x-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${
              isDark ? "bg-blue-950/40 border-blue-800/40 text-blue-400" : "bg-blue-50 border-blue-105 text-blue-600"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-505 shrink-0" />
            <span>Habit Tracking Evolved</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] ${textHeadingTheme}`}
          >
            Build Discipline. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400">
              Stay Consistent.
            </span>
          </motion.h1>

          {/* Subtext Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-sm sm:text-base leading-relaxed max-w-lg ${textMutedTheme}`}
          >
            Track your daily tasks, build unstoppable streaks, and visualize your progress over time. Join the gamified productivity dashboard styled like GitHub contributions to conquer your milestones.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4"
          >
            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/register")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 py-4 text-xs font-black uppercase tracking-wider shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")}
              className={`rounded-xl border px-7 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5 ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span>View Dashboard</span>
            </button>
          </motion.div>

          {/* Quick Value Metrics */}
          <div className={`pt-6 border-t ${borderSubtleTheme} flex items-center space-x-8 text-left select-none`}>
            <div>
              <span className={`text-xl font-black block leading-none ${textHeadingTheme}`}>100%</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Free Client App</span>
            </div>
            <div>
              <span className={`text-xl font-black block leading-none ${textHeadingTheme}`}>10+</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Visual Themes</span>
            </div>
            <div>
              <span className={`text-xl font-black block leading-none ${textHeadingTheme}`}>24/7</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Streak Backup</span>
            </div>
          </div>

        </div>

        {/* Right Side Visual Live Mockup Panel */}
        <div className="lg:col-span-6 relative z-10">
          
          {/* Ambient gradient glowing background backing card shadow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-cyan-500/10 rounded-3xl blur-2xl" />

          {/* Live mock board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden backdrop-blur-lg select-none ${
              isDark ? "bg-[#0c1224]/80 text-white" : "bg-white/95 text-slate-850"
            }`}
          >
            {/* Celebration popup effect */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-x-4 top-4 z-30 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-650 border border-emerald-500/50 p-4 shadow-xl flex items-center justify-between text-white"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-white/20 p-2">
                      <Trophy className="h-5 w-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">100% Core Unlocked!</h4>
                      <p className="text-[10px] opacity-90 mt-0.5">Consecutive Streak record expanded to 13 Days!</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 stroke-[2.5] text-emerald-300" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard Mock Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${borderSubtleTheme}`}>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-red-500 rounded-full" />
                <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                <div className="h-3 w-3 bg-green-500 rounded-full" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-2">
                  Interactivity Station
                </span>
              </div>
              
              {/* Dynamic fire streak badge indicator */}
              <motion.div
                key={interactiveStreak}
                initial={{ scale: 0.85 }}
                animate={{ scale: [1, 1.15, 1] }}
                className="rounded-full bg-orange-600/10 border border-orange-500/20 px-3 py-1 flex items-center space-x-1.5 text-[10px] font-black text-orange-500 uppercase tracking-wider cursor-pointer"
                title="Click tasks below to grow your streak!"
              >
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                <span>{interactiveStreak} Day Streak</span>
              </motion.div>
            </div>

            {/* Live Interactive Task Checklist */}
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Today's Habit checklist to test
                </span>
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">
                  {completedCount} of {heroTasks.length} Done
                </span>
              </div>

              <div className="space-y-2">
                {heroTasks.map((t) => {
                  return (
                    <motion.div
                      key={t.id}
                      onClick={() => handleToggleHeroTask(t.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        t.completed
                          ? "bg-emerald-950/5 border-emerald-950/20 text-slate-450"
                          : isDark
                          ? "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                          : "bg-slate-50 border-slate-150 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div
                          className={`h-4.5 w-4.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                            t.completed
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-600"
                          }`}
                        >
                          {t.completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-semibold truncate ${
                          t.completed ? "line-through text-slate-500" : isDark ? "text-slate-100" : "text-slate-800"
                        }`}>
                          {t.title}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border tracking-widest ${
                        t.category === "DSA"
                          ? "bg-blue-600/10 border-blue-500/20 text-blue-400"
                          : t.category === "Fitness"
                          ? "bg-rose-600/10 border-rose-500/20 text-rose-400"
                          : "bg-purple-600/10 border-purple-500/20 text-purple-400"
                      }`}>
                        {t.category}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Heatmap demo indicator */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-left">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-505" /> Grid Map Contribution Index
                </span>
                <span>Consistency Rate: {currentWeekConsistency}%</span>
              </div>

              {/* Dynamic Heatmap cells */}
              <div className="grid grid-cols-12 gap-1 relative">
                {mockHeatmapCells.map((val, idx) => {
                  let bgCellClass = "bg-slate-900 border border-slate-950 hover:bg-slate-850";
                  if (val > 0 && val <= 33) {
                    bgCellClass = "bg-blue-950/40 border border-blue-900/30 text-blue-400";
                  } else if (val > 33 && val <= 66) {
                    bgCellClass = "bg-blue-600/40 border border-blue-500/30 text-blue-300";
                  } else if (val > 66) {
                    bgCellClass = "bg-blue-500 border border-blue-400 text-white shadow-md shadow-blue-500/10";
                  }
                  return (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-2xs transition-all pointer-events-none ${bgCellClass}`}
                      title={`Cell value: ${val}%`}
                    />
                  );
                })}
              </div>
            </div>

          </motion.div>

        </div>

      </section>

      {/* 🚀 2. SOCIAL PROOF / TRUST STRIP */}
      <section className={`py-10 border-t border-b ${borderSubtleTheme} select-none overflow-hidden relative`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className={`text-[10px] uppercase font-black tracking-widest ${textMutedTheme}`}>
            Built for students, developers, and creators
          </p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-12 text-xs font-bold text-slate-400">
            {partners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-2.5 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <div className="rounded-lg bg-blue-600/5 p-1.5 border border-blue-500/10">
                    <Icon className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-xs leading-none ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                      {partner.name}
                    </span>
                    <span className="text-[8px] text-slate-500 block leading-none mt-0.5 font-semibold uppercase tracking-wider">
                      {partner.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🚀 3. FEATURES SECTION (VERY VISUAL BENTO STYLE) */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        
        {/* Features header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest bg-blue-600/10 border border-blue-500/15 py-1 px-3.5 rounded-full">
            Unleash High Performance
          </span>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${textHeadingTheme}`}>
            Engineered with modern habits science.
          </h2>
          <p className={`text-xs sm:text-sm ${textMutedTheme}`}>
            Maintain control over priorities, study hours, and athletic routines using four primary tracking quadrants.
          </p>
        </div>

        {/* Feature Cards Grid (4 detailed modules) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card 1: Task Tracking */}
          <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-2xl border p-6 flex flex-col justify-between group ${cardThemeClass} transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-3 text-blue-500 w-fit group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className={`text-base font-extrabold ${textHeadingTheme}`}>Task Tracking</h3>
              <p className={`text-xs leading-relaxed ${textMutedTheme}`}>
                Add, edit, and reorder tasks. Maintain custom sequences with our robust, drag & drop interface that immediately saves your layout.
              </p>
            </div>
            {/* Visual preview */}
            <div className="mt-6 rounded-xl border border-dashed border-slate-700/50 bg-slate-950/20 p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                <span>UI Mock Sequence</span>
              </div>
              <div className="rounded border border-slate-805/40 bg-slate-900/40 px-2 py-1.5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">☰ Code 2 LeetCode problems</span>
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[8px] bg-blue-500/10 border border-blue-500/15 py-0.5 px-1 rounded">DSA</span>
              </div>
              <div className="rounded border border-emerald-905/40 bg-emerald-950/5 px-2 py-1.5 flex items-center justify-between text-[10px] opacity-70">
                <span className="line-through text-slate-500">☰ Technical blog layout</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px] bg-emerald-500/10 border border-emerald-500/15 py-0.5 px-1 rounded">Java</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Streak System */}
          <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-2xl border p-6 flex flex-col justify-between group ${cardThemeClass} transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
            <div className="space-y-4">
              <div className="rounded-xl bg-orange-600/10 border border-orange-500/20 p-3 text-orange-500 w-fit group-hover:scale-110 transition-transform">
                <Flame className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className={`text-base font-extrabold ${textHeadingTheme}`}>Streak Protection</h3>
              <p className={`text-xs leading-relaxed ${textMutedTheme}`}>
                Unstoppable continuity. Expand Consecutive Completed Days indices and receive streak alerts so you never break your active chain.
              </p>
            </div>
            {/* Visual preview */}
            <div className="mt-6 rounded-xl border border-dashed border-slate-700/50 bg-slate-950/20 p-3.5 flex items-center justify-between">
              <div>
                <span className={`block text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>18 Days</span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Longest Streak Achievement</span>
              </div>
              <div className="relative h-11 w-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500 animate-[bounce_2s_infinite]" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Analytics */}
          <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-2xl border p-6 flex flex-col justify-between group ${cardThemeClass} transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
            <div className="space-y-4">
              <div className="rounded-xl bg-purple-600/10 border border-purple-500/20 p-3 text-purple-500 w-fit group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className={`text-base font-extrabold ${textHeadingTheme}`}>Metrics & Heatmaps</h3>
              <p className={`text-xs leading-relaxed ${textMutedTheme}`}>
                Visualize habits with premium line graphs and full contributions grid maps. Easily check daily efficiency patterns from your account dashboard.
              </p>
            </div>
            {/* Visual preview */}
            <div className="mt-6 rounded-xl border border-dashed border-slate-700/50 bg-slate-950/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold">Progress Rate Index</span>
                <span className="text-purple-400 font-extrabold">92% Average</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Missions & Rewards */}
          <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-2xl border p-6 flex flex-col justify-between group ${cardThemeClass} transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-3 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className={`text-base font-extrabold ${textHeadingTheme}`}>Milestone Gamification</h3>
              <p className={`text-xs leading-relaxed ${textMutedTheme}`}>
                Satisfy system milestones to reveal permanent rewards. Display unlocked insignia and badges to represent your high standards of consistency.
              </p>
            </div>
            {/* Visual preview */}
            <div className="mt-6 rounded-xl border border-dashed border-slate-700/50 bg-slate-950/20 p-3.5 flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-emerald-600/10 border border-emerald-500/20 py-2 px-2.5 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className={`block text-xs font-black ${isDark ? "text-slate-205" : "text-slate-800"}`}>Gold Seal of Honor</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Missions Reward Badge</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/15 py-0.5 px-2 rounded-full border border-emerald-500/20">Unlocked</span>
            </div>
          </motion.div>

        </div>

      </section>

      {/* 🚀 4. HOW IT WORKS (3 STEPS SEQUENCE) */}
      <section id="workflow" className={`py-20 border-t ${borderSubtleTheme} relative overflow-hidden select-none`}>
        
        {/* Floating gradient circle background */}
        <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-[10px] text-blue-505 font-extrabold uppercase tracking-widest block">Systemized Execution</span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${textHeadingTheme}`}>
              Three-step roadmap to mastery.
            </h2>
            <p className={`text-xs sm:text-sm ${textMutedTheme}`}>
              Establishing lifelong discipline is incredibly natural using our straightforward, sequential workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Connection Line on Desktop */}
            <div className="hidden md:block absolute top-[44%] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-600/35 via-indigo-650/40 to-cyan-505/35 -z-10" />

            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between ${cardThemeClass} transition-all duration-300 relative group overflow-hidden`}
              >
                <div className="absolute top-[-10%] right-[-10%] text-6xl font-black text-blue-500/5 leading-none select-none pointer-events-none">
                  {step.num}
                </div>
                
                <div className="space-y-4">
                  {/* Step Hexagon Header */}
                  <div className="rounded-xl bg-blue-600/10 border border-blue-505/20 px-3 py-1.5 text-xs font-black text-blue-400 w-fit uppercase tracking-widest">
                    Step {step.num}
                  </div>
                  
                  <h3 className={`text-sm font-extrabold tracking-tight pt-1 ${textHeadingTheme}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${textMutedTheme}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* 🚀 5. DASHBOARD PREVIEW SECTION (INTERACTIVE LAYOUT DETAILS) */}
      <section id="preview" className={`py-20 px-6 max-w-7xl mx-auto space-y-12`}>
        
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest bg-indigo-550/10 border border-indigo-500/20 py-1 px-3.5 rounded-full">
            The Live Interface Hub
          </span>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${textHeadingTheme}`}>
            Experience your visual headquarters.
          </h2>
          <p className={`text-xs sm:text-sm ${textMutedTheme}`}>
            This realistic representation simulates how active statistics accumulate and scale immediately upon task completions.
          </p>
        </div>

        {/* Dashboard Preview Card Layout container */}
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl relative select-none ${cardThemeClass}`}>
          
          {/* Header Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800/80 mb-6">
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/20 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-500">Cumulative Task Load</span>
              <span className={`text-xl font-black block mt-1 ${textHeadingTheme}`}>14</span>
            </div>
            <div className="rounded-xl border border-slate-850 bg-slate-950/25 p-4 text-center text-emerald-450">
              <span className="text-[9px] uppercase font-bold text-slate-500">Today Accomplished</span>
              <span className="text-xl font-black block mt-1 text-emerald-400">11</span>
            </div>
            <div className="rounded-xl border border-slate-850 bg-slate-950/25 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-500">Consecutive Daily Run</span>
              <span className="text-xl font-black block mt-1 text-orange-500">12 Days</span>
            </div>
            <div className="rounded-xl border border-slate-850 bg-slate-950/25 p-4 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-550">Consistency Performance</span>
              <span className="text-xl font-black block mt-1 text-blue-400">89% Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side mock tasks */}
            <div className="lg:col-span-5 space-y-3.5 text-left">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5 pb-1 block border-b border-slate-800">
                ⚙️ Goal Directives Panel
              </span>

              <div className="space-y-2">
                <div className="rounded-lg border border-slate-800/50 bg-slate-900/10 px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-blue-500 rounded-full" /> Study advanced Java Arrays
                  </span>
                  <span className="text-[8px] border border-blue-500/20 bg-blue-500/5 text-blue-400 uppercase font-black px-1 rounded">Java</span>
                </div>
                <div className="rounded-lg border border-slate-800/50 bg-slate-900/10 px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-indigo-500 rounded-full" /> Reorganize Aptitude notes
                  </span>
                  <span className="text-[8px] border border-indigo-500/20 bg-indigo-505/5 text-indigo-400 uppercase font-black px-1 rounded">Aptitude</span>
                </div>
                <div className="rounded-lg border border-slate-800/50 bg-slate-905 px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-500 opacity-60">
                  <span className="flex items-center gap-2 line-through">
                    <span className="h-3 w-3 bg-emerald-500 rounded-full" /> Perform daily cardio workout
                  </span>
                  <span className="text-[8px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-450 uppercase font-black px-1 rounded">Fitness</span>
                </div>
              </div>
            </div>

            {/* Right side charts/heatmap preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/20 p-4 text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800/60 mb-2 font-bold uppercase tracking-wider">
                  <span>📈 Line chart tracking ratio</span>
                  <span className="text-blue-400">89% Target index reached</span>
                </div>
                
                {/* SVG mock graph */}
                <div className="h-[90px] w-full mt-2 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 100">
                    <path
                      d="M 10 70 Q 100 20, 200 60 T 390 10"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                    />
                    <circle cx="390" cy="10" r="5" fill="#3B82F6" />
                    <circle cx="200" cy="60" r="4" fill="#3b82f6" />
                    <circle cx="100" cy="20" r="4" fill="#3b82f6" />
                  </svg>
                </div>
              </div>

              {/* Mock contribution cells timeline row */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/20 p-4 text-left">
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider pb-2 border-b border-slate-800/60 mb-3 flex items-center justify-between">
                  <span>📅 Calendar Map Contributions Log</span>
                  <span className="text-[9px] text-slate-550">Last 7 Weeks</span>
                </div>
                
                <div className="grid grid-cols-12 gap-1.5">
                  {Array.from({ length: 48 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-none ${
                        idx % 3 === 0
                          ? "bg-blue-600 border border-blue-500/20"
                          : idx % 4 === 0
                          ? "bg-blue-900/60 border border-blue-800/20"
                          : "bg-slate-900"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 🚀 6. GAMIFICATION SECTION */}
      <section id="badges" className={`py-20 border-t ${borderSubtleTheme} relative select-none overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest bg-blue-600/10 border border-blue-505/20 py-1 px-3.5 rounded-full">
              Gamified Accolades
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${textHeadingTheme}`}>
              Earn insignia. Unlock permanent pride.
            </h2>
            <p className={`text-xs sm:text-sm ${textMutedTheme}`}>
              Satisfy streak multipliers and task volumes to convert locked grey containers into vibrant glowing trophies.
            </p>
          </div>

          {/* Grid of Badges */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            
            {/* Badge 1: 🔥 7 Day Streak */}
            <div className={`rounded-2xl border p-5 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden backdrop-blur-md ${isDark ? "bg-slate-900/30 border-blue-500/20 hover:border-blue-500/40" : "bg-white/90 border-slate-205 hover:border-blue-400"} shadow-lg shadow-blue-500/5`}>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />
              <div className="relative rounded-full border border-orange-500/20 bg-orange-500/10 p-4.5 mb-4 text-orange-500">
                <Flame className="h-7 w-7 fill-orange-500/10 text-orange-500 animate-pulse" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${textHeadingTheme}`}>🔥 7 Day Streak</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">UNLOCKED</p>
            </div>

            {/* Badge 2: 🏆 30 Day Streak */}
            <div className={`rounded-2xl border p-5 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden backdrop-blur-md ${isDark ? "bg-slate-900/30 border-blue-500/20 hover:border-blue-500/40" : "bg-white/90 border-slate-205 hover:border-blue-400"} shadow-lg shadow-blue-500/5`}>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-550" />
              <div className="relative rounded-full border border-yellow-500/20 bg-yellow-500/10 p-4.5 mb-4 text-yellow-500">
                <Trophy className="h-7 w-7 fill-yellow-500/10 text-yellow-500" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${textHeadingTheme}`}>🏆 30 Day Streak</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">UNLOCKED</p>
            </div>

            {/* Badge 3: 👑 100 Day Streak */}
            <div className={`rounded-2xl border bg-slate-950/40 border-slate-900/80 p-5 flex flex-col items-center text-center relative overflow-hidden opacity-50 select-none group hover:opacity-70 transition-all duration-300`}>
              {/* Blur backdrop */}
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs z-10" />
              
              <div className="relative rounded-full border border-slate-800 bg-slate-900 p-4.5 mb-4 text-slate-500 z-20">
                <Lock className="absolute top-1 right-1 h-3.5 w-3.5 text-slate-550" />
                <Award className="h-7 w-7 text-slate-600" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider text-slate-400 z-20`}>👑 100 Day Streak</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug z-20">LOCKED</p>
            </div>

            {/* Badge 4: ✔️ 7 Tasks Completed */}
            <div className={`rounded-2xl border p-5 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden backdrop-blur-md ${isDark ? "bg-slate-900/30 border-blue-500/20 hover:border-blue-500/40" : "bg-white/90 border-slate-205 hover:border-blue-400"} shadow-lg shadow-blue-500/5`}>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="relative rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4.5 mb-4 text-emerald-500">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${textHeadingTheme}`}>✔️ 7 Tasks Done</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">UNLOCKED</p>
            </div>

            {/* Badge 5: ✔️ 100 Tasks Completed */}
            <div className={`rounded-2xl border bg-slate-950/40 border-slate-900/80 p-5 flex flex-col items-center text-center relative overflow-hidden opacity-50 select-none group hover:opacity-70 transition-all duration-300`}>
              {/* Blur backdrop */}
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs z-10" />

              <div className="relative rounded-full border border-slate-800 bg-slate-900 p-4.5 mb-4 text-slate-550 z-20">
                <Lock className="absolute top-1 right-1 h-3.5 w-3.5 text-slate-550" />
                <Award className="h-7 w-7 text-slate-600" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider text-slate-400 z-20`}>✔️ 100 Tasks Done</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug z-20">LOCKED</p>
            </div>

          </div>

        </div>
      </section>

      {/* 🚀 7. CTA SECTION (HIGH CONVERSION) */}
      <section className="relative py-24 px-6 overflow-hidden max-w-7xl mx-auto rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 select-none backdrop-blur-md">
        
        {/* Floating gradient glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <Sparkle className="h-10 w-10 text-blue-500 mx-auto animate-spin" style={{ animationDuration: "8s" }} />
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Start building your consistency today.
          </h2>
          
          <p className="text-slate-450 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Configure lists, check daily habits, secure record streaks, and gain system insignia. Register in less than 10 seconds to log milestones perfectly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/register")}
              className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-xs font-black uppercase tracking-wider shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.03] cursor-pointer"
            >
              Get Started Free &rarr;
            </button>
            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-650 px-8 py-4 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

      </section>

      {/* 🚀 8. FOOTER */}
      <footer className={`py-12 px-6 border-t ${borderSubtleTheme} transition-colors duration-500 mt-20`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          
          {/* Col 1 Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-600/10 border border-blue-505/20 p-2 text-blue-500 shrink-0">
                <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
              </div>
              <h4 className={`text-sm font-black tracking-tight ${textHeadingTheme}`}>Consistency Tracker</h4>
            </div>
            <p className={`text-[11px] leading-relaxed ${textMutedTheme}`}>
              The modern visual engine built for students, developers, and goal-setters. Set daily targets, track progress grids, and expand your limits.
            </p>
          </div>

          {/* Col 2 Explore */}
          <div className="space-y-3">
            <span className={`block text-[11px] uppercase font-black tracking-wider ${textHeadingTheme}`}>Features</span>
            <ul className="space-y-1 text-[11px] text-slate-500 font-medium">
              <li><a href="#features" className="hover:text-blue-500">Tasks Tracking</a></li>
              <li><a href="#features" className="hover:text-blue-500">Streak Mechanics</a></li>
              <li><a href="#preview" className="hover:text-blue-500">Analytical charts</a></li>
              <li><a href="#badges" className="hover:text-blue-500">Certified badges</a></li>
            </ul>
          </div>

          {/* Col 3 Resources */}
          <div className="space-y-3">
            <span className={`block text-[11px] uppercase font-black tracking-wider ${textHeadingTheme}`}>SaaS Platform</span>
            <ul className="space-y-1 text-[11px] text-slate-500 font-medium">
              <li><a href="#workflow" className="hover:text-blue-500 font-bold">Pricing tiers</a></li>
              <li><a href="#workflow" className="hover:text-blue-500">Technical blog</a></li>
              <li><button onClick={() => onNavigate("/login")} className="hover:text-blue-500 cursor-pointer">Support Desk</button></li>
              <li><button onClick={() => onNavigate("/register")} className="hover:text-blue-500 cursor-pointer">Live API Docs</button></li>
            </ul>
          </div>

          {/* Col 4 Quick contact */}
          <div className="space-y-3">
            <span className={`block text-[11px] uppercase font-black tracking-wider ${textHeadingTheme}`}>Dashboard coordinates</span>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li>Feel free to visit coordinates at support@consistency.io</li>
              <li className="flex items-center space-x-1.5 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                <span className="text-[10px] uppercase font-bold text-slate-450">All Server systems Operational</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Base Copyright */}
        <div className={`max-w-7xl mx-auto pt-6 border-t ${borderSubtleTheme} text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500`}>
          <p>&copy; {new Date().getFullYear()} Consistency Tracker SaaS (Express-Node-React Workspace). All rights reserved.</p>
          <div className="flex space-x-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            <span className="hover:text-blue-500 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-blue-500 cursor-pointer">Privacy Safeguards</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
