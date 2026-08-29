"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/useToast";
import {
  Users,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
  FolderGit2,
  UserX,
  UserCheck,
  X,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

function UserManagementContent() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { adminSession } = useAdminAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const fetchUsers = async (queryStr = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(queryStr)}`, {
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        toastError(data.error || "Failed to fetch user list.");
      }
    } catch {
      toastError("Unable to connect to admin API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.access_token) {
      const timer = setTimeout(() => {
        fetchUsers(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, adminSession]);

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toastSuccess(`User "${user.username}" status updated to ${nextStatus}.`);
        fetchUsers(search);
      } else {
        toastError(data.error || "Failed to update user status.");
      }
    } catch {
      toastError("Unable to update user status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toastInfo(`User "${deletingUser.username}" deleted successfully.`);
        setDeletingUser(null);
        fetchUsers(search);
      } else {
        toastError(data.error || "Failed to delete user account.");
      }
    } catch {
      toastError("Unable to delete user account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                User Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage accounts, inspect user profiles, toggle active/suspended status, and perform deletions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-[#090D1A] px-3 py-1.5 rounded-xl border border-slate-800">
              Total Users: <strong className="text-cyan-300">{users.length}</strong>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by username or email..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#090D1A] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#090D1A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070B19] text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3.5 px-4 font-bold">User</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Projects</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-mono">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span>Searching database users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-mono">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">{user.username}</span>
                            <span className="text-[10px] font-mono text-slate-500 truncate block">
                              ID: {user.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{user.email}</td>

                      {/* Role */}
                      <td className="py-3.5 px-4 font-mono">
                        {user.role === "admin" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Projects Count */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{user.projectCount}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 font-mono">
                        {user.status === "active" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === "active"
                                ? "bg-slate-800 hover:bg-rose-500/10 text-rose-400"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                            }`}
                            title={user.status === "active" ? "Suspend User" : "Activate User"}
                          >
                            {user.status === "active" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-[#090D1A] border border-rose-500/30 rounded-2xl shadow-2xl text-slate-100 font-sans space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Delete User?</span>
                </div>
                <button
                  onClick={() => setDeletingUser(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  Are you sure you want to delete user account{" "}
                  <strong className="text-white font-mono">&quot;{deletingUser.username}&quot;</strong> (
                  {deletingUser.email})?
                </p>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1 font-mono">
                  <p className="font-bold uppercase tracking-wider text-[10px]">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li>User Auth credentials</li>
                    <li>User profile record</li>
                    <li>All projects ({deletingUser.projectCount})</li>
                    <li>Associated architectures & diagrams</li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-400 italic">This action cannot be undone.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting User...</span>
                    </>
                  ) : (
                    <span>Delete User</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function UserManagementPage() {
  return (
    <AdminGuard>
      <UserManagementContent />
    </AdminGuard>
  );
}
