"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  variant?: "primary" | "mark" | "navbar" | "admin";
  className?: string;
  size?: number;
  showBadge?: boolean;
  badgeText?: string;
}

export function Logo({
  variant = "navbar",
  className = "",
  size = 32,
  showBadge = true,
  badgeText = "PRO",
}: LogoProps) {
  if (variant === "primary") {
    return (
      <div className={`relative flex items-center ${className}`}>
        <Image
          src="/logo.png"
          alt="ArchiMate Logo"
          width={180}
          height={48}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
    );
  }

  if (variant === "mark") {
    return (
      <div className={`relative flex items-center shrink-0 ${className}`}>
        <Image
          src="/icon.png"
          alt="ArchiMate Icon"
          width={size}
          height={size}
          className="w-auto h-auto object-contain"
          priority
        />
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="relative shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#090D1A] border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <Image
            src="/icon.png"
            alt="ArchiMate Icon"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
            priority
          />
        </div>
        <div>
          <span className="text-sm font-extrabold tracking-tight text-white font-mono block leading-none">
            Archi<span className="text-cyan-400">Mate</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block pt-1">
            ADMINISTRATION
          </span>
        </div>
      </div>
    );
  }

  // Default navbar variant
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#090D1A] border border-cyan-500/30 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
        <Image
          src="/icon.png"
          alt="ArchiMate Icon"
          width={28}
          height={28}
          className="w-7 h-7 object-contain"
          priority
        />
      </div>
      <span className="text-base font-extrabold tracking-tight text-white font-mono leading-none">
        Archi<span className="text-cyan-400">Mate</span>
      </span>
      {showBadge && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          {badgeText}
        </span>
      )}
    </div>
  );
}
