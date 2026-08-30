"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { Sparkles, Lock, Loader2, AlertTriangle, Clock, XCircle, Mail, RefreshCw } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isApproved, isPending, isRejected, isSuspended, user, profile, isLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=protected");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const userEmail = user?.email || profile?.email;
    if (!userEmail || cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await authService.resendVerificationEmail(userEmail);
      if (res.success) {
        setResendMessage("Verification email sent.");
        setCooldown(res.cooldownSeconds || 60);
      } else {
        setResendMessage(res.error || "Failed to send email.");
        if (res.cooldownSeconds) {
          setCooldown(res.cooldownSeconds);
        }
      }
    } catch {
      setResendMessage("Unable to request verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsCheckingStatus(true);
    try {
      await refreshProfile();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 animate-pulse">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-extrabold tracking-tight font-mono">
            Archi<span className="text-cyan-400">Mate</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying account approval status...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="max-w-md w-full p-8 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400">
            Sign in to start designing, saving, and persisting your cloud architecture diagrams.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Account Suspended View
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="max-w-md w-full p-8 bg-[#0B1120] border border-rose-500/30 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your ArchiMate user account has been suspended by an administrator. You do not have permission to create or update architectures.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Account Rejected View
  if (isRejected) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="max-w-md w-full p-8 bg-[#0B1120] border border-amber-500/30 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <XCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Rejected</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account registration request was rejected by an administrator. Please contact your system administrator for further assistance.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Pending User Approval Screen
  if (isPending && !isApproved) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="max-w-md w-full p-8 sm:p-10 bg-[#0B1120]/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-2xl text-center space-y-6">

          {/* Clock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            {/* Status Banner */}
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5 uppercase">
              <Clock className="w-3 h-3" />
              <span>Your account is pending approval</span>
            </span>

            <h2 className="text-2xl font-extrabold text-white pt-2">Awaiting Approval</h2>
            <p className="text-xs text-slate-300 leading-relaxed px-2">
              Verify your email or wait for administrator approval before creating an architecture.
            </p>
          </div>

          {resendMessage && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-cyan-300 font-mono">
              {resendMessage}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Sending verification email...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Resend available in {cooldown} seconds</span>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleRefreshStatus}
                disabled={isCheckingStatus}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                <span>Check Status</span>
              </button>

              <button
                onClick={() => signOut()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
