/**
 * @license
 * Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

async function safeFetchJson(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const text = await response.text();
  
  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.includes("The page cannot be found")) {
    throw new Error(`Server returned HTML instead of JSON. Ensure the server is running and the route '${url}' is registered.`);
  }

  try {
    const data = JSON.parse(text);
    if (!response.ok) {
      throw new Error(data.error || `Server responded with error status ${response.status}`);
    }
    return data;
  } catch (err: any) {
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${response.statusText || "Request failed"}`);
    }
    throw new Error(err.message || "Unable to parse server response.");
  }
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

  const resetFields = () => {
    setError("");
    setSuccessMsg("");
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
      let loggedInToken = null;
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Sync with backend local memory storage representation
          const usernameVal = data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User";
          const syncData = await safeFetchJson("/api/auth/sync", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.session?.access_token || ""}`
            },
            body: JSON.stringify({ id: data.user.id, email: data.user.email, username: usernameVal }),
          });
          loggedInToken = data.session?.access_token || syncData.token;
        }
      } catch (supabaseErr: any) {
        console.warn("Supabase auth offline/failed, trying local database auth fallback:", supabaseErr);
        const loginData = await safeFetchJson("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        loggedInToken = loginData.token;
      }

      if (loggedInToken) {
        if (rememberMe) {
          localStorage.setItem("ct_token", loggedInToken);
        }
        onLoginSuccess(loggedInToken);
      } else {
        setError("Could not establish session. Please verify your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let registeredToken = null;
      let isLocalOnly = false;
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Sync registration details
          const syncData = await safeFetchJson("/api/auth/sync", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.session?.access_token || ""}`
            },
            body: JSON.stringify({ id: data.user.id, email: data.user.email, username }),
          });
          registeredToken = data.session?.access_token || syncData.token;
        }
      } catch (supabaseErr: any) {
        console.warn("Supabase sign up offline/failed, trying local database register fallback:", supabaseErr);
        const regData = await safeFetchJson("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        registeredToken = regData.token;
        isLocalOnly = true;
      }

      if (registeredToken) {
        if (isLocalOnly) {
          setSuccessMsg("Account created successfully! Logging you in...");
          setTimeout(() => {
            if (rememberMe) {
              localStorage.setItem("ct_token", registeredToken);
            }
            onLoginSuccess(registeredToken);
          }, 1500);
        } else {
          setSuccessMsg("A verification email has been sent. Please verify your account.");
          // Let user log in right away in sandbox development, or wait
          setTimeout(() => {
            if (rememberMe) {
              localStorage.setItem("ct_token", registeredToken);
            }
            onLoginSuccess(registeredToken);
          }, 3500);
        }
      } else {
        setError("Sign up succeeded but user details were empty. Please verify your inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register.");
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
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?view=reset`,
        });
        if (resetError) throw resetError;

        setSuccessMsg("Password reset link sent to registered email. Proceeding to Reset form...");
        setTimeout(() => {
          setView("reset");
          resetFields();
        }, 2000);
      } catch (supabaseErr: any) {
        console.warn("Supabase resetPasswordForEmail failing, triggering local database recovery fallback:", supabaseErr);
        await safeFetchJson("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setSuccessMsg("Local password recovery triggered. Moving to reset form...");
        setTimeout(() => {
          setView("reset");
          resetFields();
        }, 1500);
      }
    } catch (err: any) {
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
      let resetToken = null;
      let isLocalOnly = false;
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });
        if (updateError) throw updateError;

        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          const usernameVal = supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User";
          const syncData = await safeFetchJson("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: supabaseUser.id, email: supabaseUser.email, username: usernameVal }),
          });
          resetToken = syncData.token;
        }
      } catch (supabaseErr) {
        console.warn("Supabase updateUser failing, trying local database reset password fallback:", supabaseErr);
        await safeFetchJson("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        
        // Log in to get active local session token
        const loginData = await safeFetchJson("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        resetToken = loginData.token;
        isLocalOnly = true;
      }

      if (resetToken) {
        setSuccessMsg("Password updated successfully. Loading Dashboard...");
        setTimeout(() => {
          if (rememberMe) {
            localStorage.setItem("ct_token", resetToken);
          }
          onLoginSuccess(resetToken);
        }, 1500);
      } else {
        setView("login");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 font-sans select-none text-slate-100">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div
            onClick={() => onNavigateHome?.()}
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 cursor-pointer hover:scale-105 transition-all"
            title="Go to Home Landing Page"
          >
            <ShieldCheck className="h-6 w-6 animate-pulse" />
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
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-xs text-rose-400">
            {error}
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
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    resetFields();
                  }}
                  className="text-xs font-medium text-blue-500 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 text-slate-500 hover:text-slate-300"
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
                  className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 font-medium text-white transition-all disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Desired Username
              </label>
              <div className="relative mt-1">
                <UserIcon className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. devchamp"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 font-medium text-white transition-all disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Register"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute top-2.5 left-3 h-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 font-medium text-white transition-all disabled:opacity-50"
            >
              <span>{loading ? "Sending..." : "Recover Password"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setView("login");
                resetFields();
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
            >
              Back to Login
            </button>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="name@domain.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                New Secure Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 px-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 font-medium text-white transition-all"
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
                className="font-semibold text-blue-500 hover:underline cursor-pointer"
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
                className="font-semibold text-blue-500 hover:underline cursor-pointer"
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
