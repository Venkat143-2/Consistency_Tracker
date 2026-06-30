/**
 * @license
 * Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle, Database } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

async function safeFetchJson(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const text = await response.text();
  
  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.includes("The page cannot be found")) {
    const htmlErr = new Error(`Server returned HTML instead of JSON. Ensure the server is running and the route '${url}' is registered.`);
    (htmlErr as any).status = response.status;
    (htmlErr as any).statusText = response.statusText;
    throw htmlErr;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (err: any) {
    if (!response.ok) {
      const parseErr = new Error(`Server returned status ${response.status}: ${response.statusText || "Request failed"}`);
      (parseErr as any).status = response.status;
      (parseErr as any).statusText = response.statusText;
      throw parseErr;
    }
    const rawErr = new Error(err.message || "Unable to parse server response.");
    (rawErr as any).status = response.status;
    throw rawErr;
  }

  if (!response.ok) {
    const errorObj = new Error(data.error || `Server responded with error status ${response.status}`);
    (errorObj as any).status = response.status;
    (errorObj as any).statusText = response.statusText;
    (errorObj as any).responseBody = data;
    throw errorObj;
  }
  return data;
}

function formatSupabaseError(err: any): string {
  if (!err) return "An unknown error occurred.";

  // Extract the most specific message first
  let rawMsg = "";
  if (typeof err === "string") {
    rawMsg = err;
  } else if (err.responseBody && (err.responseBody.error || err.responseBody.message)) {
    rawMsg = err.responseBody.error || err.responseBody.message;
  } else {
    rawMsg = err.message || err.description || err.error_description || String(err);
  }

  const lowered = rawMsg.toLowerCase();
  if (lowered.includes("invalid login credentials") || lowered.includes("invalid_credentials")) {
    return "Invalid Login Credentials";
  }
  if (lowered.includes("rate limit") || lowered.includes("rate_limit") || lowered.includes("exeed") || err.status === 429) {
    return "Email Rate Limit Exeed";
  }

  // Detect network or fetch connection failures specifically
  const isNetworkOrFetchError = 
    err.name === "AuthRetryableFetchError" ||
    err.status === 503 ||
    (rawMsg && (
      rawMsg.includes("fetch") || 
      rawMsg.includes("Failed to fetch") || 
      rawMsg.includes("NetworkError") ||
      rawMsg.includes("Network connection to Supabase failed") ||
      rawMsg.includes("unreachable") ||
      rawMsg.includes("getaddrinfo") ||
      rawMsg.includes("ECONN") ||
      rawMsg.includes("socket hang up") ||
      rawMsg === "{}"
    ));

  if (isNetworkOrFetchError) {
    return "Network connection failed. Please try again.";
  }

  return rawMsg;
}

interface AuthProps {
  onLoginSuccess: (token: string) => void;
  defaultView?: "login" | "register" | "forgot" | "reset";
  onViewChange?: (view: "login" | "register") => void;
  onNavigateHome?: () => void;
}

export function Auth({ onLoginSuccess, defaultView = "login", onViewChange, onNavigateHome }: AuthProps) {
  const [view, setView] = useState<"login" | "register" | "forgot" | "reset">(defaultView);

  // Sync state if prop changes
  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [diagnosticLog, setDiagnosticLog] = useState<any>(null);

  const resetFields = () => {
    setError("");
    setSuccessMsg("");
    setDiagnosticLog(null);
  };

  const getAccessTokenFromUrl = () => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) return token;
    }
    const search = window.location.search;
    if (search) {
      const params = new URLSearchParams(search);
      const token = params.get("access_token");
      if (token) return token;
    }
    return localStorage.getItem("ct_token");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all credentials.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Always invoke our server proxy API to authenticate reliably
      const data = await safeFetchJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
        }),
      });

      const loggedInToken = data.token;

      if (loggedInToken) {
        if (rememberMe) {
          localStorage.setItem("ct_token", loggedInToken);
          localStorage.setItem("ct_auth_mode", "supabase");
        }

        // Keep local client-side client state in sync if possible
        if (loggedInToken && loggedInToken.includes(".")) {
          try {
            await supabase.auth.setSession({
              access_token: loggedInToken,
              refresh_token: loggedInToken,
            });
          } catch (setSessErr) {
            console.warn("Could not set local Supabase client session (gracefully bypassed):", setSessErr);
          }
        }

        onLoginSuccess(loggedInToken);
      } else {
        setError("Could not establish session. Please verify your credentials.");
      }
    } catch (err: any) {
      setDiagnosticLog(err);
      const formattedErr = formatSupabaseError(err);
      console.warn("Login failed:", formattedErr);
      setError(formattedErr);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) {
      setError("All form fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Invoke our server proxy API for reliable registration
      const data = await safeFetchJson("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          confirmPassword,
        }),
      });

      setSuccessMsg(data.message || "Registration successful!");

      // Clear sensitive password inputs
      setPassword("");
      setConfirmPassword("");

      // Redirect the user to the login view after a few seconds
      setTimeout(() => {
        setView("login");
        resetFields();
      }, 5000);
    } catch (err: any) {
      setDiagnosticLog(err);
      const formattedErr = formatSupabaseError(err);
      console.error("Sign up failed:", formattedErr);
      setError(formattedErr);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide your account email.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const data = await safeFetchJson("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
        }),
      });
      setSuccessMsg(data.message || "A recovery email has been sent. Please check your inbox.");
      setTimeout(() => {
        setView("reset");
        resetFields();
      }, 2000);
    } catch (err: any) {
      console.error("Password recovery failed:", err);
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all details.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const headersInit: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const tokenVal = getAccessTokenFromUrl();
      if (tokenVal) {
        headersInit["Authorization"] = `Bearer ${tokenVal}`;
      }

      const data = await safeFetchJson("/api/auth/reset-password", {
        method: "POST",
        headers: headersInit,
        body: JSON.stringify({ 
          email, 
          password,
        }),
      });

      setSuccessMsg(data.message || "Your password has been successfully updated. Please log in.");
      setTimeout(() => {
        setView("login");
        resetFields();
      }, 2000);
    } catch (err: any) {
      console.error("Password update failed:", err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050811] px-4 py-12 font-sans select-none text-slate-100 relative overflow-hidden">
      {/* Subtle background glow effects to keep design rich */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-800/40 bg-[#070b13] p-8 shadow-2xl">
        <div className="text-center">
          <div
            onClick={() => onNavigateHome?.()}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1528] text-blue-500 border border-blue-500/20 cursor-pointer hover:scale-105 transition-all"
            title="Go to Home Landing Page"
          >
            <ShieldCheck className="h-6 w-6 text-blue-500" />
          </div>
          <h1
            onClick={() => onNavigateHome?.()}
            className="text-2xl font-semibold tracking-tight text-white cursor-pointer hover:text-blue-400 transition-colors"
            title="Go to Home Landing Page"
          >
            Consistency Tracker
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {view === "login" && "Sign in to keep your streak burning"}
            {view === "register" && "Step up and start tracking habits"}
            {view === "forgot" && "Reset your account password credentials"}
            {view === "reset" && "Choose a strong new password"}
          </p>
        </div>

        {/* Global Error & Success Alerts */}
        {error && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-400 whitespace-pre-line leading-relaxed">
            <div className="flex items-start space-x-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
            {successMsg}
          </div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    resetFields();
                  }}
                  className="text-[11px] font-semibold text-blue-500 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#162235] bg-[#0b111e] text-blue-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#1b58f6] hover:bg-[#2563eb] py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Desired Username
              </label>
              <div className="relative">
                <UserIcon className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g. devchamp"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Choose Password
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#1b58f6] hover:bg-[#2563eb] py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Creating Account..." : "Register"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#1b58f6] hover:bg-[#2563eb] py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Sending..." : "Recover Password"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setView("login");
                resetFields();
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-2 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-[#1b58f6] focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="name@domain.com"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                New Secure Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-[#1b58f6] focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#162235] bg-[#0b111e] py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:border-[#1b58f6] focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1b58f6] hover:bg-[#2563eb] py-3 text-sm font-semibold text-white transition-all cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs">
          {view === "login" && (
            <p className="text-slate-500">
              New tracking habits?{" "}
              <button
                onClick={() => {
                  setView("register");
                  resetFields();
                  onViewChange?.("register");
                }}
                className="font-semibold text-[#1b58f6] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          )}

          {view === "register" && (
            <p className="text-slate-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setView("login");
                  resetFields();
                  onViewChange?.("login");
                }}
                className="font-semibold text-[#1b58f6] hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
