/**
 * @license
 * Apache-2.0
 */

import * as fs from "fs";
import * as path from "path";
import { User, Task, TaskCompletion, DailyStats, Badge, TaskCategory, ExportData } from "../src/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DBLocalSchema {
  users: Record<string, User & { passwordHash: string }>;
  tasks: Task[];
  completions: TaskCompletion[];
  dailyStats: DailyStats[];
  userBadges: Record<string, string[]>; // userId -> badgeIds array
}

// Master Badge configurations
export const ALL_BADGES: { id: string; name: string; description: string; iconName: string }[] = [
  {
    id: "login_streak_7",
    name: "7 Days Login Streak 🔥",
    description: "Logged in for 7 consecutive days active.",
    iconName: "Flame",
  },
  {
    id: "login_streak_100",
    name: "100 Days Login Streak 🏆",
    description: "Locked in for 100 consecutive days of focus.",
    iconName: "Trophy",
  },
  {
    id: "streak_7",
    name: "7 Days Completion Streak 🚀",
    description: "Complete all active daily tasks 7 days continuous.",
    iconName: "CheckCircle2",
  },
  {
    id: "streak_30",
    name: "30 Days Completion Streak 🛡️",
    description: "Maintain a flawless 100% completion 30 days straight.",
    iconName: "ShieldCheck",
  },
  {
    id: "streak_100",
    name: "100 Days Completion Streak 🌟",
    description: "Sustain daily excellence for a 100 days streak.",
    iconName: "Sparkles",
  },
  {
    id: "volume_7",
    name: "7 Tasks Completed ⚡",
    description: "Checked off a total of 7 discipline tasks.",
    iconName: "BarChart3",
  },
  {
    id: "volume_100",
    name: "100 Tasks Completed 🎓",
    description: "Completed 100 tasks of personal commitment.",
    iconName: "Award",
  },
  {
    id: "volume_500",
    name: "500 Tasks Completed 👑",
    description: "Legendary milestone of 500 lifetime task completions.",
    iconName: "Trophy",
  },
];

// Helper to format LocalDate as "YYYY-MM-DD"
export function getLocalDateString(dateObj: Date = new Date()): string {
  const offset = dateObj.getTimezoneOffset();
  const adjusted = new Date(dateObj.getTime() - offset * 60 * 1000);
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
// Ensure tasks exist for today, else clone unfinished ones from yesterday
export function ensureTasksForDay(userId: string, targetDate: string): Task[] {
  const db = readDB();
  
  // Find tasks created for "targetDate" (matching year, month, day)
  const usersTasks = db.tasks.filter((t) => t.userId === userId);
  const targetDateTasks = usersTasks.filter((t) => t.createdAt.startsWith(targetDate));

  if (targetDateTasks.length > 0) {
    // Already has tasks designated for today
    return targetDateTasks;
  }

  // Otherwise, today is empty. We need to auto carry forward!
  // Find tasks from "yesterday"
  const yesterdayDate = new Date(new Date(targetDate).getTime() - 24 * 60 * 60 * 1000);
  const yesterdayString = getLocalDateString(yesterdayDate);
  const yesterdayTasks = usersTasks.filter((t) => t.createdAt.startsWith(yesterdayString));

  let tasksToCarry: Omit<Task, "id" | "createdAt">[] = [];

  if (yesterdayTasks.length > 0) {
    // Find completions from yesterday
    const completedYesterdayTaskIds = db.completions
      .filter((c) => c.userId === userId && c.completionDate === yesterdayString)
      .map((c) => c.taskId);

    // Get any yesterday task NOT in completedYesterdayTaskIds list
    const uncompletedYesterdayTasks = yesterdayTasks.filter((t) => !completedYesterdayTaskIds.includes(t.id));

    if (uncompletedYesterdayTasks.length > 0) {
      // Carry forward the actual unfinished tasks
      tasksToCarry = uncompletedYesterdayTasks.map((t) => ({
        userId: userId,
        title: t.title,
        category: t.category,
        completedToday: false,
      }));
    } else {
      // If yesterday's tasks were all completed, carry forward all profiles so the user isn't blank,
      // or copy everything to restart. Let's copy all of yesterday's tasks as templates!
      tasksToCarry = yesterdayTasks.map((t) => ({
        userId: userId,
        title: t.title,
        category: t.category,
        completedToday: false,
      }));
    }
  } else {
    // No tasks from yesterday either! Check if there are any previous tasks at all
    const newestTaskCreatedAt = usersTasks.reduce((max, t) => (t.createdAt > max ? t.createdAt : max), "");
    if (newestTaskCreatedAt) {
      const parentDate = newestTaskCreatedAt.split("T")[0];
      const parentTasks = usersTasks.filter((t) => t.createdAt.startsWith(parentDate));
      tasksToCarry = parentTasks.map((t) => ({
        userId: userId,
        title: t.title,
        category: t.category,
        completedToday: false,
      }));
    } else {
      // Absolute first day or fresh user! Seed SIX default tasks
      const defaults: { title: string; category: TaskCategory }[] = [
        { title: "DSA Practice Problems", category: "DSA" },
        { title: "Java Development Concepts", category: "Java" },
        { title: "Communication Skills Accent & Pitch", category: "Communication" },
        { title: "Aptitude & Logical Reasoning Drills", category: "Aptitude" },
        { title: "Fitness Gym / Running Routine", category: "Fitness" },
        { title: "Read 10 Pages of Philosophy", category: "Reading" },
      ];
      tasksToCarry = defaults.map((d) => ({
        userId: userId,
        title: d.title,
        category: d.category,
        completedToday: false,
      }));
    }
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

  let currentStreak = 0;
  let longestStreak = 0;
  let rollingStreak = 0;

  // Sort dates of 100% completions
  const fullyCompletedDates = calculatedStats
    .filter((s) => s.completionPercentage === 100)
    .map((s) => s.date)
    .sort();

  // Calculate streaking logic
  if (fullyCompletedDates.length > 0) {
    const sortedStats = [...calculatedStats];
    let prevDate: Date | null = null;

    sortedStats.forEach((stat) => {
      if (stat.completionPercentage === 100) {
        if (prevDate === null) {
          rollingStreak = 1;
        } else {
          // Check if distance is exactly 1 day
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
        // Did not hit 100% today - but check if we should break rolling streak
        // If this is a historical date, we break rolling streak
        rollingStreak = 0;
        prevDate = null;
      }
    });

    // To compute currentStreak leading to TODAY:
    // User preserves current streak if today is 100% or yesterday was 100% and they are still working on today.
    const todayStr = getLocalDateString();
    const yesterdayDate = new Date(new Date(todayStr).getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getLocalDateString(yesterdayDate);

    const hasCompletedToday = fullyCompletedDates.includes(todayStr);
    const hasCompletedYesterday = fullyCompletedDates.includes(yesterdayStr);

    if (hasCompletedToday) {
      // Current active running streak includes today
      const todayStatIdx = sortedStats.findIndex((s) => s.date === todayStr);
      currentStreak = todayStatIdx >= 0 ? sortedStats[todayStatIdx].streakCount : 1;
    } else if (hasCompletedYesterday) {
      // Stays valid because they still have today to finish
      const yesterdayStatIdx = sortedStats.findIndex((s) => s.date === yesterdayStr);
      currentStreak = yesterdayStatIdx >= 0 ? sortedStats[yesterdayStatIdx].streakCount : 1;
    } else {
      currentStreak = rollingStreak; // Breaks
    }
  }

  // Update totalTasksCompleted overall (unique completions overall)
  const verifiedCompletions = userCompletions.filter((c) => {
    // Only count completions for tasks that actually exist in DB
    return db.tasks.some((t) => t.id === c.taskId && t.userId === userId);
  });
  const totalTasksCompleted = verifiedCompletions.length;

  // Unlocking badges dynamically
  const earnedBadges: string[] = db.userBadges[userId] || [];

  // Volume Badges:
  if (totalTasksCompleted >= 7 && !earnedBadges.includes("volume_7")) {
    earnedBadges.push("volume_7");
  }
  if (totalTasksCompleted >= 100 && !earnedBadges.includes("volume_100")) {
    earnedBadges.push("volume_100");
  }
  if (totalTasksCompleted >= 500 && !earnedBadges.includes("volume_500")) {
    earnedBadges.push("volume_500");
  }

  // Task Completion Streaks:
  if (longestStreak >= 7 && !earnedBadges.includes("streak_7")) {
    earnedBadges.push("streak_7");
  }
  if (longestStreak >= 30 && !earnedBadges.includes("streak_30")) {
    earnedBadges.push("streak_30");
  }
  if (longestStreak >= 100 && !earnedBadges.includes("streak_100")) {
    earnedBadges.push("streak_100");
  }

  // Login Streak Badges:
  // Using active days logged in calculatedStats style or matching current active streak
  const loginStreakVal = Math.max(currentStreak, longestStreak, calculatedStats.length);
  if (loginStreakVal >= 7 && !earnedBadges.includes("login_streak_7")) {
    earnedBadges.push("login_streak_7");
  }
  if (loginStreakVal >= 100 && !earnedBadges.includes("login_streak_100")) {
    earnedBadges.push("login_streak_100");
  }

  // Write variables back to db
  user.currentStreak = currentStreak;
  user.longestStreak = longestStreak;
  user.totalTasksCompleted = totalTasksCompleted;

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
    return Object.values(db.users).find((u) => u.email.toLowerCase() === lEmail) || null;
  },

  getOrCreateUser: (id: string, email: string, username: string): User => {
    const db = readDB();
    if (db.users[id]) {
      return db.users[id];
    }

    // Check if user has a profile with the same email already
    const existingUser = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
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

    return usersTasks.map((t) => ({
      ...t,
      completedToday: completedTaskIds.includes(t.id),
    }));
  },

  createTask: (userId: string, title: string, category: TaskCategory, targetDate: string = getLocalDateString()): Task => {
    const db = readDB();
    const newTask: Task = {
      id: "tsk_" + Math.random().toString(36).substring(2, 11),
      userId,
      title,
      category,
      createdAt: new Date().toISOString().replace(/^[^T]+/, targetDate), // designation date
      completedToday: false,
    };

    db.tasks.push(newTask);
    writeDB(db);

    recalculateCoreMetrics(userId);
    return newTask;
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
    const db = readDB();
    const userBadgeIds = db.userBadges[userId] || [];
    return ALL_BADGES.map((b) => ({
      ...b,
      unlockedAt: userBadgeIds.includes(b.id) ? new Date().toISOString() : null, // simplifed mock unlock time
    }));
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
  }
};
