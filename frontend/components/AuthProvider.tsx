"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  username: string;
  email: string;
}

interface StoredUser {
  username: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => string | null;
  register: (username: string, email: string, password: string) => string | null;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "nr_session";
const USERS_KEY   = "nr_users";

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function putUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true); // true until localStorage is read

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore corrupt data
    } finally {
      setLoading(false); // always unblock protected pages
    }
  }, []);

  function login(email: string, password: string): string | null {
    const match = getUsers().find((u) => u.email === email && u.password === password);
    if (!match) return "Invalid email or password.";
    const session: User = { username: match.username, email: match.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return null;
  }

  function register(username: string, email: string, password: string): string | null {
    const users = getUsers();
    if (users.find((u) => u.email === email))
      return "An account with that email already exists.";
    users.push({ username, email, password });
    putUsers(users);
    const session: User = { username, email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return null;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  function changePassword(currentPassword: string, newPassword: string): string | null {
    if (!user) return "Not signed in.";
    const users = getUsers();
    const idx = users.findIndex(
      (u) => u.email === user.email && u.password === currentPassword
    );
    if (idx === -1) return "Current password is incorrect.";
    users[idx].password = newPassword;
    putUsers(users);
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
