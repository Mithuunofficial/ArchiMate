"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Command,
  ArrowRight,
  LayoutGrid,
  Layers,
  FolderGit2,
  Sliders,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useCommandPaletteStore } from "@/hooks/useCommandPalette";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useCommandPaletteStore();
  const { isAuthenticated, profile, user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Architect";

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/workspace", label: "Workspace", icon: LayoutGrid, requiresAuth: true },
    { href: "/templates", label: "Templates", icon: Layers, requiresAuth: false },
    { href: "/projects", label: "Projects", icon: FolderGit2, requiresAuth: true },
    { href: "/settings", label: "Settings", icon: Sliders, requiresAuth: true },
  ];

  // Hide Navbar completely on full standalone auth pages if requested, or keep clean header
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#050816]/90 backdrop-blur-md border-b border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white font-mono">
            Archi<span className="text-cyan-400">Mate</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            PRO
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-slate-800/80 text-cyan-300 border border-slate-700/60 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Command Palette Trigger */}
          <button
            onClick={open}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs font-mono transition-colors"
            title="Command Palette (Ctrl + K)"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">
              Ctrl K
            </kbd>
          </button>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                  {displayName.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate font-mono text-cyan-300">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl z-50 text-xs font-sans">
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.email}</p>
                  </div>

                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profile & Settings</span>
                  </Link>

                  <Link
                    href="/projects"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Projects</span>
                  </Link>

                  <div className="border-t border-slate-800/80 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/10 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
