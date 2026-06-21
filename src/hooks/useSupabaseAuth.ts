import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { User } from "../types";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("ct_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync Supabase Auth user with local Express server state
  const syncWithBackend = async (supabaseUser: any, accessToken?: string, customUsername?: string): Promise<User | null> => {
    if (!supabaseUser) return null;
    try {
      const username = customUsername || supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "User";
      const headersInit: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headersInit["Authorization"] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: headersInit,
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          username,
        }),
      });

      const text = await response.text();
      const trimmed = text.trim();
      if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.includes("The page cannot be found")) {
        throw new Error(`Server returned HTML instead of JSON status ${response.status}.`);
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}: ${response.statusText || "Request failed"}`);
        }
        throw new Error("Unable to parse server response.");
      }

      if (!response.ok) {
        throw new Error(data.error || `Server responded with error status ${response.status}`);
      }

      if (data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ct_token", data.token);
        return data.user;
      }
    } catch (err: any) {
      console.error("Authentication sync error:", err);
      setError(err.message || "Failed to sync session");
    }
    return null;
  };

  // Initial session lookup and auth state change subscription
  useEffect(() => {
    let mounted = true;
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await syncWithBackend(session.user, session.access_token);
        } else if (mounted) {
          // If no active Supabase session, clear local mock token too
          setUser(null);
          setToken(null);
          localStorage.removeItem("ct_token");
        }
      } catch (err: any) {
        console.error("Error checking Supabase session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setLoading(true);
        await syncWithBackend(session.user, session.access_token);
        setLoading(false);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("ct_token");
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setError(null);
    setLoading(true);
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
        // Automatically sync the newly signed-up user
        await syncWithBackend(data.user, data.session?.access_token, username);
      }
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        await syncWithBackend(data.user, data.session?.access_token);
      }
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setUser(null);
      setToken(null);
      localStorage.removeItem("ct_token");
    } catch (err: any) {
      setError(err.message || "Failed to log out.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
}
