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
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Logo } from "@/components/ui/Logo";

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
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#070B19] shrink-0 font-sans sticky top-0 h-screen">
        {/* Admin Branding Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800/80 shrink-0">
          <Logo variant="admin" />
        </div>

        {/* Security Badge Indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="tracking-wider uppercase truncate">SECURE PORTAL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Admin Navigation" className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Profile & Sign Out Footer Card */}
        <div className="p-4 border-t border-slate-800/80 shrink-0">
          <div className="p-3 rounded-2xl bg-[#090D1A] border border-slate-800/80 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{adminName}</p>
                <span className="text-[9px] font-mono text-cyan-400 block font-semibold uppercase tracking-wider">
                  Administrator
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
              title="Sign Out of Admin Portal"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden h-14 px-4 bg-[#070B19] border-b border-slate-800 flex items-center justify-between z-30 sticky top-0">
        <Logo variant="admin" />

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label={isMobileOpen ? "Close Admin Menu" : "Open Admin Menu"}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-[#070B19]/95 backdrop-blur-xl border-b border-slate-800 z-40 p-4 space-y-2 font-sans shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-2 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>SECURE ADMINISTRATOR PORTAL</span>
          </div>

          <nav aria-label="Mobile Admin Navigation" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 mt-2">
            <button
              onClick={() => {
                setIsMobileOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Logout Admin Session</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{adminName}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
