"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types/auth";

interface AdminSession {
  access_token: string;
  user_id: string;
}

interface AdminAuthContextType {
  adminProfile: UserProfile | null;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminSignOut: () => void;
}

const STORAGE_KEY_ADMIN_SESSION = "archimate_admin_session_v1";
const STORAGE_KEY_ADMIN_PROFILE = "archimate_admin_profile_v1";

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminProfile: null,
  adminSession: null,
  isAdminAuthenticated: false,
  isAdminLoading: true,
  adminLogin: async () => ({ success: false }),
  adminSignOut: () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);

  // Initialize admin session from storage independently on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedSession = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
        const storedProfile = localStorage.getItem(STORAGE_KEY_ADMIN_PROFILE);
        if (storedSession && storedProfile) {
          const parsedSession: AdminSession = JSON.parse(storedSession);
          const parsedProfile: UserProfile = JSON.parse(storedProfile);
          if (parsedProfile.role === "admin" && parsedSession.access_token) {
            setAdminSession(parsedSession);
            setAdminProfile(parsedProfile);
          }
        }
      } catch (err) {
        console.error("Error restoring admin session:", err);
      } finally {
        setIsAdminLoading(false);
      }
    } else {
      setIsAdminLoading(false);
    }
  }, []);

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error || "Authentication failed." };
      }

      const sessionObj: AdminSession = {
        access_token: data.session?.access_token || "",
        user_id: data.profile?.id || "",
      };

      const profileObj: UserProfile = {
        id: data.profile.id,
        username: data.profile.username,
        email: data.profile.email,
        role: data.profile.role,
        status: data.profile.status,
        createdAt: data.profile.created_at || data.profile.createdAt,
        updatedAt: data.profile.updated_at || data.profile.updatedAt,
      };

      setAdminSession(sessionObj);
      setAdminProfile(profileObj);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(sessionObj));
        localStorage.setItem(STORAGE_KEY_ADMIN_PROFILE, JSON.stringify(profileObj));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Server error" };
    }
  };

  const adminSignOut = () => {
    setAdminSession(null);
    setAdminProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
      localStorage.removeItem(STORAGE_KEY_ADMIN_PROFILE);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminProfile,
        adminSession,
        isAdminAuthenticated: !!adminProfile && adminProfile.role === "admin" && !!adminSession?.access_token,
        isAdminLoading,
        adminLogin,
        adminSignOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
