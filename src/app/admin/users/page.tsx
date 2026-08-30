"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  UserCheck,
  UserX,
  X,
  Check,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected" | "suspended";
  accountStatus: "pending" | "approved" | "rejected" | "suspended";
  emailVerified: boolean;
  adminApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  suspendedAt?: string | null;
  rejectionReason?: string | null;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

type FilterType = "all" | "pending" | "approved" | "rejected" | "suspended";

function UserManagementContent() {
  const searchParams = useSearchParams();
  const initialStatusParam = (searchParams.get("status") || "pending") as FilterType;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    ["all", "pending", "approved", "rejected", "suspended"].includes(initialStatusParam)
      ? initialStatusParam
      : "pending"
  );

  // Active modal targets
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | "suspend" | "activate" | "delete" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { adminSession } = useAdminAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const fetchUsers = async (queryStr = "", statusFilter: FilterType = filter) => {
    setIsLoading(true);
    try {
      const url = `/api/admin/users?q=${encodeURIComponent(queryStr)}&status=${statusFilter}`;
      const res = await fetch(url, {
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
        fetchUsers(search, filter);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, filter, adminSession]);

  const handleActionSubmit = async () => {
    if (!targetUser || !modalType) return;
    setIsSubmitting(true);
    try {
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      if (modalType === "approve") {
        endpoint = `/api/admin/users/${targetUser.id}/approve`;
      } else if (modalType === "reject") {
        endpoint = `/api/admin/users/${targetUser.id}/reject`;
        payload = { reason: rejectionReason.trim() };
      } else if (modalType === "suspend") {
        endpoint = `/api/admin/users/${targetUser.id}/suspend`;
      } else if (modalType === "activate") {
        endpoint = `/api/admin/users/${targetUser.id}/activate`;
      } else if (modalType === "delete") {
        endpoint = `/api/admin/users/${targetUser.id}/delete`;
      }

      const res = await fetch(endpoint, {
        method: modalType === "delete" ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
        body: modalType !== "delete" ? JSON.stringify(payload) : undefined,
      });

      const data = await res.json();
      if (res.ok) {
        if (modalType === "approve") toastSuccess(`User "${targetUser.username}" approved successfully!`);
        else if (modalType === "reject") toastInfo(`User "${targetUser.username}" rejected.`);
        else if (modalType === "suspend") toastInfo(`User "${targetUser.username}" suspended.`);
        else if (modalType === "activate") toastSuccess(`User "${targetUser.username}" activated!`);
        else if (modalType === "delete") toastInfo(`User "${targetUser.username}" deleted.`);

        setTargetUser(null);
        setModalType(null);
        setRejectionReason("");
        fetchUsers(search, filter);
      } else {
        toastError(data.error || "Failed to complete operation.");
      }
    } catch {
      toastError("Error connecting to server endpoint.");
    } finally {
      setIsSubmitting(false);
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
                User Management & Approvals
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Dual-method authorization: Review pending users, trigger admin approvals, suspend or activate accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-[#090D1A] px-3 py-1.5 rounded-xl border border-slate-800">
              Users Shown: <strong className="text-cyan-300">{users.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#090D1A] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            {(
              [
                { id: "pending", label: "Pending Approval", icon: Clock },
                { id: "approved", label: "Approved", icon: CheckCircle2 },
                { id: "rejected", label: "Rejected", icon: XCircle },
                { id: "suspended", label: "Suspended", icon: Lock },
                { id: "all", label: "All Users", icon: Users },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? tab.id === "pending"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : tab.id === "approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : tab.id === "rejected"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : tab.id === "suspended"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#090D1A] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Admin User Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#090D1A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070B19] text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3.5 px-4 font-bold">Username</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold text-center">Email Verified</th>
                  <th className="py-3.5 px-4 font-bold text-center">Admin Approval</th>
                  <th className="py-3.5 px-4 font-bold">Account Status</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-mono">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span>Querying user accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-mono">
                      No users found in current filter.
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
                            {user.role === "admin" && (
                              <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold">ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{user.email}</td>

                      {/* Email Verification Column */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {user.emailVerified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium inline-flex items-center gap-1">
                            <X className="w-3 h-3 text-slate-500" />
                            <span>Not Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Approval Column */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {user.adminApproved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            Not Approved
                          </span>
                        )}
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-3.5 px-4 font-mono">
                        {user.accountStatus === "approved" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                        {user.accountStatus === "pending" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}
                        {user.accountStatus === "rejected" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                        {user.accountStatus === "suspended" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
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

                          {/* For Pending users */}
                          {user.accountStatus === "pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setTargetUser(user);
                                  setModalType("approve");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                                title="Approve User"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setTargetUser(user);
                                  setModalType("reject");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                                title="Reject User"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* For Approved users */}
                          {user.accountStatus === "approved" && (
                            <button
                              onClick={() => {
                                setTargetUser(user);
                                setModalType("suspend");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                              title="Suspend User"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* For Rejected or Suspended users */}
                          {(user.accountStatus === "rejected" || user.accountStatus === "suspended") && (
                            <button
                              onClick={() => {
                                setTargetUser(user);
                                setModalType("activate");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                              title="Approve / Activate User"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve / Activate</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setTargetUser(user);
                              setModalType("delete");
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
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

        {/* Action Confirmation Dialog Modal */}
        {targetUser && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-[#090D1A] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-base">
                  {modalType === "approve" && <UserCheck className="w-5 h-5 text-emerald-400" />}
                  {modalType === "reject" && <XCircle className="w-5 h-5 text-rose-400" />}
                  {modalType === "suspend" && <Lock className="w-5 h-5 text-purple-400" />}
                  {modalType === "activate" && <UserCheck className="w-5 h-5 text-emerald-400" />}
                  {modalType === "delete" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                  <span className="capitalize">{modalType} User?</span>
                </div>
                <button
                  onClick={() => {
                    setTargetUser(null);
                    setModalType(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  User: <strong className="text-white font-mono">&quot;{targetUser.username}&quot;</strong> ({targetUser.email})
                </p>

                {modalType === "approve" && (
                  <p className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    Are you sure you want to approve this account? The user will be granted immediate access to create and save architectures.
                  </p>
                )}

                {modalType === "reject" && (
                  <div className="space-y-3">
                    <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      This user will not be able to create architectures or access protected application features.
                    </p>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Rejection Reason (Optional)
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Account details incomplete"
                        className="w-full px-3 py-2 text-xs bg-[#030615] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                {modalType === "suspend" && (
                  <p className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    Are you sure you want to suspend this user? A suspended user will be blocked from creating or updating architectures, projects, and calling protected APIs.
                  </p>
                )}

                {modalType === "activate" && (
                  <p className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    Activate account for user &quot;{targetUser.username}&quot;? Account status will be set to approved.
                  </p>
                )}

                {modalType === "delete" && (
                  <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    This will permanently delete user account &quot;{targetUser.username}&quot; and all associated projects.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setTargetUser(null);
                    setModalType(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    modalType === "approve" || modalType === "activate"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                      : modalType === "suspend"
                      ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span className="capitalize">{modalType} User</span>
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
      <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading User Management...</div>}>
        <UserManagementContent />
      </Suspense>
    </AdminGuard>
  );
}
