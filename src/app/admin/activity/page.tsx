"use client";

import React, { useState, useEffect } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/useToast";
import { AdminActivityLog } from "@/types/auth";
import { Activity, Clock, Loader2 } from "lucide-react";

function ActivityContent() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { adminSession } = useAdminAuth();
  const { toastError } = useToast();

  const fetchActivityLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/activity", {
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      } else {
        toastError(data.error || "Failed to fetch activity logs.");
      }
    } catch {
      toastError("Unable to connect to server audit log.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.access_token) {
      fetchActivityLogs();
    }
  }, [adminSession]);

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Admin Audit Logs
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete chronological audit trail of all security and administrative operations executed in ArchiMate.
            </p>
          </div>

          <button
            onClick={fetchActivityLogs}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Refresh Logs
          </button>
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#090D1A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070B19] text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Administrator</th>
                  <th className="py-3.5 px-4 font-bold">Action</th>
                  <th className="py-3.5 px-4 font-bold">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 font-mono">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span>Loading administrative audit trail...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 font-mono">
                      No administrative audit activity recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300 font-bold">
                        {log.adminUsername}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold">
                          {log.targetType || "system"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminActivityPage() {
  return (
    <AdminGuard>
      <ActivityContent />
    </AdminGuard>
  );
}
