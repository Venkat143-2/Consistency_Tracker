/**
 * @license
 * Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string; // URL or letter avatar
  createdAt: string; // ISO String
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  notificationEnabled: boolean;
  reminderTime: string; // "09:00 AM", etc.
  theme: "light" | "dark";
  isVerified: boolean;
  currentLoginStreak?: number;
  longestLoginStreak?: number;
  currentTaskStreak?: number;
  longestTaskStreak?: number;
}

export type TaskCategory = "DSA" | "Java" | "Communication" | "Aptitude" | "Fitness" | "Reading" | "Other";

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  createdAt: string; // ISO String
  completedToday: boolean; // Computed for current local date relative to completion records
  displayOrder?: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  completionDate: string; // "YYYY-MM-DD" style key
  completedAt: string; // ISO String timestamp
}

export interface DailyStats {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number; // (completedTasks / totalTasks) * 100
  streakCount: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // lucide icon identifier
  unlockedAt: string | null; // null if locked, or ISO string when unlocked
}

export interface AuthResponse {
  user: User | null;
  message?: string;
  error?: string;
  token?: string;
}

export interface ExportData {
  user: User;
  tasks: Task[];
  completions: TaskCompletion[];
  stats: DailyStats[];
}
