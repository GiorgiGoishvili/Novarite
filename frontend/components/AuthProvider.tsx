"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:       string;
  username: string;
  email:    string;
}

interface AuthContextValue {
  user:            AuthUser | null;
  session:         Session | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (email: string, password: string) => Promise<string | null>;
  register:        (username: string, email: string, password: string) => Promise<string | null>;
  logout:          () => Promise<void>;
  changePassword:  (currentPassword: string, newPassword: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

async function fetchUsername(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  return (data as { username: string } | null)?.username ?? null;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          const username = await fetchUsername(session.user.id);
          setUser({
            id:       session.user.id,
            username: username ?? fallbackUsername(session.user.email),
            email:    session.user.email ?? "",
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ─────────────────────────────────────────────────────────

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return friendlyAuthError(error.message);
    return null;
  }

  async function register(
    username: string,
    email:    string,
    password: string,
  ): Promise<string | null> {
    const trimmed = username.trim();

    if (!trimmed)
      return "Username is required.";
    if (!USERNAME_RE.test(trimmed))
      return "Username must be 3–30 characters (letters, digits, _ or -).";

    // Check uniqueness before creating the auth user so we don't leave
    // orphan auth entries when the username is already taken.
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmed)
      .maybeSingle();
    if (existing) return "That username is already taken.";

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return friendlyAuthError(error.message);
    if (!data.user) return "Sign up failed. Please try again.";

    // If email confirmation is enabled in Supabase (not the recommended setting
    // for this app), data.session will be null and the user must confirm first.
    if (!data.session) {
      return "__CHECK_EMAIL__";
    }

    // Create the profile row. The user is now authenticated so the RLS
    // INSERT policy (auth.uid() = id) will pass.
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id:           data.user.id,
        username:     trimmed,
        display_name: trimmed,
        email:        data.user.email ?? email,
      });

    if (profileErr) {
      console.error("[AuthProvider] Profile creation failed:", profileErr.message);
    }

    // Directly update local state with the intended username — this beats
    // any onAuthStateChange race where the profile INSERT hasn't landed yet.
    setUser({
      id:       data.user.id,
      username: trimmed,
      email:    data.user.email ?? email,
    });

    return null;
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function changePassword(
    currentPassword: string,
    newPassword:     string,
  ): Promise<string | null> {
    if (!user?.email) return "Not signed in.";

    // Re-authenticate to verify the current password before allowing the change.
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email:    user.email,
      password: currentPassword,
    });
    if (verifyErr) return "Current password is incorrect.";

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return friendlyAuthError(error.message);
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// ── Private helpers ────────────────────────────────────────────────────────

function fallbackUsername(email?: string): string {
  return (email ?? "user").split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30) || "user";
}

function friendlyAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Invalid email or password.";
  if (msg.includes("Email not confirmed"))        return "Please confirm your email before signing in.";
  if (msg.includes("User already registered"))    return "An account with that email already exists.";
  if (msg.includes("Password should be"))         return "Password must be at least 6 characters.";
  return msg;
}
