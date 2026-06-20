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
  Target,
  CheckSquare,
  ListTodo
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

export function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  
  // Custom scroll handler
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItemClass = "text-sm text-[#A0B5C5] hover:text-[#00F5C3] font-medium tracking-wide transition-colors cursor-pointer";

  // Shared Animation Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-[#020B16] text-[#FFFFFF] font-sans relative overflow-x-hidden antialiased selection:bg-[#00F5C3]/20 selection:text-[#00F5C3]">
      
      {/* 🌌 AMBIENT NEON GLOW EFFECTS */}
      <div className="absolute top-0 right-1/4 -z-10 h-[700px] w-[700px] rounded-full bg-[#00F5C3]/5 blur-[200px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute top-[20%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-[#00C6A7]/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] -z-10 h-[800px] w-[800px] rounded-full bg-[#00F5C3]/5 blur-[220px] pointer-events-none" />

      {/* 🧭 STICKY PREMIUM BLUR NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#020B16]/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4.5 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("/")}>
            <div className="rounded-xl bg-[#00F5C3]/10 border border-[#00F5C3]/25 p-2 text-[#00F5C3] shadow-[0_0_15px_rgba(0,245,195,0.15)] transition-all shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-none text-white font-sans">
                Consistency<span className="text-[#00F5C3]">.</span>
              </h1>
              <span className="text-[10px] text-[#A0B5C5] font-semibold uppercase tracking-widest block mt-0.5">Tracker</span>
            </div>
          </div>

          {/* Simple Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleScroll("features")} className={navItemClass}>Features</button>
            <button onClick={() => handleScroll("how-it-works")} className={navItemClass}>How it Works</button>
            <button onClick={() => handleScroll("product")} className={navItemClass}>Product</button>
          </nav>

          {/* Access Buttons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => onNavigate("/login")}
                className="rounded-xl px-4.5 py-2.5 text-sm font-bold text-[#A0B5C5] hover:text-white transition-all cursor-pointer hover:bg-white/[0.04]"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate("/register")}
                className="rounded-xl bg-gradient-to-r from-[#00F5C3] to-[#00C6A7] hover:brightness-110 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,245,195,0.25)] hover:scale-[1.03] active:scale-100"
              >
                Get Started
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-20 md:pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2.5 rounded-full border border-[#00F5C3]/20 bg-[#00F5C3]/10 px-4 py-1.5 text-xs font-semibold text-[#00F5C3] uppercase tracking-wider shadow-[0_0_15px_rgba(0,245,195,0.12)] mb-8"
        >
          <Sparkle className="h-3.5 w-3.5 text-[#00F5C3] shrink-0 animate-pulse" />
          <span>Consistency Tracker</span>
        </motion.div>

        {/* Large Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight leading-[1.08] text-white max-w-4xl"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5C3] via-[#00C6A7] to-[#00F5C3] drop-shadow-[0_0_30px_rgba(0,245,195,0.18)]">
            Consistency
          </span>{" "}
          matters.
        </motion.h1>

        {/* Dynamic Descriptive Passage */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#A0B5C5] text-lg sm:text-[18px] leading-relaxed max-w-2xl mt-8 font-sans"
        >
          Small actions transform average into excellence. Build better habits, stay accountable, and create a life driven by steady progress. Every day you show up becomes part of your success story.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => onNavigate("/register")}
            className="w-full sm:w-auto rounded-xl bg-[#00F5C3] hover:bg-[#00C6A7] text-[#020B16] px-8 py-4 text-base font-bold transition-all cursor-pointer shadow-[0_4px_30px_rgba(0,245,195,0.35)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => onNavigate("/login")}
            className="w-full sm:w-auto rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white px-8 py-4 text-base font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center cursor-pointer"
          >
            Log In
          </button>
        </motion.div>

        {/* PREMIUM DASHBOARD ILLUSTRATION USING FLOATING GLASS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 50, delay: 0.4 }}
          className="mt-20 w-full max-w-5xl rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 md:p-10 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(2,11,22,0.8)]"
        >
          {/* Subtle grid pattern background inside illustration canvas */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] opacity-70 pointer-events-none" />
          <div className="absolute top-[30%] left-[30%] -z-10 h-64 w-64 rounded-full bg-[#00F5C3]/10 blur-3xl pointer-events-none" />
          
          {/* Bento-like Glass Card Layout representation */}
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 text-left select-none z-10">
            
            {/* COLUMN 1: Left Dashboard components (width 5 cols) */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Card 1: 7-Day Streak Detail */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-4 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[10px] text-[#A0B5C5] font-semibold uppercase tracking-wider">Weekly Overview</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-[#00F5C3] rounded-full animate-ping" />
                    <span className="text-[9px] text-[#00F5C3] font-bold uppercase tracking-wider">Tracking Live</span>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-white mt-1">7-Day Streak</h4>
                
                <div className="flex items-center justify-between gap-1.5 mt-3.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                        idx < 6 
                          ? "bg-[#00F5C3]/10 border-[#00F5C3]/20 text-[#00F5C3]" 
                          : "bg-white/[0.02] border-white/[0.08] text-[#A0B5C5]"
                      }`}>
                        {idx < 6 ? "✓" : "7"}
                      </div>
                      <span className="text-[8px] text-[#A0B5C5] uppercase font-semibold">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Daily Focus Checklist */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-4.5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A0B5C5] font-semibold uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="h-3.5 w-3.5 text-[#00F5C3]" /> Daily Focus
                  </span>
                  <span className="text-[9px] text-[#00F5C3] font-bold uppercase tracking-wider bg-[#00F5C3]/10 border border-[#00F5C3]/15 px-2 py-0.5 rounded">
                    2/3 Done
                  </span>
                </div>

                <div className="space-y-2 text-xs text-white">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="line-through text-[#A0B5C5]">Solve 3 DSA Questions</span>
                    <CheckCircle2 className="h-4 w-4 text-[#00F5C3] shrink-0" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="line-through text-[#A0B5C5]">Read 15 Pages of Book</span>
                    <CheckCircle2 className="h-4 w-4 text-[#00F5C3] shrink-0" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] opacity-75">
                    <span>Core Strength Workout</span>
                    <div className="h-4 w-4 rounded-full border border-white/20 shrink-0" />
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2: Center segment featuring Progress Ring and Heatmap (width 4 cols) */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Card 3: Circular Progress Ring representation */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#A0B5C5] font-semibold uppercase tracking-wider mb-2">Today's Progress</span>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,195,0.01)" strokeWidth="6.5" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#00F5C3" strokeWidth="6.5" fill="transparent" strokeDasharray="251.2" strokeDashoffset="37.6" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,245,195,0.3)]" />
                  </svg>
                  <div className="z-10">
                    <span className="text-3xl font-black text-white">85%</span>
                    <span className="text-[9px] text-[#A0B5C5] block font-semibold uppercase mt-0.5">Discipline</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#00F5C3] mt-3 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Overachieved target limit
                </div>
              </div>

              {/* Card 4: Historical Streak Heatmap Calendar */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-4.5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between text-[10px] text-[#A0B5C5] mb-2 font-semibold">
                  <span>Consistency Grid Map</span>
                  <Calendar className="h-3.5 w-3.5 text-[#00F5C3]" />
                </div>
                
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-sm transition-all duration-500 ${
                        i < 4 
                          ? "bg-white/[0.02] border border-white/[0.05]" 
                          : i < 11 
                            ? "bg-[#00F5C3]/20 border border-[#00F5C3]/10" 
                            : i < 22 
                              ? "bg-[#00F5C3]/50 border border-[#00F5C3]/20" 
                              : "bg-[#00F5C3] shadow-[0_0_8px_rgba(0,245,195,0.4)]"
                      }`}
                      title={`Day ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* COLUMN 3: Right segment with Streak Counter & Active Mission (width 4 cols) */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Card 5: Large Streak Counter */}
              <div className="rounded-2xl bg-[#081926]/75 border border-[#00F5C3]/15 p-5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,245,195,0.06)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-[-20%] right-[-20%] h-32 w-32 bg-[#00F5C3]/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A0B5C5] font-semibold uppercase tracking-wider block">Running Streak</span>
                  <Flame className="h-4.5 w-4.5 text-[#00F5C3] fill-[#00F5C3]/20 animate-bounce" />
                </div>

                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white leading-none tracking-tight">47</span>
                  <span className="text-xs font-black text-[#00F5C3] uppercase tracking-widest font-mono">DAYS NOW</span>
                </div>

                <p className="text-[10px] text-[#A0B5C5] font-medium leading-relaxed uppercase">
                  Longest record: <span className="font-bold text-white pr-1">62 Days</span> &bull; Tier Elite
                </p>
              </div>

              {/* Card 6: Weekly Analytics block */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-4.5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between text-[10px] text-[#A0B5C5] mb-3.5 font-semibold">
                  <span>Weekly Analytics</span>
                  <TrendingUp className="h-3.5 w-3.5 text-[#00F5C3]" />
                </div>
                
                <div className="flex items-end justify-between h-14 pt-1">
                  {[40, 65, 80, 50, 95, 70, 90].map((heightVal, idx) => (
                    <div key={idx} className="w-2.5 bg-white/[0.04] rounded-full h-full relative overflow-hidden" title={`Day percentage: ${heightVal}%`}>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#00C6A7] to-[#00F5C3] rounded-full" style={{ height: `${heightVal}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 7: Active Mission Challenges widget */}
              <div className="rounded-2xl bg-[#081926]/75 border border-white/[0.08] p-4.5 backdrop-blur-md hover:border-[#00F5C3]/35 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#00F5C3] font-bold uppercase tracking-widest flex items-center gap-1 bg-[#00F5C3]/10 border border-[#00F5C3]/15 px-2 py-0.5 rounded">
                    <Target className="h-3 w-3" /> Active Mission
                  </span>
                  <span className="text-[9px] text-[#A0B5C5] font-semibold uppercase">Challenge</span>
                </div>

                <h4 className="text-xs font-bold text-white mt-2.5">30-Day Routine Reset</h4>
                
                <div className="mt-2.5 h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
                  <div className="h-full bg-gradient-to-r from-[#00C6A7] to-[#00F5C3] rounded-full" style={{ width: "60%" }} />
                </div>
                <div className="flex justify-between items-center text-[8px] text-[#A0B5C5] mt-1.5 font-bold uppercase">
                  <span>Progress Ratio</span>
                  <span className="text-white">18 / 30 Days completed</span>
                </div>
              </div>

            </div>

          </div>

          {/* Holographic Bottom Shadow Reflection */}
          <div className="absolute bottom-[-20%] left-[-10%] right-[-10%] h-40 bg-[#00F5C3]/10 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>

      </section>

      {/* 🚀 FEATURES SECTION */}
      <section id="features" className="py-24 md:py-32 px-6 max-w-7xl mx-auto space-y-16 scroll-mt-20">
        
        {/* Core Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Everything you need. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5C3] to-[#00C6A7]">Nothing you don't.</span>
          </h2>
          <p className="text-[#A0B5C5] text-lg leading-relaxed max-w-2xl mx-auto font-sans">
            A focused ecosystem for building discipline, tracking growth, and turning consistency into a lifestyle.
          </p>
        </div>

        {/* 5 Glass Card responsive grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4"
        >
          
          {/* Card 1: Checklist */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00F5C3]/5 rounded-full blur-2xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/20 p-4.5 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.1)]">
                <ListTodo className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Smart Task Management</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Create, organize, and complete your daily goals with a simple and distraction-free workflow.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Bar Chart */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00F5C3]/5 rounded-full blur-2xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/20 p-4.5 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.1)]">
                <BarChart3 className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Progress Analytics</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Understand your growth through daily, monthly, yearly, and overall insights with beautiful visual reports.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Award */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00F5C3]/5 rounded-full blur-2xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/20 p-4.5 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.1)]">
                <Award className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Achievement System</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Unlock beautifully designed badges as you complete missions and build long-term discipline.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Target Icon block */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00F5C3]/5 rounded-full blur-2xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/20 p-4.5 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.1)]">
                <Target className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Mission Challenges</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Complete daily and long-term challenges that encourage consistency and reward commitment.
              </p>
            </div>
          </motion.div>

          {/* Card 5: Flame Streak Icon block */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#00F5C3]/5 rounded-full blur-2xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/20 p-4.5 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.1)]">
                <Flame className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">Streak Tracking</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Build momentum one day at a time and watch your current and longest streaks grow.
              </p>
            </div>
          </motion.div>

        </motion.div>

      </section>

      {/* 🚀 HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 md:py-32 border-t border-white/[0.08] relative overflow-hidden scroll-mt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-[#00C6A7]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 space-y-20 relative z-10">
          
          {/* Centered titles */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#00F5C3] font-bold uppercase tracking-widest bg-[#00F5C3]/10 border border-[#00F5C3]/20 px-3 py-1 rounded-full">
              How it Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight pt-1">
              Three simple steps. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5C3] to-[#00C6A7]">A lifetime of progress.</span>
            </h2>
          </div>

          {/* Steps Display - 3 horizontal cards */}
          <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-between relative">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 rounded-3xl border border-white/[0.08] bg-[#081926]/75 p-8 backdrop-blur-md flex flex-col justify-between group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-[-20px] right-[-20px] h-24 w-24 rounded-full bg-[#00F5C3]/5 blur-xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
              <div>
                <span className="text-6xl font-black text-[#00F5C3]/20 group-hover:text-[#00F5C3]/30 tracking-tight transition-colors">01</span>
                <h3 className="text-xl font-bold text-white mt-6 group-hover:text-[#00F5C3] transition-colors font-sans">Plan your day.</h3>
                <p className="text-[#A0B5C5] text-sm mt-3.5 leading-relaxed font-sans">
                  Create the few tasks that truly matter.
                </p>
              </div>
            </motion.div>

            {/* Subtle Step Connection Arrow in desktop width */}
            <div className="hidden lg:flex items-center text-[#00F5C3]/30 shrink-0 select-none">
              <ChevronRight className="h-8 w-8 stroke-[1.5] animate-[bounceHorizontal_2s_infinite]" />
            </div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 rounded-3xl border border-white/[0.08] bg-[#081926]/75 p-8 backdrop-blur-md flex flex-col justify-between group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-[-20px] right-[-20px] h-24 w-24 rounded-full bg-[#00C6A7]/5 blur-xl group-hover:bg-[#00C6A7]/10 transition-colors pointer-events-none" />
              <div>
                <span className="text-6xl font-black text-[#00C6A7]/20 group-hover:text-[#00C6A7]/30 tracking-tight transition-colors">02</span>
                <h3 className="text-xl font-bold text-white mt-6 group-hover:text-[#00C6A7] transition-colors font-sans">Take action.</h3>
                <p className="text-[#A0B5C5] text-sm mt-3.5 leading-relaxed font-sans">
                  Complete tasks and build momentum throughout the day.
                </p>
              </div>
            </motion.div>

            {/* Subtle Step Connection Arrow in desktop width */}
            <div className="hidden lg:flex items-center text-[#00F5C3]/30 shrink-0 select-none">
              <ChevronRight className="h-8 w-8 stroke-[1.5] animate-[bounceHorizontal_2s_infinite]" style={{ animationDelay: "0.5s" }} />
            </div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex-1 rounded-3xl border border-white/[0.08] bg-[#081926]/75 p-8 backdrop-blur-md flex flex-col justify-between group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-[-20px] right-[-20px] h-24 w-24 rounded-full bg-[#00F5C3]/5 blur-xl group-hover:bg-[#00F5C3]/10 transition-colors pointer-events-none" />
              <div>
                <span className="text-6xl font-black text-[#00F5C3]/20 group-hover:text-[#00F5C3]/30 tracking-tight transition-colors">03</span>
                <h3 className="text-xl font-bold text-white mt-6 group-hover:text-[#00F5C3] transition-colors font-sans">Grow through consistency.</h3>
                <p className="text-[#A0B5C5] text-sm mt-3.5 leading-relaxed font-sans">
                  Watch your progress, streaks, achievements, and discipline evolve over time.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 🚀 PRODUCT SECTION */}
      <section id="product" className="py-24 md:py-32 px-6 max-w-7xl mx-auto space-y-16 scroll-mt-20">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
            Designed for people who <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5C3] to-[#00C6A7]">finish what they start.</span>
          </h2>
        </div>

        {/* 4 Premium Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          
          {/* Card 1: Missions */}
          <div className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between h-[250px] group">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/25 p-4 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.15)] group-hover:scale-105 transition-transform duration-300">
                <Target className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white font-sans mt-2">Missions</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Stay motivated with meaningful challenges.
              </p>
            </div>
          </div>

          {/* Card 2: Achievements */}
          <div className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00C6A7]/25 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between h-[250px] group">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#00C6A7]/10 border border-[#00C6A7]/25 p-4 text-[#00C6A7] w-fit shadow-[0_0_15px_rgba(0,198,167,0.15)] group-hover:scale-105 transition-transform duration-300">
                <Trophy className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white font-sans mt-2">Achievements</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Unlock premium badges that celebrate your journey.
              </p>
            </div>
          </div>

          {/* Card 3: Analytics */}
          <div className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between h-[250px] group">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/25 p-4 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.15)] group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white font-sans mt-2">Analytics</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                See your growth through beautiful insights.
              </p>
            </div>
          </div>

          {/* Card 4: Daily Focus */}
          <div className="bg-[#081926]/75 border border-white/[0.08] hover:border-[#00F5C3]/25 hover:scale-[1.01] transition-all p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col justify-between h-[250px] group">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#00F5C3]/10 border border-[#00F5C3]/25 p-4 text-[#00F5C3] w-fit shadow-[0_0_15px_rgba(0,245,195,0.15)] group-hover:scale-105 transition-transform duration-300">
                <CheckCircle2 className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white font-sans mt-2">Daily Focus</h3>
              <p className="text-[#A0B5C5] text-sm leading-relaxed font-sans">
                Keep your attention on what matters most.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 🚀 FINAL CTA SECTION */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto rounded-3xl border border-white/[0.08] bg-[#081926]/75 backdrop-blur-xl select-none text-center overflow-hidden mb-24 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        
        {/* Glowing teal background ring behind content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] bg-[#00F5C3]/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <Sparkle className="h-10 w-10 text-[#00F5C3] mx-auto animate-spin" style={{ animationDuration: "12s" }} />
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
            Start your first streak today.
          </h2>
          
          <p className="text-[#A0B5C5] text-sm sm:text-[18px] max-w-xl mx-auto leading-relaxed">
            Free forever. Your tasks, your data, your discipline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate("/register")}
              className="w-full sm:w-auto rounded-xl bg-[#00F5C3] hover:bg-[#00C6A7] text-[#020B16] px-8 py-4 text-base font-bold transition-all hover:scale-[1.03] shadow-[0_4px_30px_rgba(0,245,195,0.35)] cursor-pointer"
            >
              Get Started &rarr;
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="w-full sm:w-auto rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] px-8 py-4 text-base font-bold text-white transition-all cursor-pointer"
            >
              I already have an account
            </button>
          </div>
        </div>

      </section>

      {/* 🚀 FIXED MINIMAL FOOTER */}
      <footer className="py-12 px-6 border-t border-white/[0.08] bg-[#020B16] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#A0B5C5]">
          <p>&copy; 2026 Consistency Tracker. All rights reserved.</p>
        </div>
      </footer>

      {/* Bounce horizontal inline style helper for connection arrows */}
      <style>{`
        @keyframes bounceHorizontal {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6px);
          }
        }
      `}</style>

    </div>
  );
}
