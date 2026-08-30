"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService } from "@/services/auth.service";
import { UserProfile } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isApproved: false,
  isPending: true,
  isRejected: false,
  isSuspended: false,
  isConfigured: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string) => {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Initialize initial auth session safely
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id).catch(() => {}).finally(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Supabase session initialization notice:", err?.message || err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id).catch(() => {});
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isEmailVerified = !!user?.email_confirmed_at || !!profile?.emailVerified;
  const isAdminApproved = !!profile?.adminApproved;
  const rawStatus = profile?.accountStatus || profile?.status || "pending";

  const isSuspended = rawStatus === "suspended";
  const isRejected = rawStatus === "rejected";
  const isAdmin = profile?.role === "admin";
  const isApproved = !isSuspended && !isRejected && (isEmailVerified || isAdminApproved || isAdmin);
  const isPending = !isApproved && !isSuspended && !isRejected;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isApproved,
        isPending,
        isRejected,
        isSuspended,
        isConfigured,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
