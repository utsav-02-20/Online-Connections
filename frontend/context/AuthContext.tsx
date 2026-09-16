"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, apiRequest, AuthResponse } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addFriend: (friendUsername: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<AuthResponse>("/get-me", { method: "GET" }, authToken);
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Clear token if invalid
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email: identifier, password }),
    });

    if (res.success && res.user && res.user.accessToken) {
      const authToken = res.user.accessToken;
      localStorage.setItem("accessToken", authToken);
      setToken(authToken);
      setUser(res.user);
    } else {
      throw new Error(res.message || "Login failed");
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    if (res.success && res.user && res.user.accessToken) {
      const authToken = res.user.accessToken;
      localStorage.setItem("accessToken", authToken);
      setToken(authToken);
      setUser(res.user);
    } else {
      throw new Error(res.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/logout", { method: "POST" }, token);
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user || !token) throw new Error("Not authenticated");

    const res = await apiRequest<AuthResponse>(
      `/profile/${user.username}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token
    );

    if (res.success && res.user) {
      setUser(res.user);
    } else {
      throw new Error(res.message || "Update profile failed");
    }
  };

  const addFriend = async (friendUsername: string) => {
    if (!user || !token) throw new Error("Not authenticated");

    const res = await apiRequest<AuthResponse>(
      `/friends/${user.username}/${friendUsername}`,
      { method: "POST" },
      token
    );

    if (res.success && res.user) {
      setUser(res.user);
    } else {
      throw new Error(res.message || "Add friend failed");
    }
  };

  const refreshUserData = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addFriend,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
