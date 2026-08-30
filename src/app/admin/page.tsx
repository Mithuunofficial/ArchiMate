"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Logo } from "@/components/ui/Logo";
import {
  Sparkles,
  Users,
  FolderGit2,
  Layers,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface StatsData {
  totalUsers: number;
  pendingApproval: number;
  approvedUsers: number;
  rejectedUsers: number;
  suspendedUsers: number;
  totalProjects: number;
  totalArchitectures: number;
  newUsersThisWeek: number;
}

function AdminLoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const { adminLogin } = useAdminAuth();
  const { toastSuccess, toastError } = useToast();

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSetupMessage(null);

    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      if (res.success) {
        toastSuccess("Administrator authenticated successfully.");
      } else {
        setErrorMessage(res.error || "Invalid administrator credentials.");
      }
    } catch {
      setErrorMessage("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeAdmin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/auth/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSetupMessage(`Admin account initialized: ${data.username}`);
        setUsername(data.username);
        setPassword("Archi_Mate$Admin18");
        toastSuccess("Initial Admin Account Provisioned!");
      } else {
        setSetupMessage(data.message || data.error || "Setup completed.");
        setUsername("Admin-Archimate");
        setPassword("Archi_Mate$Admin18");
      }
    } catch {
      toastError("Failed to execute admin setup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030615] text-slate-100 font-sans flex items-center justify-center p-4 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[#090D1A]/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <Logo variant="admin" />
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
            Administration
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white pt-1">
            Secure Administrator Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {/* Error / Setup Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {setupMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{setupMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1.5 font-semibold">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User-Name"
              className="w-full px-4 py-2.5 text-xs bg-[#030615]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1.5 font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs bg-[#030615]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sans pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-60 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Administrator Login</span>
              </>
            )}
          </button>
        </form>

        {/* Initial Setup Helper Trigger */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleInitializeAdmin}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Provision Initial Admin Account (Admin-Archimate)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { adminSession } = useAdminAuth();
  const { toastError } = useToast();

  useEffect(() => {
    async function loadStats() {
      setIsLoadingStats(true);
      try {
        const res = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${adminSession?.access_token || ""}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          toastError(data.error || "Failed to load admin stats.");
        }
      } catch {
        toastError("Unable to fetch server metrics.");
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (adminSession?.access_token) {
      loadStats();
    }
  }, [adminSession]);

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time platform metrics, dual approval management, and system activity logs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SERVER AUTHORIZED</span>
            </span>
          </div>
        </div>

        {/* Pending Approval Notification Banner */}
        {stats && stats.pendingApproval > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pending Approval Request</h4>
                <p className="text-xs text-amber-200">
                  <strong>{stats.pendingApproval}</strong> {stats.pendingApproval === 1 ? "user is" : "users are"} waiting for administrator approval.
                </p>
              </div>
            </div>
            <Link
              href="/admin/users?status=pending"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shrink-0"
            >
              Review Users
            </Link>
          </div>
        )}

        {/* Real Statistics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Users */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090D1A] shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                Total Users
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-extrabold text-white font-mono">
                {stats?.totalUsers ?? 0}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Registered Supabase accounts</p>
          </div>

          {/* Pending Approval */}
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#090D1A] shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                Pending Approval
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-extrabold text-amber-300 font-mono">
                {stats?.pendingApproval ?? 0}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Awaiting email / admin review</p>
          </div>

          {/* Approved Users */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#090D1A] shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                Approved Users
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-extrabold text-emerald-300 font-mono">
                {stats?.approvedUsers ?? 0}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Email verified or admin approved</p>
          </div>

          {/* Rejected Users */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090D1A] shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-rose-400 font-bold">
                Rejected
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-extrabold text-rose-300 font-mono">
                {stats?.rejectedUsers ?? 0}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Registration rejected</p>
          </div>

          {/* Suspended Users */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090D1A] shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-purple-400 font-bold">
                Suspended
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <p className="text-2xl font-extrabold text-purple-300 font-mono">
                {stats?.suspendedUsers ?? 0}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Access suspended</p>
          </div>
        </div>

        {/* Admin Navigation Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] hover:border-cyan-500/40 transition-all group shadow-xl space-y-3"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              User Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search users by email or username, inspect profiles, update statuses, or suspend/delete accounts.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 pt-2">
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/projects"
            className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] hover:border-cyan-500/40 transition-all group shadow-xl space-y-3"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
              All User Projects
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore cross-user project architectures, open read-only topology canvas, or remove invalid projects.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-2">
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/activity"
            className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] hover:border-cyan-500/40 transition-all group shadow-xl space-y-3"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Audit Activity Logs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review secure administrative audit logs including admin logins, account updates, and deletions.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 pt-2">
              <span>View Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminMainPage() {
  const { isAdminAuthenticated } = useAdminAuth();

  return (
    <AdminGuard>
      {isAdminAuthenticated ? <AdminDashboardView /> : <AdminLoginView />}
    </AdminGuard>
  );
}
