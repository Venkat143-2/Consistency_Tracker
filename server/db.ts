/**
 * @license
 * Apache-2.0
 */

import * as fs from "fs";
import * as path from "path";
import { User, Task, TaskCompletion, DailyStats, Badge, TaskCategory, ExportData } from "../src/types.js";

const isServerless = typeof process.env.VERCEL !== "undefined" || process.env.NODE_ENV === "production";
const DB_DIR = isServerless ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// In serverless environments, initialize /tmp/db.json by copying from process.cwd()/data/db.json if it exists
if (isServerless) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const originalDbFile = path.join(process.cwd(), "data", "db.json");
      if (fs.existsSync(originalDbFile)) {
        fs.writeFileSync(DB_FILE, fs.readFileSync(originalDbFile, "utf8"), "utf8");
      } else {
        const fresh: DBLocalSchema = {
          users: {},
          tasks: [],
          completions: [],
          dailyStats: [],
          userBadges: {},
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), "utf8");
      }
    }
  } catch (err) {
    console.error("Failed to initialize serverless DB in /tmp:", err);
  }
}

interface DBLocalSchema {
  users: Record<string, User & { passwordHash: string }>;
  tasks: Task[];
  completions: TaskCompletion[];
  dailyStats: DailyStats[];
  userBadges: Record<string, string[]>; // userId -> badgeIds array
}

// Master Badge configurations
export const ALL_BADGES: { id: string; name: string; description: string; iconName: string }[] = [
  // Login Streak Missions
  { id: "login_streak_1", name: "1 Day Login Streak", description: "Complete at least one task for 1 day", iconName: "Flame" },
  { id: "login_streak_4", name: "4 Day Login Streak", description: "Complete at least one task daily for 4 consecutive days", iconName: "Flame" },
  { id: "login_streak_7", name: "7 Day Login Streak", description: "Complete at least one task daily for 7 consecutive days", iconName: "Flame" },
  { id: "login_streak_15", name: "15 Day Login Streak", description: "Complete at least one task daily for 15 consecutive days", iconName: "Flame" },
  { id: "login_streak_30", name: "30 Day Login Streak", description: "Complete at least one task daily for 30 consecutive days", iconName: "Flame" },
  { id: "login_streak_60", name: "60 Day Login Streak", description: "Complete at least one task daily for 60 consecutive days", iconName: "Flame" },
  { id: "login_streak_100", name: "100 Day Login Streak", description: "Complete at least one task daily for 100 consecutive days", iconName: "Flame" },
  { id: "login_streak_125", name: "125 Day Login Streak", description: "Complete at least one task daily for 125 consecutive days", iconName: "Flame" },
  { id: "login_streak_150", name: "150 Day Login Streak", description: "Complete at least one task daily for 150 consecutive days", iconName: "Flame" },
  { id: "login_streak_200", name: "200 Day Login Streak", description: "Complete at least one task daily for 200 consecutive days", iconName: "Flame" },
  { id: "login_streak_250", name: "250 Day Login Streak", description: "Complete at least one task daily for 250 consecutive days", iconName: "Flame" },
  { id: "login_streak_300", name: "300 Day Login Streak", description: "Complete at least one task daily for 30 consecutive days", iconName: "Flame" },
  { id: "login_streak_365", name: "365 Day Login Streak", description: "Complete at least one task daily for 365 consecutive days", iconName: "Flame" },

  // Task Completion Missions
  { id: "task_streak_1", name: "1 Task Completed", description: "Complete 1 task on a fully successful day", iconName: "Sprout" },
  { id: "task_streak_4", name: "4 Tasks Completed", description: "Accumulate 4 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_7", name: "7 Tasks Completed", description: "Accumulate 7 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_15", name: "15 Tasks Completed", description: "Accumulate 15 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_30", name: "30 Tasks Completed", description: "Accumulate 30 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_60", name: "60 Tasks Completed", description: "Accumulate 60 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_100", name: "100 Tasks Completed", description: "Accumulate 100 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_125", name: "125 Tasks Completed", description: "Accumulate 125 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_150", name: "150 Tasks Completed", description: "Accumulate 150 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_200", name: "200 Tasks Completed", description: "Accumulate 200 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_250", name: "250 Tasks Completed", description: "Accumulate 250 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_300", name: "300 Tasks Completed", description: "Accumulate 300 completed tasks on consecutive successful days", iconName: "Sprout" },
  { id: "task_streak_365", name: "365 Tasks Completed", description: "Accumulate 365 completed tasks on consecutive successful days", iconName: "Sprout" },

  // Legacy & Fallbacks for Compatibility
  { id: "cons_once", name: "Green Start", description: "Reach 100% daily consistency once", iconName: "CircleCheck" },
  { id: "cons_7", name: "Perfect Week", description: "Maintain 100% consistency for 7 days", iconName: "Sparkles" },
  { id: "cons_30", name: "Perfect Month", description: "Maintain 100% consistency for 30 days", iconName: "Star" },
  { id: "cons_100", name: "Consistency Legend", description: "Maintain 100% consistency for 100 days", iconName: "Galaxy" },
  { id: "login_1", name: "First Step", description: "Login and complete at least one task for 1 day", iconName: "Flame" },
  { id: "login_5", name: "Consistent Starter", description: "Login and complete a task for 5 consecutive days", iconName: "Flame" },
  { id: "login_7", name: "Weekly Warrior", description: "Login and complete a task for 7 consecutive days", iconName: "Flame" },
  { id: "login_10", name: "Focused Mind", description: "Login and complete a task for 10 consecutive days", iconName: "Flame" },
  { id: "login_15", name: "Half Month Hero", description: "Login and complete a task for 15 consecutive days", iconName: "Flame" },
  { id: "login_30", name: "Monthly Master", description: "Login and complete a task for 30 consecutive days", iconName: "Flame" },
  { id: "login_90", name: "Quarter Champion", description: "Login and complete a task for 90 consecutive days", iconName: "Gem" },
  { id: "login_180", name: "Half Year Legend", description: "Login and complete a task for 180 consecutive days", iconName: "Crown" },
  { id: "login_365", name: "Discipline King", description: "Login and complete a task for 365 consecutive days", iconName: "Trophy" },
  { id: "task_5", name: "Beginner", description: "Complete all planned tasks for 5 days in a row", iconName: "Sprout" },
  { id: "task_10", name: "Dedicated", description: "Complete all planned tasks for 10 days in a row", iconName: "Zap" },
  { id: "task_20", name: "Focus Machine", description: "Complete all planned tasks for 20 days in a row", iconName: "Flame" },
  { id: "task_30", name: "Discipline Builder", description: "Complete all planned tasks for 30 days in a row", iconName: "Shield" },
  { id: "task_50", name: "Iron Will", description: "Complete all planned tasks for 50 days in a row", iconName: "Dumbbell" },
  { id: "task_100", name: "Unbreakable", description: "Complete all planned tasks for 100 days in a row", iconName: "Rocket" },
  { id: "task_365", name: "Legendary", description: "Complete all planned tasks for 365 days in a row", iconName: "Star" },
  { id: "total_10", name: "First Victory", description: "Complete a total of 10 tasks", iconName: "Book" },
  { id: "total_25", name: "Productive", description: "Complete a total of 25 tasks", iconName: "Book" },
  { id: "total_50", name: "Achiever", description: "Complete a total of 50 tasks", iconName: "Book" },
  { id: "total_100", name: "Performer", description: "Complete a total of 100 tasks", iconName: "Book" },
  { id: "total_250", name: "Elite", description: "Complete a total of 250 tasks", iconName: "Gem" },
  { id: "total_500", name: "Master", description: "Complete a total of 500 tasks", iconName: "Crown" },
  { id: "total_1000", name: "Grandmaster", description: "Complete a total of 1000 tasks", iconName: "Trophy" },
];

// Helper to format LocalDate as "YYYY-MM-DD"
export function getLocalDateString(dateObj: any = new Date()): string {
  let parsed = dateObj;
  if (!(parsed instanceof Date) || isNaN(parsed.getTime())) {
    parsed = new Date(dateObj);
  }
  if (isNaN(parsed.getTime())) {
    parsed = new Date();
  }
  const offset = parsed.getTimezoneOffset();
  const adjusted = new Date(parsed.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().split("T")[0];
}

// Low-level atomic file utilities
function readDB(): DBLocalSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const fresh: DBLocalSchema = {
      users: {},
      tasks: [],
      completions: [],
      dailyStats: [],
      userBadges: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }
  try {
    const text = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to read database, rebuilding default model", err);
    return {
      users: {},
      tasks: [],
      completions: [],
      dailyStats: [],
      userBadges: {},
    };
  }
}

function writeDB(data: DBLocalSchema) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempFile, DB_FILE);
}

// Daily carrying forward utility
// Ensure tasks exist for today, else clone ones from yesterday
export function ensureTasksForDay(userId: string, targetDate: string): Task[] {
  const db = readDB();
  
  // Find tasks created for "targetDate" (matching year, month, day)
  const usersTasks = db.tasks.filter((t) => t.userId === userId);
  const targetDateTasks = usersTasks.filter((t) => t.createdAt.startsWith(targetDate));

  if (targetDateTasks.length > 0) {
    // Already has tasks designated for today
    return targetDateTasks;
  }

  // Otherwise, today is empty. We need to auto carry forward yesterday's tasks!
  // Find tasks from "yesterday"
  const yesterdayDate = new Date(new Date(targetDate).getTime() - 24 * 60 * 60 * 1000);
  const yesterdayString = getLocalDateString(yesterdayDate);
  const yesterdayTasks = usersTasks.filter((t) => t.createdAt.startsWith(yesterdayString));

  let tasksToCarry: Omit<Task, "id" | "createdAt">[] = [];

  if (yesterdayTasks.length > 0) {
    // Sort yesterday's tasks by displayOrder to preserve their sequence
    const sortedYesterdayTasks = [...yesterdayTasks].sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 0;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 0;
      return orderA - orderB;
    });

    tasksToCarry = sortedYesterdayTasks.map((t, index) => ({
      userId: userId,
      title: t.title,
      category: t.category,
      completedToday: false,
      displayOrder: t.displayOrder !== undefined ? t.displayOrder : index,
    }));
  } else {
    // Scenario 2 & 3: No tasks yesterday or no previous history.
    // Do not generate or seed any default/placeholder tasks.
    return [];
  }

  // Clone tasks into today
  const createdTasks: Task[] = [];
  tasksToCarry.forEach((t) => {
    const newTask: Task = {
      id: "raw_" + Math.random().toString(36).substring(2, 11),
      userId: t.userId,
      title: t.title,
      category: t.category,
      createdAt: new Date().toISOString().replace(/^[^T]+/, targetDate), // Backdate ISO to targetDate
      completedToday: false,
      displayOrder: t.displayOrder,
    };
    db.tasks.push(newTask);
    createdTasks.push(newTask);
  });

  writeDB(db);
  return createdTasks;
}

// Calculation core: Recalculates streak, stats and unlocks badges
export function recalculateCoreMetrics(userId: string) {
  const db = readDB();

  // Find user
  const user = db.users[userId];
  if (!user) return;

  // Clear existing calculated daily stats for recalculation or gather completions
  const userCompletions = db.completions.filter((c) => c.userId === userId);
  const userTasks = db.tasks.filter((t) => t.userId === userId);

  // Group tasks by creation date ("YYYY-MM-DD")
  const taskDates = Array.from(new Set(userTasks.map((t) => t.createdAt.split("T")[0])));
  
  // Calculate stats for each activity date
  const calculatedStats: DailyStats[] = [];

  taskDates.forEach((dateStr) => {
    const tasksForDay = userTasks.filter((t) => t.createdAt.startsWith(dateStr));
    if (tasksForDay.length === 0) return;

    const completionsForDay = userCompletions.filter((c) => c.completionDate === dateStr);
    
    // Filter out potential duplicate completions for the same task
    const uniqueCompletedTaskIds = Array.from(new Set(completionsForDay.map((c) => c.taskId)));
    const completedTasksCount = tasksForDay.filter((t) => uniqueCompletedTaskIds.includes(t.id)).length;

    const totalTasks = tasksForDay.length;
    const completedTasks = completedTasksCount;
    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    calculatedStats.push({
      id: `stat_${userId}_${dateStr}`,
      userId,
      date: dateStr,
      totalTasks,
      completedTasks,
      completionPercentage: pct,
      streakCount: 0, // Computed soon
    });
  });

  // Calculate streaks chronologically
  calculatedStats.sort((a, b) => a.date.localeCompare(b.date));

  // 1. Standard 100% daily consistency streak
  let currentStreak = 0;
  let longestStreak = 0;
  let rollingStreak = 0;

  const fullyCompletedDates = calculatedStats
    .filter((s) => s.completionPercentage === 100)
    .map((s) => s.date)
    .sort();

  if (fullyCompletedDates.length > 0) {
    const sortedStats = [...calculatedStats];
    let prevDate: Date | null = null;

    sortedStats.forEach((stat) => {
      if (stat.completionPercentage === 100) {
        if (prevDate === null) {
          rollingStreak = 1;
        } else {
          const curDate = new Date(stat.date);
          const diffTime = Math.abs(curDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) {
            rollingStreak += 1;
          } else {
            rollingStreak = 1;
          }
        }
        stat.streakCount = rollingStreak;
        prevDate = new Date(stat.date);
        
        if (rollingStreak > longestStreak) {
          longestStreak = rollingStreak;
        }
      } else {
        rollingStreak = 0;
        prevDate = null;
      }
    });

    const todayStr = getLocalDateString();
    const yesterdayDate = new Date(new Date(todayStr).getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getLocalDateString(yesterdayDate);

    const hasCompletedToday = fullyCompletedDates.includes(todayStr);
    const hasCompletedYesterday = fullyCompletedDates.includes(yesterdayStr);

    if (hasCompletedToday) {
      const todayStatIdx = sortedStats.findIndex((s) => s.date === todayStr);
      currentStreak = todayStatIdx >= 0 ? sortedStats[todayStatIdx].streakCount : 1;
    } else if (hasCompletedYesterday) {
      const yesterdayStatIdx = sortedStats.findIndex((s) => s.date === yesterdayStr);
      currentStreak = yesterdayStatIdx >= 0 ? sortedStats[yesterdayStatIdx].streakCount : 1;
    } else {
      currentStreak = rollingStreak; // Breaks
    }
  }

  // Update totalTasksCompleted overall (unique completions overall)
  const verifiedCompletions = userCompletions.filter((c) => {
    return db.tasks.some((t) => t.id === c.taskId && t.userId === userId);
  });
  const totalTasksCompleted = verifiedCompletions.length;

  // 2. New Login Streak Calculation
  // Completed task count >= 1 for that day
  const loginDates = calculatedStats
    .filter((s) => s.completedTasks >= 1)
    .map((s) => s.date)
    .sort();

  const todayStr = getLocalDateString();
  let currentLoginStreak = 0;
  if (loginDates.includes(todayStr)) {
    let checkDate = todayStr;
    while (loginDates.includes(checkDate)) {
      currentLoginStreak++;
      const nextD = new Date(checkDate);
      nextD.setDate(nextD.getDate() - 1);
      checkDate = getLocalDateString(nextD);
    }
  }

  let longestLoginStreak = 0;
  let tempLoginStreak = 0;
  let lastLoginCheckDate: string | null = null;
  loginDates.forEach((dateStr) => {
    if (lastLoginCheckDate === null) {
      tempLoginStreak = 1;
    } else {
      const prevD = new Date(dateStr);
      prevD.setDate(prevD.getDate() - 1);
      const prevDStr = getLocalDateString(prevD);
      if (lastLoginCheckDate === prevDStr) {
        tempLoginStreak++;
      } else {
        tempLoginStreak = 1;
      }
    }
    lastLoginCheckDate = dateStr;
    if (tempLoginStreak > longestLoginStreak) {
      longestLoginStreak = tempLoginStreak;
    }
  });

  // 3. New Task Completion Streak Calculation
  // Total completed tasks across consecutive successful days
  let currentTaskStreak = 0;
  let loopDate = todayStr;
  let isTaskStreakBroken = false;

  const statsByDate: Record<string, DailyStats> = {};
  calculatedStats.forEach((s) => {
    statsByDate[s.date] = s;
  });

  const taskDatesWithPlanned = calculatedStats.filter((s) => s.totalTasks > 0);
  if (taskDatesWithPlanned.length > 0) {
    const oldestDateStr = taskDatesWithPlanned[0].date;
    while (loopDate >= oldestDateStr) {
      const stat = statsByDate[loopDate];
      if (stat && stat.totalTasks > 0) {
        if (stat.completedTasks === stat.totalTasks) {
          currentTaskStreak += stat.completedTasks;
        } else {
          isTaskStreakBroken = true;
          break;
        }
      }
      const d = new Date(loopDate);
      d.setDate(d.getDate() - 1);
      loopDate = getLocalDateString(d);
    }
    if (isTaskStreakBroken) {
      currentTaskStreak = 0;
    }
  }

  let longestTaskStreak = 0;
  let tempTaskStreak = 0;
  let lastSuccessfulDate: string | null = null;
  const sortedStatsAsc = [...calculatedStats].sort((a, b) => a.date.localeCompare(b.date));
  sortedStatsAsc.forEach((stat) => {
    if (stat.totalTasks > 0) {
      if (stat.completedTasks === stat.totalTasks) {
        if (lastSuccessfulDate === null) {
          tempTaskStreak = stat.completedTasks;
        } else {
          const prevD = new Date(stat.date);
          prevD.setDate(prevD.getDate() - 1);
          const prevDStr = getLocalDateString(prevD);
          if (lastSuccessfulDate === prevDStr) {
            tempTaskStreak += stat.completedTasks;
          } else {
            tempTaskStreak = stat.completedTasks;
          }
        }
        lastSuccessfulDate = stat.date;
        if (tempTaskStreak > longestTaskStreak) {
          longestTaskStreak = tempTaskStreak;
        }
      } else {
        tempTaskStreak = 0;
        lastSuccessfulDate = null;
      }
    }
  });

  // Unlocking badges dynamically
  const earnedBadges: string[] = [];

  ALL_BADGES.forEach((b) => {
    const parts = b.id.split("_");
    const prefix = parts[0];
    const lastPart = parts[parts.length - 1];
    const targetVal = parseInt(lastPart) || 1;

    if (b.id.startsWith("login_streak_")) {
      if (currentLoginStreak >= targetVal || longestLoginStreak >= targetVal) {
        earnedBadges.push(b.id);
      }
    } else if (b.id.startsWith("task_streak_")) {
      if (currentTaskStreak >= targetVal || longestTaskStreak >= targetVal) {
        earnedBadges.push(b.id);
      }
    } else if (prefix === "login") {
      if (currentLoginStreak >= targetVal || longestLoginStreak >= targetVal) {
        earnedBadges.push(b.id);
      }
    } else if (prefix === "task") {
      if (currentStreak >= targetVal || longestStreak >= targetVal) {
        earnedBadges.push(b.id);
      }
    } else if (prefix === "total") {
      if (totalTasksCompleted >= targetVal) {
        earnedBadges.push(b.id);
      }
    } else if (prefix === "cons") {
      if (longestStreak >= targetVal) {
        earnedBadges.push(b.id);
      }
    }
  });

  // Write variables back to db
  user.currentStreak = currentStreak;
  user.longestStreak = longestStreak;
  user.totalTasksCompleted = totalTasksCompleted;
  user.currentLoginStreak = currentLoginStreak;
  user.longestLoginStreak = longestLoginStreak;
  user.currentTaskStreak = currentTaskStreak;
  user.longestTaskStreak = longestTaskStreak;

  db.userBadges[userId] = earnedBadges;

  // Filter out statistics list to only keep non-duplicates and write them in
  db.dailyStats = db.dailyStats.filter((ds) => ds.userId !== userId);
  db.dailyStats.push(...calculatedStats);

  writeDB(db);
}

// Standard data transactions
export const dbService = {
  getUsers: () => readDB().users,

  getUserById: (id: string) => {
    const db = readDB();
    return db.users[id] || null;
  },

  getUserByEmail: (email: string) => {
    const db = readDB();
    const lEmail = email.toLowerCase().trim();
    return Object.values(db.users).find((u) => u && typeof u.email === "string" && u.email.toLowerCase() === lEmail) || null;
  },

  getOrCreateUser: (id: string, email: string, username: string): User => {
    const db = readDB();
    if (db.users[id]) {
      return db.users[id];
    }

    // Check if user has a profile with the same email already
    const existingUser = Object.values(db.users).find((u) => u && typeof u.email === "string" && u.email.toLowerCase() === email.toLowerCase().trim());
    if (existingUser) {
      const oldId = existingUser.id;
      const mappedUser: User = {
        ...existingUser,
        id,
        isVerified: true,
      };
      db.users[id] = { ...mappedUser, passwordHash: db.users[oldId]?.passwordHash || "supabase_managed" };
      db.userBadges[id] = db.userBadges[oldId] || [];
      
      db.tasks.forEach((t) => { if (t.userId === oldId) t.userId = id; });
      db.completions.forEach((c) => { if (c.userId === oldId) c.userId = id; });
      db.dailyStats.forEach((s) => { if (s.userId === oldId) s.userId = id; });

      delete db.users[oldId];
      delete db.userBadges[oldId];
      writeDB(db);
      return mappedUser;
    }

    // Create a fresh user with this exact ID
    const avatarLetter = (username || "U").charAt(0).toUpperCase();
    const avatarColor = ["bg-blue-600", "bg-cyan-600", "bg-indigo-600", "bg-emerald-600", "bg-rose-600"][Math.floor(Math.random() * 5)];
    const avatar = `letter:${avatarLetter}:${avatarColor}`;

    const newUser: User = {
      id,
      username,
      email: email.toLowerCase().trim(),
      profilePicture: avatar,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      notificationEnabled: true,
      reminderTime: "09:00 AM",
      theme: "dark",
      isVerified: true,
    };

    db.users[id] = { ...newUser, passwordHash: "supabase_managed" };
    db.userBadges[id] = [];
    writeDB(db);

    ensureTasksForDay(id, getLocalDateString());
    recalculateCoreMetrics(id);

    return newUser;
  },

  createUser: (username: string, email: string, passwordHash: string): User => {
    const db = readDB();
    const id = "usr_" + Math.random().toString(36).substring(2, 11);
    
    // Choose professional clean avatar colors
    const avatarLetter = username.charAt(0).toUpperCase();
    const avatarColor = ["bg-blue-600", "bg-cyan-600", "bg-indigo-600", "bg-emerald-600", "bg-rose-600"][Math.floor(Math.random() * 5)];
    const avatar = `letter:${avatarLetter}:${avatarColor}`;

    const newUser: User = {
      id,
      username,
      email: email.toLowerCase().trim(),
      profilePicture: avatar,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      notificationEnabled: true,
      reminderTime: "09:00 AM",
      theme: "dark",
      isVerified: false,
    };

    db.users[id] = { ...newUser, passwordHash };
    db.userBadges[id] = [];
    writeDB(db);

    // Bootstrap initial tasks for today
    ensureTasksForDay(id, getLocalDateString());
    recalculateCoreMetrics(id);

    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const db = readDB();
    if (!db.users[id]) return null;

    db.users[id] = { ...db.users[id], ...updates };
    writeDB(db);
    return db.users[id];
  },

  deleteUser: (id: string) => {
    const db = readDB();
    delete db.users[id];
    db.tasks = db.tasks.filter((t) => t.userId !== id);
    db.completions = db.completions.filter((c) => c.userId !== id);
    db.dailyStats = db.dailyStats.filter((s) => s.userId !== id);
    delete db.userBadges[id];
    writeDB(db);
  },

  getTasks: (userId: string, targetDate: string = getLocalDateString()): Task[] => {
    // Make sure tomorrow or today carries forward properly
    ensureTasksForDay(userId, targetDate);

    const db = readDB();
    const usersTasks = db.tasks.filter((t) => t.userId === userId && t.createdAt.startsWith(targetDate));
    const completionsForDate = db.completions.filter((c) => c.userId === userId && c.completionDate === targetDate);
    const completedTaskIds = completionsForDate.map((c) => c.taskId);

    const sortedTasks = [...usersTasks].sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 0;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 0;
      return orderA - orderB;
    });

    return sortedTasks.map((t) => ({
      ...t,
      completedToday: completedTaskIds.includes(t.id),
    }));
  },

  createTask: (userId: string, title: string, category: TaskCategory, targetDate: string = getLocalDateString()): Task => {
    const db = readDB();
    const todayTasks = db.tasks.filter((t) => t.userId === userId && t.createdAt.startsWith(targetDate));
    const maxOrder = todayTasks.reduce((max, t) => {
      const order = t.displayOrder !== undefined ? t.displayOrder : 0;
      return order > max ? order : max;
    }, -1);

    const newTask: Task = {
      id: "tsk_" + Math.random().toString(36).substring(2, 11),
      userId,
      title,
      category,
      createdAt: new Date().toISOString().replace(/^[^T]+/, targetDate), // designation date
      completedToday: false,
      displayOrder: maxOrder + 1,
    };

    db.tasks.push(newTask);
    writeDB(db);

    recalculateCoreMetrics(userId);
    return newTask;
  },

  reorderTasks: (userId: string, taskIds: string[], targetDate: string = getLocalDateString()): Task[] => {
    const db = readDB();
    taskIds.forEach((id, index) => {
      const task = db.tasks.find((t) => t.id === id && t.userId === userId);
      if (task) {
        task.displayOrder = index;
      }
    });
    writeDB(db);

    // Fetch and return fresh list sorted
    const usersTasks = db.tasks.filter((t) => t.userId === userId && t.createdAt.startsWith(targetDate));
    const completionsForDate = db.completions.filter((c) => c.userId === userId && c.completionDate === targetDate);
    const completedTaskIds = completionsForDate.map((c) => c.taskId);

    return [...usersTasks]
      .sort((a, b) => {
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 0;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 0;
        return orderA - orderB;
      })
      .map((t) => ({
        ...t,
        completedToday: completedTaskIds.includes(t.id),
      }));
  },

  updateTask: (userId: string, taskId: string, updates: { title?: string; category?: TaskCategory }): Task | null => {
    const db = readDB();
    const taskIdx = db.tasks.findIndex((t) => t.id === taskId && t.userId === userId);
    if (taskIdx === -1) return null;

    db.tasks[taskIdx] = { ...db.tasks[taskIdx], ...updates };
    writeDB(db);

    recalculateCoreMetrics(userId);
    return db.tasks[taskIdx];
  },

  deleteTask: (userId: string, taskId: string): boolean => {
    const db = readDB();
    const beforeCount = db.tasks.length;
    db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
    // Clear completion as well
    db.completions = db.completions.filter((c) => !(c.taskId === taskId && c.userId === userId));
    
    if (db.tasks.length !== beforeCount) {
      writeDB(db);
      recalculateCoreMetrics(userId);
      return true;
    }
    return false;
  },

  toggleTaskCompletion: (userId: string, taskId: string, dateStr: string = getLocalDateString()): boolean => {
    const db = readDB();
    
    // Verify task exists
    const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);
    if (!task) return false;

    const existingCompletionIdx = db.completions.findIndex(
      (c) => c.taskId === taskId && c.userId === userId && c.completionDate === dateStr
    );

    if (existingCompletionIdx !== -1) {
      // Remove completion
      db.completions.splice(existingCompletionIdx, 1);
    } else {
      // Add completion
      const newCompletion: TaskCompletion = {
        id: "cmp_" + Math.random().toString(36).substring(2, 11),
        taskId,
        userId,
        completionDate: dateStr,
        completedAt: new Date().toISOString(),
      };
      db.completions.push(newCompletion);
    }

    writeDB(db);
    recalculateCoreMetrics(userId);
    return true;
  },

  getUserStats: (userId: string): DailyStats[] => {
    const db = readDB();
    return db.dailyStats.filter((ds) => ds.userId === userId);
  },

  getUserBadges: (userId: string): Badge[] => {
    const userBadgeIds = dbService.getUserBadgeIds(userId);
    return ALL_BADGES.map((b) => ({
      ...b,
      unlockedAt: userBadgeIds.includes(b.id) ? new Date().toISOString() : null, // simplifed mock unlock time
    }));
  },

  getUserBadgeIds: (userId: string): string[] => {
    const db = readDB();
    const user = db.users[userId];
    if (!user) return [];

    const currentLoginStreak = user.currentLoginStreak || 0;
    const longestLoginStreak = user.longestLoginStreak || 0;
    const currentTaskStreak = user.currentTaskStreak || 0;
    const longestTaskStreak = user.longestTaskStreak || 0;
    const currentStreak = user.currentStreak || 0;
    const longestStreak = user.longestStreak || 0;
    const totalTasksCompleted = user.totalTasksCompleted || 0;

    const earnedBadges: string[] = [];

    ALL_BADGES.forEach((b) => {
      const parts = b.id.split("_");
      const prefix = parts[0];
      const lastPart = parts[parts.length - 1];
      const targetVal = parseInt(lastPart) || 1;

      if (b.id.startsWith("login_streak_")) {
        if (currentLoginStreak >= targetVal || longestLoginStreak >= targetVal) {
          earnedBadges.push(b.id);
        }
      } else if (b.id.startsWith("task_streak_")) {
        if (currentTaskStreak >= targetVal || longestTaskStreak >= targetVal) {
          earnedBadges.push(b.id);
        }
      } else if (prefix === "login") {
        if (currentLoginStreak >= targetVal || longestLoginStreak >= targetVal) {
          earnedBadges.push(b.id);
        }
      } else if (prefix === "task") {
        if (currentStreak >= targetVal || longestStreak >= targetVal) {
          earnedBadges.push(b.id);
        }
      } else if (prefix === "total") {
        if (totalTasksCompleted >= targetVal) {
          earnedBadges.push(b.id);
        }
      } else if (prefix === "cons") {
        if (longestStreak >= targetVal) {
          earnedBadges.push(b.id);
        }
      }
    });

    return earnedBadges;
  },

  exportUserData: (userId: string): ExportData | null => {
    const db = readDB();
    const user = db.users[userId];
    if (!user) return null;

    return {
      user,
      tasks: db.tasks.filter((t) => t.userId === userId),
      completions: db.completions.filter((c) => c.userId === userId),
      stats: db.dailyStats.filter((s) => s.userId === userId),
    };
  },

  importUserSlices: (userId: string, dataSlice: any): void => {
    const db = readDB();
    if (dataSlice) {
      if (dataSlice.user) {
        db.users[userId] = { ...dataSlice.user, id: userId };
      }
      if (Array.isArray(dataSlice.tasks)) {
        db.tasks = db.tasks.filter((t) => t.userId !== userId).concat(dataSlice.tasks);
      }
      if (Array.isArray(dataSlice.completions)) {
        db.completions = db.completions.filter((c) => c.userId !== userId).concat(dataSlice.completions);
      }
      if (Array.isArray(dataSlice.dailyStats)) {
        db.dailyStats = db.dailyStats.filter((s) => s.userId !== userId).concat(dataSlice.dailyStats);
      }
      db.userBadges[userId] = Array.isArray(dataSlice.userBadges) ? dataSlice.userBadges : (db.userBadges[userId] || []);
      writeDB(db);
    }
  },

  exportUserSlices: (userId: string) => {
    const db = readDB();
    const user = db.users[userId];
    return {
      user,
      tasks: db.tasks.filter((t) => t.userId === userId),
      completions: db.completions.filter((c) => c.userId === userId),
      dailyStats: db.dailyStats.filter((s) => s.userId === userId),
      userBadges: db.userBadges[userId] || [],
    };
  }
};
