"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";

// ── Public Profile shape (camelCase, consumed by UI) ──────────────────────

export interface Profile {
  displayName:    string;
  username:       string;
  bio:            string;
  location:       string;
  studioName:     string;
  role:           string;
  avatarColor:    string;
  avatarUrl:      string;
  email:          string;
  phone:          string;
  emailVerified:  boolean;
  phoneVerified:  boolean;
  socialX:        string;
  socialGithub:   string;
  socialLinkedin: string;
  socialWebsite:  string;
}

// ── DB row shape (snake_case, returned from Supabase) ─────────────────────

interface ProfileRow {
  username:       string;
  display_name:   string | null;
  bio:            string | null;
  location:       string | null;
  studio_name:    string | null;
  role:           string | null;
  avatar_color:   string | null;
  avatar_url:     string | null;
  email:          string | null;
  phone:          string | null;
  email_verified: boolean;
  phone_verified: boolean;
  x_url:          string | null;
  github_url:     string | null;
  linkedin_url:   string | null;
  website_url:    string | null;
}

// ── Mapping helpers ────────────────────────────────────────────────────────

function rowToProfile(row: ProfileRow): Profile {
  return {
    username:      row.username,
    displayName:   row.display_name    ?? row.username,
    bio:           row.bio             ?? "",
    location:      row.location        ?? "",
    studioName:    row.studio_name     ?? "",
    role:          row.role            ?? "",
    avatarColor:   row.avatar_color    ?? "#DC2626",
    avatarUrl:     row.avatar_url      ?? "",
    email:         row.email           ?? "",
    phone:         row.phone           ?? "",
    emailVerified: row.email_verified,
    phoneVerified: row.phone_verified,
    socialX:       row.x_url           ?? "",
    socialGithub:  row.github_url      ?? "",
    socialLinkedin: row.linkedin_url   ?? "",
    socialWebsite: row.website_url     ?? "",
  };
}

function profileToUpsertRow(profile: Profile, userId: string) {
  return {
    id:             userId,
    username:       profile.username,
    display_name:   profile.displayName    || null,
    bio:            profile.bio            || null,
    location:       profile.location       || null,
    studio_name:    profile.studioName     || null,
    role:           profile.role           || null,
    avatar_color:   profile.avatarColor    || "#DC2626",
    avatar_url:     profile.avatarUrl      || null,
    email:          profile.email          || null,
    phone:          profile.phone          || null,
    email_verified: profile.emailVerified,
    phone_verified: profile.phoneVerified,
    x_url:          profile.socialX        || null,
    github_url:     profile.socialGithub   || null,
    linkedin_url:   profile.socialLinkedin || null,
    website_url:    profile.socialWebsite  || null,
    updated_at:     new Date().toISOString(),
  };
}

// ── Context type ───────────────────────────────────────────────────────────

interface ProfileContextValue {
  profile:       Profile | null;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfile:   () => Promise<{ error: string | null }>;
  updateAndSave: (updates: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

const PROFILE_COLUMNS =
  "username, display_name, bio, location, studio_name, role, " +
  "avatar_color, avatar_url, email, phone, email_verified, phone_verified, " +
  "x_url, github_url, linkedin_url, website_url";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load or create profile whenever the signed-in user changes
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    void (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[ProfileContext] Load failed:", error.message);
        return;
      }

      if (data) {
        setProfile(rowToProfile(data as ProfileRow));
      } else {
        // No profile row yet — build a sensible default and persist it.
        // This handles the edge case where profile creation failed at registration.
        const defaults: Profile = {
          username:      user.username,
          displayName:   user.username,
          bio:           "",
          location:      "",
          studioName:    "",
          role:          "",
          avatarColor:   "#DC2626",
          avatarUrl:     "",
          email:         user.email,
          phone:         "",
          emailVerified: false,
          phoneVerified: false,
          socialX:       "",
          socialGithub:  "",
          socialLinkedin: "",
          socialWebsite: "",
        };
        setProfile(defaults);
        const { error: insertErr } = await supabase
          .from("profiles")
          .insert(profileToUpsertRow(defaults, user.id));
        if (insertErr) {
          console.error("[ProfileContext] Default profile insert failed:", insertErr.message);
        }
      }
    })();
  }, [user?.id, user?.username, user?.email]);

  // ── Mutations ──────────────────────────────────────────────────────────

  function updateProfile(updates: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  }

  async function saveProfile(): Promise<{ error: string | null }> {
    if (!user?.id || !profile) return { error: "Not signed in." };

    const { error } = await supabase
      .from("profiles")
      .upsert(profileToUpsertRow(profile, user.id), { onConflict: "id" });

    if (error) {
      console.error("[ProfileContext] Save failed:", error.message, error.code);
      if (error.code === "23505") return { error: "That username is already taken." };
      if (error.code === "23514") return { error: "Username must be 3–30 characters (letters, digits, _ or -)." };
      return { error: "Failed to save profile. Please try again." };
    }
    return { error: null };
  }

  async function updateAndSave(updates: Partial<Profile>): Promise<void> {
    if (!user?.id || !profile) return;

    // Compute merged profile synchronously so we save the right values
    // even if React hasn't re-rendered yet.
    const merged = { ...profile, ...updates };
    setProfile(merged);

    const { error } = await supabase
      .from("profiles")
      .upsert(profileToUpsertRow(merged, user.id), { onConflict: "id" });

    if (error) {
      console.error("[ProfileContext] updateAndSave failed:", error.message);
    }
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, saveProfile, updateAndSave }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
