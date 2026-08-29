"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/useToast";
import { Project } from "@/types/project";
import {
  User,
  ArrowLeft,
  FolderGit2,
  UserX,
  UserCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface UserDetailData {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

function UserDetailPageContent() {
  const params = useParams();
  const userId = params.userId as string;

  const [userInfo, setUserInfo] = useState<UserDetailData | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { adminSession } = useAdminAuth();
  const { toastSuccess, toastError } = useToast();
  const router = useRouter();

  const loadUserDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserInfo(data.user);
        setUserProjects(data.projects || []);
      } else {
        toastError(data.error || "User not found.");
      }
    } catch {
      toastError("Failed to fetch user details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.access_token && userId) {
      loadUserDetail();
    }
  }, [adminSession, userId]);

  const handleToggleStatus = async () => {
    if (!userInfo) return;
    const nextStatus = userInfo.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/admin/users/${userId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toastSuccess(`User status updated to ${nextStatus}.`);
        setUserInfo({ ...userInfo, status: nextStatus });
      } else {
        toastError(data.error || "Failed to update user status.");
      }
    } catch {
      toastError("Unable to update status.");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-16 text-center text-slate-400 font-mono flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span>Loading user details...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!userInfo) {
    return (
      <AdminLayout>
        <div className="p-10 max-w-md mx-auto text-center space-y-4 font-sans">
          <h2 className="text-xl font-bold text-white">User Not Found</h2>
          <p className="text-xs text-slate-400">The user account does not exist or has been deleted.</p>
          <Link
            href="/admin/users"
            className="inline-flex py-2 px-4 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            Back to Users List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const architecturesCount = userProjects.filter(
    (p) => p.architecture && p.architecture.nodes && p.architecture.nodes.length > 0
  ).length;

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                User Details
              </span>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{userInfo.username}</span>
                {userInfo.status === "suspended" && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-semibold">
                    SUSPENDED
                  </span>
                )}
              </h1>
            </div>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              userInfo.status === "active"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            {userInfo.status === "active" ? (
              <>
                <UserX className="w-4 h-4" />
                <span>Suspend User Account</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Activate User Account</span>
              </>
            )}
          </button>
        </div>

        {/* User Stats & Profile Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              Profile Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Username</span>
                <span className="font-bold text-slate-100 font-mono">{userInfo.username}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Email</span>
                <span className="font-bold text-cyan-300 font-mono">{userInfo.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">User Role</span>
                <span className="font-bold text-slate-100 font-mono uppercase">{userInfo.role}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Account Status</span>
                <span
                  className={`font-bold font-mono ${
                    userInfo.status === "active" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {userInfo.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Joined Date</span>
                <span className="text-slate-200 font-mono">
                  {new Date(userInfo.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Last Active</span>
                <span className="text-slate-200 font-mono">Today</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              Resource Summary
            </h3>
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#030615] border border-slate-800">
                <span className="text-xs text-slate-400">Projects Created</span>
                <span className="text-lg font-bold text-cyan-300">{userProjects.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#030615] border border-slate-800">
                <span className="text-xs text-slate-400">Architectures</span>
                <span className="text-lg font-bold text-blue-300">{architecturesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Projects Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            <span>User Projects ({userProjects.length})</span>
          </h2>

          {userProjects.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-[#090D1A] text-center text-xs font-mono text-slate-400">
              This user has not created any architecture projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{project.name}</h4>
                    <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 font-semibold">
                      {project.nodeCount} Components
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/admin/projects?view=${project.id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <span>Inspect Architecture</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function UserDetailPage() {
  return (
    <AdminGuard>
      <UserDetailPageContent />
    </AdminGuard>
  );
}
