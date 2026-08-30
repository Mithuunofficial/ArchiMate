"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!username.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await authService.signIn({ username: username.trim(), password });
      if (error) {
        setErrorMessage(error);
      } else if (user) {
        router.push("/workspace");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-slate-100 font-sans flex items-center justify-center p-4 overflow-hidden">
      {/* Background Architectural Canvas Animation Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Floating Glowing Nodes */}
        <div className="absolute top-1/4 left-1/5 w-48 h-48 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[#0F172A]/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-mono">
              Archi<span className="text-cyan-400">Mate</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white pt-2">
            Welcome back, Architect
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your cloud architecture workspace
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1.5 font-semibold">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Prince"
              className="w-full px-4 py-2.5 text-xs bg-[#050816]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs bg-[#050816]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 font-sans">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
