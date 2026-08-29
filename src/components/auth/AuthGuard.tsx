"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Lock, Loader2, AlertTriangle } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isSuspended, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=protected");
    }
  }, [isLoading, isAuthenticated, router]);

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
          <span>Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isSuspended) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="max-w-md w-full p-8 bg-[#0B1120] border border-rose-500/30 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your ArchiMate user account has been suspended by an administrator. You do not have access to design or manage architecture projects.
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

  return <>{children}</>;
}
