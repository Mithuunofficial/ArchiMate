"use client";

import React from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, Sparkles } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdminLoading } = useAdminAuth();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-[#030615] flex flex-col items-center justify-center text-slate-100 font-sans p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 animate-pulse">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-extrabold tracking-tight font-mono">
            Archi<span className="text-cyan-400">Mate Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying administrator permissions...</span>
        </div>
      </div>
    );
  }

  // Render children (pages will conditionally render Admin Login View if !isAdminAuthenticated)
  return <>{children}</>;
}
