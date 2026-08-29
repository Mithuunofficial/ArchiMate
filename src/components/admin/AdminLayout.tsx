"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  FolderGit2,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminProfile, adminSignOut } = useAdminAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const adminName = adminProfile?.username || "Admin";

  const handleSignOut = () => {
    adminSignOut();
    router.push("/admin");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users, exact: false },
    { href: "/admin/projects", label: "Projects", icon: FolderGit2, exact: false },
    { href: "/admin/activity", label: "Activity", icon: Activity, exact: false },
    { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
  ];

  return (
    <div className="min-h-screen bg-[#030615] text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#070B19] shrink-0 font-sans">
        {/* Admin Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white font-mono block">
              Archi<span className="text-cyan-400">Mate</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Administration
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-[#090D1A] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{adminName}</p>
                <span className="text-[9px] font-mono text-cyan-400 block font-semibold">
                  Administrator
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden h-14 px-4 bg-[#070B19] border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white font-mono">
            Archi<span className="text-cyan-400">Mate Admin</span>
          </span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-[#070B19] border-b border-slate-800 z-40 p-4 space-y-2 font-sans shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                  isActive ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Shell */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
