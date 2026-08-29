import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile, AuthUser, SignUpInput, LoginInput } from "@/types/auth";
import { User, Session } from "@supabase/supabase-js";

class AuthService {
  /**
   * Get current Supabase session
   */
  public async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting Supabase session:", error.message);
      return null;
    }
    return data.session;
  }

  /**
   * Get authenticated user profile from `profiles` table
   */
  public async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role || "user",
      status: data.status || "active",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Register a new user via /api/auth/signup & create profile
   */
  public async signUp(input: SignUpInput): Promise<{
    user: User | null;
    session: Session | null;
    needsEmailVerification: boolean;
    error: string | null;
  }> {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          user: null,
          session: null,
          needsEmailVerification: false,
          error: data.error || "Unable to create your account. Please try again.",
        };
      }

      if (data.session) {
        try {
          await supabase.auth.setSession(data.session);
        } catch {
          // Continue if setSession is handled in-memory
        }
      }

      return {
        user: data.user,
        session: data.session,
        needsEmailVerification: !!data.needsEmailVerification,
        error: null,
      };
    } catch {
      return {
        user: null,
        session: null,
        needsEmailVerification: false,
        error: "Unable to create your account. Please check your network connection.",
      };
    }
  }

  /**
   * Authenticate existing user with Username + Password via /api/auth/login
   */
  public async signIn(input: LoginInput): Promise<{
    user: User | null;
    session: Session | null;
    error: string | null;
  }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          user: null,
          session: null,
          error: data.error || "Authentication failed. Please check your credentials.",
        };
      }

      if (data.session) {
        try {
          await supabase.auth.setSession(data.session);
        } catch {
          // Continue if session is stored locally
        }
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch {
      return {
        user: null,
        session: null,
        error: "Authentication failed. Please check your network connection.",
      };
    }
  }

  /**
   * Request password reset link via Supabase Auth
   */
  public async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase environment variables are missing." };
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  /**
   * Update password for current user session
   */
  public async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase environment variables are missing." };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  /**
   * Sign Out of Supabase session
   */
  public async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }
}

export const authService = new AuthService();
