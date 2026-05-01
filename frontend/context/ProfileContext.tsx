"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SITE_LINKS } from "@/lib/siteLinks";

export interface Profile {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  studioName: string;
  role: string;
  avatarColor: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  socialX: string;
  socialGithub: string;
  socialLinkedin: string;
  socialWebsite: string;
}

function defaultProfile(username: string, email: string): Profile {
  return {
    displayName: username,
    username,
    bio: "",
    location: "",
    studioName: "",
    role: "",
    avatarColor: "#DC2626",
    email,
    phone: "",
    emailVerified: false,
    phoneVerified: false,
    socialX: SITE_LINKS.x,
    socialGithub: SITE_LINKS.github,
    socialLinkedin: SITE_LINKS.linkedin,
    socialWebsite: "",
  };
}

function storageKey(username: string) {
  return `nr_profile_${username}`;
}

interface ProfileContextValue {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfile: () => void;
  updateAndSave: (updates: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const profileRef = useRef<Profile | null>(null);

  // Keep ref in sync so saveProfile() never reads a stale closure
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Load/clear profile when the signed-in user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const raw = localStorage.getItem(storageKey(user.username));
    if (raw) {
      try {
        const stored = JSON.parse(raw) as Partial<Profile>;
        setProfile({ ...defaultProfile(user.username, user.email), ...stored });
      } catch {
        setProfile(defaultProfile(user.username, user.email));
      }
    } else {
      setProfile(defaultProfile(user.username, user.email));
    }
  }, [user]);

  function updateProfile(updates: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  }

  function saveProfile() {
    const latest = profileRef.current;
    if (!user || !latest) return;
    localStorage.setItem(storageKey(user.username), JSON.stringify(latest));
  }

  // Atomically applies updates and persists — safe to call immediately after
  // updateProfile without stale-closure issues
  function updateAndSave(updates: Partial<Profile>) {
    const username = user?.username;
    if (!username) return;
    setProfile((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(storageKey(username), JSON.stringify(next));
      return next;
    });
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
