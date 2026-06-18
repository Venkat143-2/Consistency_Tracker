/**
 * @license
 * Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Flame,
  Trophy,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Compass,
  Sparkles,
  Award,
  ChevronRight,
  Sparkle,
  Target
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

export function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden antialiased selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* 🌌 DECORATIVE AMBIENT GLOWS */}
      <div className="absolute top-0 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[20%] left-10 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[30%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[140px] pointer-events-none" />

      {/* 🧭 STICKY GLASS BLUR NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#020617]/70 backdrop-blur-md border-b border-white/5 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("/")}>
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-2 text-teal-400 shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none text-white font-sans">Consistency</h1>
              <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-wider block mt-0.5">Tracker</span>
            </div>
          </div>

          {/* Simple Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-teal-400 transition-colors">How It Works</a>
            <button 
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")} 
              className="hover:text-teal-400 transition-colors cursor-pointer uppercase text-xs font-medium"
            >
              Dashboard
            </button>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">Pricing</a>
          </nav>

          {/* User Sign In / Register Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate("/dashboard")}
                className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:brightness-110 px-5 py-2 text-xs font-extrabold text-slate-950 transition-all cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                <span>Dashboard Home</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate("/login")}
                  className="rounded-full px-5 py-2 text-xs font-bold text-slate-350 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate("/register")}
                  className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:brightness-115 px-5 py-2 text-xs font-extrabold text-[#020617] transition-all cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.25)]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-24 md:pt-36 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Large modern typography */}
        <div className="lg:col-span-6 space-y-8 text-left relative z-10">
          
          {/* Micro Tagline */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-teal-500/10 bg-teal-500/5 px-3 py-1 text-xs font-medium text-teal-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span>Consistency Tracker</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-white">
            Build Discipline. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400">
              Stay Consistent.
            </span>
          </h1>

          {/* Shorter Subdescription */}
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg font-sans">
            Streamline your daily targets, secure streak records, and visualize high-efficiency accomplishments through a beautifully minimalist, premium contrib grid dashboard.
          </p>

          {/* Two CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/register")}
              className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:brightness-110 text-[#020617] px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")}
              className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all backdrop-blur-md cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Log In</span>
            </button>
          </div>

        </div>

        {/* Right Side: Center Visual representation + floating badge components */}
        <div className="lg:col-span-6 relative z-10 flex items-center justify-center">
          
          <div className="relative w-full aspect-square max-w-[480px] flex items-center justify-center select-none">
            
            {/* Center Visual Circular Completion percentage ring (representing "TODAY") */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border border-teal-500/10 bg-teal-550/5 flex flex-col items-center justify-center shadow-[0_0_70px_rgba(20,184,166,0.12)] backdrop-blur-2xl">
              
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(20,184,166,0.05)" strokeWidth="6.5" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="url(#heroTealGradient)" strokeWidth="6.5" fill="transparent" strokeDasharray="264" strokeDashoffset="40" strokeLinecap="round" />
                <defs>
                  <linearGradient id="heroTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="text-center z-10">
                <span className="text-[10px] text-teal-400 uppercase tracking-widest font-extrabold font-sans">TODAY</span>
                <h3 className="text-4xl md:text-5xl font-black text-white mt-1">85%</h3>
                <span className="text-[9px] text-slate-400 mt-1 block font-semibold">Completed</span>
              </div>
            </div>

            {/* FLOATING CARD 1: Today's Focus */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-[2%] left-[-8%] bg-[#080d1e]/90 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-2xl z-20 w-48 hidden sm:block"
            >
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2">Today's focus</span>
              <div className="space-y-1.5 text-left text-[10px] text-slate-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">Morning workout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">Deep work - 2h</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <div className="h-3.5 w-3.5 rounded-full border border-slate-600 shrink-0" />
                  <span className="truncate">Read 20 pages</span>
                </div>
              </div>
            </motion.div>

            {/* FLOATING CARD 2: Current Streak (Unlocked) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-[8%] left-[-12%] bg-[#080d1e]/90 border border-white/5 px-3 py-2.5 rounded-xl flex items-center gap-2.5 backdrop-blur-md shadow-2xl z-20 hidden sm:flex"
            >
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Flame className="h-4.5 w-4.5 fill-teal-500/10" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[8px] text-teal-400 uppercase font-black tracking-widest block mb-0.5">UNLOCKED</span>
                <span className="text-[11px] font-bold text-white block">7-Day Streak</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 3: June 2026 Heatmap block preview */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-[3%] right-[-5%] bg-[#080d1e]/90 border border-white/5 p-3.5 rounded-2xl backdrop-blur-md shadow-2xl z-20 w-40 hidden sm:block"
            >
              <div className="flex items-center justify-between text-[9px] text-slate-500 mb-2 font-bold tracking-wider">
                <span>June 2026</span>
                <Calendar className="h-3 w-3 text-teal-400" />
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-sm ${
                      i < 5 ? "bg-slate-800" : i < 11 ? "bg-teal-900/40" : i < 15 ? "bg-teal-700/60" : "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* FLOATING CARD 4: Active Mission Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-[34%] right-[-14%] bg-[#080d1e]/90 border border-white/5 p-3.5 rounded-2xl backdrop-blur-md shadow-2xl z-20 w-44 hidden sm:block"
            >
              <div className="flex items-center gap-1.5 text-[8px] text-teal-400 font-extrabold tracking-widest uppercase mb-1">
                <Trophy className="h-3 w-3" />
                <span>Active Mission</span>
              </div>
              <h4 className="text-[11px] font-bold text-white">30 Day Discipline</h4>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: "60%" }} />
              </div>
              <div className="flex justify-between items-center text-[7px] text-slate-500 mt-1 font-bold">
                <span>PROGRESS</span>
                <span>18 / 30 DAYS</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 5: 47 Day Streak pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-[-4%] left-[45%] -translate-x-1/2 bg-[#080d1e]/90 border border-teal-500/20 p-2 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(20,184,166,0.1)] z-20 hidden sm:flex"
            >
              <div className="p-1.5 rounded-full bg-teal-400 text-slate-950">
                <Flame className="h-3.5 w-3.5 fill-slate-950" />
              </div>
              <span className="text-[10px] font-black text-white pr-2 font-mono tracking-wider">47 DAY STREAK</span>
            </motion.div>

            {/* FLOATING CARD 6: Weekly Analytics charts */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-[2%] right-[-10%] bg-[#080d1e]/90 border border-white/5 p-3.5 rounded-2xl backdrop-blur-md shadow-2xl z-20 w-40 hidden sm:block"
            >
              <div className="flex items-center justify-between text-[9px] text-slate-500 mb-2 font-bold tracking-wider">
                <span>Weekly</span>
                <TrendingUp className="h-3 w-3 text-teal-400" />
              </div>
              <div className="flex items-end justify-between h-10 pt-1">
                {[35, 55, 80, 45, 95, 75, 90].map((h, i) => (
                  <div key={i} className="w-2 bg-slate-800 rounded-full h-full relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 to-teal-400 rounded-full" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

        </div>

      </section>

      {/* 🚀 FEATURES SECTION (BENTO / PREMIUM CARD STYLE) */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto space-y-16">
        
        {/* Features header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Everything you need. <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Nothing you don't.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto font-sans">
            A focused ecosystem for building discipline, tracking growth, and turning consistency into a lifestyle.
          </p>
        </div>

        {/* Feature Cards Grid (5 detailed modules) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Card 1: Smart Task Management */}
          <div className="bg-[#080d1e]/30 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-teal-400/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart Task Management</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Create, organize, and complete your daily goals with a simple and distraction-free workflow.
              </p>
            </div>
          </div>

          {/* Card 2: Progress Analytics */}
          <div className="bg-[#080d1e]/30 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-teal-400/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Progress Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Understand your growth through daily, monthly, yearly, and overall insights with beautiful visual reports.
              </p>
            </div>
          </div>

          {/* Card 3: Achievement System */}
          <div className="bg-[#080d1e]/30 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-teal-400/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Achievement System</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Unlock beautifully designed badges as you complete missions and build long-term discipline.
              </p>
            </div>
          </div>

          {/* Card 4: Mission Challenges */}
          <div className="bg-[#080d1e]/30 border border-white/10 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group lg:col-span-1">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-teal-400/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Mission Challenges</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Complete daily and long-term challenges that encourage consistency and reward commitment.
              </p>
            </div>
          </div>

          {/* Card 5: Daily Streak Tracking */}
          <div className="bg-[#080d1e]/30 border border-white/10 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group lg:col-span-1">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-teal-400/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Daily Streak Tracking</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Build momentum one day at a time and watch your current and longest streaks grow.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 🚀 THREE STEPS SECTION (How It Works) */}
      <section id="workflow" className="py-32 border-t border-white/5 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest block">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Three simple steps. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">A lifetime of progress.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative items-center">
            
            {/* Step 1 */}
            <div className="relative group bg-[#020617]/40 border border-white/5 hover:border-teal-500/20 rounded-3xl p-8 backdrop-blur-md transition-all duration-300">
              <span className="text-5xl font-extrabold text-teal-400/80 tracking-tight block">01</span>
              <h3 className="text-xl font-bold text-white mt-4">Plan your day.</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Create the few tasks that truly matter.
              </p>
            </div>

            {/* Step 1 -> 2 Arrow in Desktop */}
            <div className="hidden md:flex justify-center text-teal-400/20 absolute left-[31%] z-20">
              <ChevronRight className="h-8 w-8 stroke-[1.5]" />
            </div>

            {/* Step 2 */}
            <div className="relative group bg-[#020617]/40 border border-white/5 hover:border-teal-500/20 rounded-3xl p-8 backdrop-blur-md transition-all duration-300">
              <span className="text-5xl font-extrabold text-teal-400/80 tracking-tight block">02</span>
              <h3 className="text-xl font-bold text-white mt-4">Take action.</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Complete tasks and build momentum throughout the day.
              </p>
            </div>

            {/* Step 2 -> 3 Arrow in Desktop */}
            <div className="hidden md:flex justify-center text-teal-400/20 absolute left-[64%] z-20">
              <ChevronRight className="h-8 w-8 stroke-[1.5]" />
            </div>

            {/* Step 3 */}
            <div className="relative group bg-[#020617]/40 border border-white/5 hover:border-teal-500/20 rounded-3xl p-8 backdrop-blur-md transition-all duration-300">
              <span className="text-5xl font-extrabold text-teal-400/80 tracking-tight block">03</span>
              <h3 className="text-xl font-bold text-white mt-4">Grow through consistency.</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed font-sans">
                Watch your progress, streaks, achievements, and discipline evolve over time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 🚀 BENEFITS SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Designed for people who <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">finish what they start.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Missions */}
          <div className="bg-[#080d1e]/20 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="rounded-2xl bg-teal-455/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Missions</h3>
              <p className="text-slate-400 text-sm mt-3 font-sans">
                Stay motivated with meaningful challenges.
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#080d1e]/20 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="rounded-2xl bg-teal-455/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Achievements</h3>
              <p className="text-slate-400 text-sm mt-3 font-sans">
                Unlock premium badges that celebrate your journey.
              </p>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-[#080d1e]/20 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="rounded-2xl bg-teal-455/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Analytics</h3>
              <p className="text-slate-400 text-sm mt-3 font-sans">
                See your growth through beautiful insights.
              </p>
            </div>
          </div>

          {/* Daily Focus */}
          <div className="bg-[#080d1e]/20 border border-white/5 hover:border-teal-500/20 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="rounded-2xl bg-teal-455/10 border border-teal-400/20 p-4 text-teal-400 w-fit">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Daily Focus</h3>
              <p className="text-slate-400 text-sm mt-3 font-sans">
                Keep your attention on what matters most.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 🚀 KEEPING THE CTA SECTION AT THE BOTTOM PRECISELY PRESERVED */}
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
              I already have an account
            </button>
          </div>
        </div>

      </section>

      {/* 🚀 FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 transition-colors duration-500 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          
          {/* Col 1 Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-teal-600/10 border border-teal-505/20 p-2 text-teal-400 shrink-0">
                <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-black tracking-tight text-white">Consistency Tracker</h4>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
              The modern visual engine built for students, developers, and goal-setters. Set daily targets, track progress grids, and expand your limits.
            </p>
          </div>

          {/* Col 2 Explore */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase font-black tracking-wider text-white">Features</span>
            <ul className="space-y-1 text-[11px] text-slate-400 font-medium font-sans">
              <li><a href="#features" className="hover:text-teal-400">Tasks Tracking</a></li>
              <li><a href="#features" className="hover:text-teal-400">Streak Mechanics</a></li>
              <li><button onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")} className="hover:text-teal-400 cursor-pointer">Analytical charts</button></li>
              <li><button onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")} className="hover:text-teal-400 cursor-pointer">Certified badges</button></li>
            </ul>
          </div>

          {/* Col 3 Resources */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase font-black tracking-wider text-white">SaaS Platform</span>
            <ul className="space-y-1 text-[11px] text-slate-400 font-medium font-sans">
              <li><a href="#workflow" className="hover:text-teal-400 font-bold">Pricing tiers</a></li>
              <li><a href="#workflow" className="hover:text-teal-400">Technical blog</a></li>
              <li><button onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/login")} className="hover:text-teal-400 cursor-pointer">Support Desk</button></li>
              <li><button onClick={() => onNavigate(isLoggedIn ? "/dashboard" : "/register")} className="hover:text-teal-400 cursor-pointer">Live API Docs</button></li>
            </ul>
          </div>

          {/* Col 4 Server Status */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase font-black tracking-wider text-white">Status</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="font-sans">All operational and secure and syncing.</li>
              <li className="flex items-center space-x-1.5 pt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                <span className="text-[10px] uppercase font-bold text-slate-400">All Systems Operational</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Base Copyright */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <p>&copy; {new Date().getFullYear()} Consistency Tracker SaaS (Express-Node-React Workspace). All rights reserved.</p>
          <div className="flex space-x-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            <span className="hover:text-teal-400 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-teal-400 cursor-pointer">Privacy Safeguards</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
