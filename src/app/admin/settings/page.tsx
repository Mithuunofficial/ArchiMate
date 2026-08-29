"use client";

import React from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Settings, ShieldCheck, Server, Lock } from "lucide-react";

function AdminSettingsContent() {
  const { adminProfile } = useAdminAuth();

  const adminUsername = adminProfile?.username || "Admin-Archimate";
  const adminEmail = adminProfile?.email || "admin@archimate.dev";

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Admin System Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            System configuration, administrator security, session parameters, and database environment health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Account Settings */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-4">
            <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Admin Account Profile</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Administrator Username</span>
                <span className="text-cyan-300 font-bold">{adminUsername}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Associated Email</span>
                <span className="text-slate-200">{adminEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Authorization Tier</span>
                <span className="text-emerald-400 font-bold uppercase">Super Administrator (RBAC)</span>
              </div>
            </div>
          </div>

          {/* Security & Authentication Policy */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-4">
            <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3 font-bold text-sm">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Security & Access Control</span>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Password Hashing</span>
                <span className="text-emerald-400 font-bold">Supabase Auth (bcrypt)</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Database Protection</span>
                <span className="text-emerald-400 font-bold">PostgreSQL RLS Active</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">API Route Enforcement</span>
                <span className="text-emerald-400 font-bold">Server Auth Verifier</span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800 bg-[#090D1A] space-y-4">
            <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3 font-bold text-sm">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>System & Environment Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#030615] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Application Stack</span>
                <span className="text-slate-200 font-bold">Next.js 14 App Router</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#030615] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Database Engine</span>
                <span className="text-cyan-300 font-bold">Supabase PostgreSQL 15</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#030615] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Diagram Topology Engine</span>
                <span className="text-blue-300 font-bold">React Flow v12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <AdminSettingsContent />
    </AdminGuard>
  );
}
