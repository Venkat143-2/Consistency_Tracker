/**
 * @license
 * Apache-2.0
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local first (takes precedence), then fall back to .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import express, { Request, Response, NextFunction } from "express";
import { dbService, getLocalDateString } from "./server/db.js";
import { TaskCategory } from "./src/types.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://cwnkgmxssmjkqkyvzqnp.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bmtnbXhzc21qa3FreXZ6cW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjUwNzUsImV4cCI6MjA5NTcwMTA3NX0.VBIWcgy1BM1OaQWlzanABX8MNWU-RAtz_xfxIiBcDV4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function isSupabaseNetworkError(err: any): boolean {
  if (!err) return false;
  
  const message = (err.message || String(err)).toLowerCase();
  const name = (err.name || "").toLowerCase();
  const code = (err.code || "").toUpperCase();

  return (
    name === "authretryablefetcherror" ||
    name.includes("fetcherror") ||
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    code === "EHOSTUNREACH" ||
    code === "EAI_AGAIN" ||
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("etimedout") ||
    message.includes("econnreset") ||
    message.includes("socket hang up") ||
    message.includes("timeout") ||
    message.includes("unreachable") ||
    message === "{}"
  );
}

async function syncFromSupabase(userId: string, token: string): Promise<void> {
  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data, error } = await userClient
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (error) {
      if (isSupabaseNetworkError(error)) {
        console.warn(`[Sync] Network connection to Supabase failed during fetch for user ${userId}.`);
      } else {
        console.warn(`[Sync] Failed to fetch profile sync for user ${userId}:`, error.message);
      }
      return;
    }

    if (data && data.full_name && data.full_name.startsWith("{")) {
      const slice = JSON.parse(data.full_name);
      (dbService as any).importUserSlices(userId, slice);
      console.log(`[Sync] Successfully restored database state from Supabase for user ${userId}`);
    }
  } catch (err: any) {
    if (isSupabaseNetworkError(err)) {
      console.error(`[Sync] Network connection to Supabase failed during syncFromSupabase for user ${userId}.`);
    } else {
      console.error(`[Sync] Error syncing from Supabase for user ${userId}:`, err?.message || err);
    }
  }
}

async function syncToSupabase(userId: string, token: string): Promise<void> {
  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const slice = (dbService as any).exportUserSlices(userId);
    const payload = JSON.stringify(slice);

    const { error } = await userClient
      .from("profiles")
      .update({ full_name: payload })
      .eq("id", userId);

    if (error) {
      if (isSupabaseNetworkError(error)) {
        console.warn(`[Sync] Network connection to Supabase failed during update for user ${userId}.`);
      } else {
        console.warn(`[Sync] Failed to save profile sync for user ${userId}:`, error.message);
      }
    } else {
      console.log(`[Sync] Successfully saved database state to Supabase for user ${userId}`);
    }
  } catch (err: any) {
    if (isSupabaseNetworkError(err)) {
      console.error(`[Sync] Network connection to Supabase failed during syncToSupabase for user ${userId}.`);
    } else {
      console.error(`[Sync] Error syncing to Supabase for user ${userId}:`, err?.message || err);
    }
  }
}

// Helper to calculate total active days
function getDaysBetween(d1: string, d2: string): number {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// Helper to safely parse HTTP status codes from Supabase / external services
function getSafeStatus(status: any, defaultStatus = 400): number {
  if (!status) return defaultStatus;
  const num = Number(status);
  return (isNaN(num) || num < 100 || num > 599) ? defaultStatus : num;
}

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json({ limit: "15mb" }));

  // Simplistic auth token handler
  // Handled either by a Header "Authorization: Bearer <user_id>" or dynamic parameters
  const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access denied. Auth token missing." });
        return;
      }
      const token = authHeader.split(" ")[1];
      if (!token || token === "null" || token === "undefined") {
        res.status(401).json({ error: "Access denied. Invalid session token." });
        return;
      }

      let userId = token;
      let user = null;

      if (token.includes(".")) {
        // Supabase JWT authentication
        let sbUser = null;
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (error) {
            if (isSupabaseNetworkError(error)) {
              res.status(503).json({ error: "Network connection to Supabase failed. Unable to authenticate session." });
              return;
            }
            res.status(401).json({ error: "Invalid Supabase session." });
            return;
          }
          sbUser = user;
        } catch (authErr: any) {
          if (isSupabaseNetworkError(authErr)) {
            res.status(503).json({ error: "Network connection to Supabase failed. Unable to verify token." });
            return;
          }
          throw authErr;
        }

        if (!sbUser) {
          res.status(401).json({ error: "Invalid Supabase session." });
          return;
        }
        userId = sbUser.id;

        // Sync from Supabase to ensure they are using latest distributed data
        await syncFromSupabase(userId, token);

        user = dbService.getOrCreateUser(userId, sbUser.email!, sbUser.user_metadata?.username || sbUser.email!.split("@")[0]);
      } else {
        // Local fallback / mock authentication
        user = dbService.getUserById(token);
      }

      if (!user) {
        res.status(401).json({ error: "Session expired or invalid user." });
        return;
      }

      // Automatically sync changes back after the request finished serving (async afterwrite hook pattern)
      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson; // restoration
        const result = originalJson.call(this, body);

        if (token.includes(".")) {
          syncToSupabase(userId, token).catch((err) => {
            console.error("Delayed syncToSupabase failed in background:", err);
          });
        }
        return result;
      };

      // Attach user and token to request
      (req as any).user = user;
      (req as any).token = token;
      next();
    } catch (err: any) {
      console.error("Authentication middleware failure:", err);
      res.status(500).json({ error: "Authentication system error: " + err.message });
    }
  };

  // --- API ROUTING ENTRY POINTS ---

  // Auth: Register (Pure Supabase-only flow with strict validation and conflict checking)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        res.status(400).json({ error: "Username, email, and password are required." });
        return;
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.toLowerCase().trim();

      // Supabase registration
      let data, error;
      try {
        const result = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
            },
          },
        });
        data = result.data;
        error = result.error;
      } catch (signUpErr: any) {
        if (isSupabaseNetworkError(signUpErr)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please make sure that your custom Supabase project is active and try again." });
          return;
        }
        throw signUpErr;
      }

      if (error) {
        if (isSupabaseNetworkError(error)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please make sure that your custom Supabase project is active and try again." });
          return;
        }
        const errMessage = error.message || "Registration failed via Supabase.";
        res.status(getSafeStatus(error.status, 400)).json({ error: errMessage });
        return;
      }

      if (data.user) {
        res.status(201).json({
          success: true,
          message: "Verification email sent. Please check your inbox and click the confirmation link to complete registration.",
        });
      } else {
        res.status(400).json({ error: "Sign up succeeded but user details were empty." });
      }
    } catch (err: any) {
      console.error("Registration error in server.ts:", err);
      res.status(500).json({ error: err.message || "An error occurred during registration." });
    }
  });

  // Auth: Login (Pure Supabase-only flow)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }

      // Supabase login
      let data, error;
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = result.data;
        error = result.error;
      } catch (signInErr: any) {
        if (isSupabaseNetworkError(signInErr)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please verify that your custom Supabase project is active and try again." });
          return;
        }
        throw signInErr;
      }

      if (error) {
        if (isSupabaseNetworkError(error)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please check your internet connection." });
          return;
        }
        res.status(getSafeStatus(error.status, 401)).json({ error: error.message || "Authentication failed via Supabase." });
        return;
      }

      if (data.user) {
        // Enforce email verification check
        if (data.user.email && !data.user.email_confirmed_at && !data.session) {
          res.status(401).json({ error: "Please confirm your email address before logging in. Check your inbox for the verification link." });
          return;
        }

        const usernameVal = data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User";
        const userRecord = dbService.getOrCreateUser(data.user.id, data.user.email!, usernameVal);

        if (data.session?.access_token) {
          await syncFromSupabase(data.user.id, data.session.access_token);
        }

        res.json({
          user: userRecord,
          token: data.session?.access_token || data.user.id,
          message: "Welcome back! Login successful."
        });
      } else {
        res.status(401).json({ error: "Login succeeded but user details were empty." });
      }
    } catch (err: any) {
      console.error("Login error in server.ts:", err);
      res.status(500).json({ error: err.message || "Authentication failed." });
    }
  });

  // Auth: Forgot Password (Pure Supabase-only flow)
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required." });
        return;
      }

      // Supabase forgot password
      let error;
      try {
        const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.origin || "http://localhost:3000"}/login?view=reset`,
        });
        error = result.error;
      } catch (forgotErr: any) {
        if (isSupabaseNetworkError(forgotErr)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Unable to trigger password recovery." });
          return;
        }
        throw forgotErr;
      }

      if (error) {
        if (isSupabaseNetworkError(error)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please try again." });
          return;
        }
        res.status(getSafeStatus(error.status, 400)).json({ error: error.message || "Failed to trigger password recovery." });
        return;
      }

      res.json({ message: "A recovery email has been sent. Please check your inbox." });
    } catch (err: any) {
      if (isSupabaseNetworkError(err)) {
        res.status(503).json({ error: "Network connection to Supabase failed." });
      } else {
        res.status(500).json({ error: err.message || "Failed to process forgot password." });
      }
    }
  });

  // Auth: Reset Password (Pure Supabase-only flow)
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: "New password is required." });
        return;
      }

      // Supabase reset password using Bearer token of current user
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authentication token is required to reset password." });
        return;
      }
      const token = authHeader.split(" ")[1];

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      let error;
      try {
        const result = await userClient.auth.updateUser({ password });
        error = result.error;
      } catch (resetErr: any) {
        if (isSupabaseNetworkError(resetErr)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Unable to reset password." });
          return;
        }
        throw resetErr;
      }

      if (error) {
        if (isSupabaseNetworkError(error)) {
          res.status(503).json({ error: "Network connection to Supabase failed. Please try again." });
          return;
        }
        res.status(getSafeStatus(error.status, 400)).json({ error: error.message || "Failed to update password." });
        return;
      }

      res.json({ message: "Your password has been successfully updated. Please log in." });
    } catch (err: any) {
      if (isSupabaseNetworkError(err)) {
        res.status(503).json({ error: "Network connection to Supabase failed." });
      } else {
        res.status(500).json({ error: err.message || "Failed to reset password." });
      }
    }
  });

  // Auth: Sync Supabase User with Local Profile
  app.post("/api/auth/sync", async (req: Request, res: Response) => {
    try {
      const { id, email, username } = req.body;
      if (!id || !email) {
        res.status(400).json({ error: "Missing required sync parameters id and email." });
        return;
      }

      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

      if (token && token.includes(".")) {
        // Sync existing data down from Supabase first
        await syncFromSupabase(id, token);
      }

      const user = dbService.getOrCreateUser(id, email, username || email.split("@")[0]);

      if (token && token.includes(".")) {
        // Save initial user state back up to Supabase
        await syncToSupabase(id, token);
      }

      res.json({ user, token: token || id });
    } catch (err: any) {
      console.error("Session sync failed:", err);
      if (isSupabaseNetworkError(err)) {
        res.status(503).json({ error: "Network connection to Supabase failed. Session sync failed." });
      } else {
        res.status(500).json({ error: err.message || "Session sync failed." });
      }
    }
  });

  // Auth: Me Info
  app.get("/api/auth/me", authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({ user });
  });

  // Tasks List GET
  app.get("/api/tasks", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const targetDate = (req.query.date as string) || getLocalDateString();
      const tasks = dbService.getTasks(user.id, targetDate);
      res.json({ tasks });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load tasks." });
    }
  });

  // Tasks: Reorder
  app.post("/api/tasks/reorder", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { taskIds, date } = req.body;
      if (!Array.isArray(taskIds)) {
        res.status(400).json({ error: "taskIds must be an array of task IDs." });
        return;
      }
      const targetDate = date || getLocalDateString();
      const tasks = dbService.reorderTasks(user.id, taskIds, targetDate);
      res.json({ success: true, tasks });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to reorder tasks." });
    }
  });

  // Tasks: Create
  app.post("/api/tasks", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { title, category, date } = req.body;
      if (!title || !category) {
        res.status(400).json({ error: "Task title and category are required." });
        return;
      }
      const targetDate = date || getLocalDateString();
      const task = dbService.createTask(user.id, title, category as TaskCategory, targetDate);
      res.status(201).json({ task });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create task." });
    }
  });

  // Tasks: Edit
  app.put("/api/tasks/:id", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;
      const { title, category } = req.body;
      const updated = dbService.updateTask(user.id, taskId, { title, category });
      if (!updated) {
        res.status(404).json({ error: "Task not found." });
        return;
      }
      res.json({ task: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to edit task." });
    }
  });

  // Tasks: Delete
  app.delete("/api/tasks/:id", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;
      const success = dbService.deleteTask(user.id, taskId);
      if (!success) {
        res.status(404).json({ error: "Task not found." });
        return;
      }
      res.json({ success: true, message: "Task deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete task." });
    }
  });

  // Tasks: Toggle completion
  app.post("/api/tasks/:id/toggle", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;
      const targetDate = (req.body.date as string) || getLocalDateString();

      const success = dbService.toggleTaskCompletion(user.id, taskId, targetDate);
      if (!success) {
        res.status(404).json({ error: "Task not found or unauthorized." });
        return;
      }

      // Fetch freshly upgraded lists & user scores
      const updatedTasks = dbService.getTasks(user.id, targetDate);
      const updatedUser = dbService.getUserById(user.id);

      res.json({
        success: true,
        tasks: updatedTasks,
        user: updatedUser
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to toggle task." });
    }
  });

  // Analytics: Dashboard & Heatmap
  app.get("/api/analytics", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const stats = dbService.getUserStats(user.id);
      
      // Calculate overall statistics
      const totalcompletions = stats.reduce((sum, s) => sum + s.completedTasks, 0);
      const fullyCompletedDays = stats.filter((s) => s.completionPercentage === 100).length;
      
      const accountAge = getDaysBetween(user.createdAt.split("T")[0], getLocalDateString());
      const consistencyScore = Math.min(100, Math.round((fullyCompletedDays / accountAge) * 100));

      const averageCompletion = stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + s.completionPercentage, 0) / stats.length) 
        : 0;

      // Unpack categories distribution
      const dbTasks = dbService.getTasks(user.id); // for current categories setup or master fallback
      // Custom grouping
      const allDoneCompletions = stats.reduce((acc: Record<string, number>, s) => {
        // Mock static categorizations distribution or pull from historical tasks
        acc["DSA"] = (acc["DSA"] || 0) + Math.round(s.completedTasks * 0.25);
        acc["Java"] = (acc["Java"] || 0) + Math.round(s.completedTasks * 0.2);
        acc["Communication"] = (acc["Communication"] || 0) + Math.round(s.completedTasks * 0.15);
        acc["Aptitude"] = (acc["Aptitude"] || 0) + Math.round(s.completedTasks * 0.15);
        acc["Fitness"] = (acc["Fitness"] || 0) + Math.round(s.completedTasks * 0.15);
        acc["Reading"] = (acc["Reading"] || 0) + Math.round(s.completedTasks * 0.1);
        return acc;
      }, { DSA: 0, Java: 0, Communication: 0, Aptitude: 0, Fitness: 0, Reading: 0 });

      const categoryDistribution = Object.entries(allDoneCompletions).map(([name, value]) => ({
        name,
        value: value > 0 ? value : Math.floor(Math.random() * 5) // ensure visible items
      }));

      // Find best month
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const currentMonthIndex = new Date().getMonth();
      const bestMonth = months[currentMonthIndex]; // defaulted to current month for visual preview

      res.json({
        stats,
        summary: {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalTasksCompleted: user.totalTasksCompleted,
          averageCompletion,
          accountAge,
          fullyCompletedDays,
          bestMonth,
          consistencyScore,
        },
        categoryDistribution
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load analytics." });
    }
  });

  // Badges lists GET
  app.get("/api/badges", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Attempt to query all missions from Supabase 'missions' table
      let fetchedMissions: any[] = [];
      try {
        const { data, error } = await supabase
          .from("missions")
          .select("*")
          .order("sort_order", { ascending: true });
        
        if (!error && data && data.length > 0) {
          fetchedMissions = data;
        } else if (error) {
          console.warn("[Missions API] Supabase query error:", error.message);
        }
      } catch (e: any) {
        console.warn("[Missions API] Failed to fetch missions from Supabase, falling back:", e.message);
      }

      const userBadgeIds = (dbService as any).getUserBadgeIds(user.id);

      // Map Supabase missions to Badge format
      let badges: any[] = [];
      if (fetchedMissions.length > 0) {
        // Map icon names to proper PascalCase icons
        const mapIconName = (icon: string): string => {
          if (!icon) return "Award";
          const lower = icon.toLowerCase().trim();
          switch (lower) {
            case "flame": return "Flame";
            case "trophy": return "Trophy";
            case "circle-check":
            case "circlecheck":
            case "check-circle":
            case "checkcircle2":
              return "CheckCircle2";
            case "shield-check":
            case "shieldcheck":
              return "ShieldCheck";
            case "sparkles": return "Sparkles";
            case "bar-chart-3":
            case "barchart3":
              return "BarChart3";
            case "award": return "Award";
            case "gem": return "Gem";
            case "crown": return "Crown";
            case "sprout": return "Sprout";
            case "zap": return "Zap";
            case "shield": return "Shield";
            case "dumbbell": return "Dumbbell";
            case "rocket": return "Rocket";
            case "star": return "Star";
            case "book": return "Book";
            case "galaxy": return "Galaxy";
            default: return "Award";
          }
        };

        badges = fetchedMissions.map((m) => ({
          id: m.key,
          name: m.title || m.name,
          description: m.description || `Milestone mission targeting ${m.target}`,
          iconName: mapIconName(m.icon),
          unlockedAt: userBadgeIds.includes(m.key) ? new Date().toISOString() : null,
        }));
      } else {
        // Fallback to local comprehensive list of badges
        badges = dbService.getUserBadges(user.id);
      }

      res.json({ badges });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch badges." });
    }
  });

  // User Profile: Update Name, Email, Settings
  app.put("/api/user/profile", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { username, email, reminderTime, notificationEnabled, theme } = req.body;

      const updates: Partial<any> = {};
      if (username) updates.username = username;
      if (email) updates.email = email;
      if (reminderTime) updates.reminderTime = reminderTime;
      if (theme) updates.theme = theme;
      if (typeof notificationEnabled === "boolean") updates.notificationEnabled = notificationEnabled;

      const updated = dbService.updateUser(user.id, updates);
      res.json({ user: updated, message: "Profile settings updated successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update profile." });
    }
  });

  // Profile: Upload avatar profile image
  app.post("/api/user/upload-avatar", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { profilePicture } = req.body;
      if (!profilePicture) {
        res.status(400).json({ error: "Profile picture payload is required." });
        return;
      }

      const updated = dbService.updateUser(user.id, { profilePicture });
      res.json({ user: updated, message: "Avatar picture updated successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update avatar." });
    }
  });

  // Settings: Delete Account
  app.post("/api/user/delete-account", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      dbService.deleteUser(user.id);
      res.json({ message: "Account deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete account." });
    }
  });

  // Settings: Export User Data
  app.get("/api/user/export-data", authenticateUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const exportJson = dbService.exportUserData(user.id);
      if (!exportJson) {
        res.status(404).json({ error: "Data export failed." });
        return;
      }
      res.setHeader("Content-disposition", `attachment; filename=consistency_backup_${user.username}.json`);
      res.setHeader("Content-type", "application/json");
      res.write(JSON.stringify(exportJson, null, 2), "utf-8");
      res.end();
    } catch (err: any) {
      res.status(500).json({ error: "Failed to export data." });
    }
  });


  // --- VITE DEV/PRODUCTION SETUP ---

  async function setupViteAndListen() {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Consistency Tracker Server running on http://localhost:${PORT}`);
      });
    }
  }

  setupViteAndListen();

export default app;
