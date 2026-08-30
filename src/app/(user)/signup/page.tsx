"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Sparkles, Eye, EyeOff, Check, X, ArrowRight, Loader2, Mail, AlertCircle } from "lucide-react";

function CheckEmailView({ email }: { email: string }) {
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await authService.resendVerificationEmail(email);
      if (res.success) {
        setResendStatus("Verification email sent.");
        setCooldown(res.cooldownSeconds || 60);
      } else {
        setResendStatus(res.error || "Failed to send email.");
        if (res.cooldownSeconds) {
          setCooldown(res.cooldownSeconds);
        }
      }
    } catch {
      setResendStatus("Unable to request verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-[#0F172A]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
            Account Created
          </span>
          <h2 className="text-2xl font-extrabold text-white">Check your email</h2>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            We&apos;ve sent a verification link to <strong className="text-cyan-300 font-mono">{email}</strong>.
          </p>
          <p className="text-xs text-slate-400 pt-1">
            Please verify your email to activate your ArchiMate account.
          </p>
        </div>

        {resendStatus && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-cyan-300 font-mono">
            {resendStatus}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Sending email...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend available in {cooldown} seconds</span>
            ) : (
              <span>Resend Verification Email</span>
            )}
          </button>

          <Link
            href="/login"
            className="inline-flex w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = username.trim().length >= 2 && email.includes("@") && hasMinLength && hasNumber && hasUppercase && passwordsMatch;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      if (!passwordsMatch) {
        setErrorMessage("Passwords do not match.");
      } else {
        setErrorMessage("Please fulfill all password requirements.");
      }
      return;
    }

    setIsLoading(true);
    try {
      const { session, user, needsEmailVerification, error } = await authService.signUp({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error);
      } else if (needsEmailVerification) {
        setEmailSent(true);
      } else if (session || user) {
        router.push("/workspace");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return <CheckEmailView email={email} />;
  }

  return (
    <div className="relative min-h-screen bg-[#050816] text-slate-100 font-sans flex items-center justify-center p-4 overflow-hidden">
      {/* Background Grid & Architectural Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06B6D4" strokeWidth="0.5" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" />
      </div>

      {/* Signup Card */}
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
          <h1 className="text-2xl font-bold tracking-tight text-white pt-1">
            Create your ArchiMate account
          </h1>
          <p className="text-xs text-slate-400">
            Build and persist cloud architectures with Supabase PostgreSQL
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
        <form onSubmit={handleSignup} className="space-y-3.5">
          {/* Username Field */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1 font-semibold">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_architect"
              className="w-full px-4 py-2.5 text-xs bg-[#050816]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1 font-semibold">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-4 py-2.5 text-xs bg-[#050816]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1 font-semibold">
              Password
            </label>
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

          {/* Confirm Password Field */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-1 font-semibold">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-xs bg-[#050816]/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-[#050816]/60 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
              Password Requirements:
            </span>
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className={hasMinLength ? "text-emerald-300" : "text-slate-400"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className={hasNumber ? "text-emerald-300" : "text-slate-400"}>
                Contains a number
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasUppercase ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className={hasUppercase ? "text-emerald-300" : "text-slate-400"}>
                Contains an uppercase letter
              </span>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                {passwordsMatch ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className={passwordsMatch ? "text-emerald-300" : "text-rose-400"}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 font-sans">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
