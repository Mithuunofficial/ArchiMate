import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ArchiMate Administration",
  description: "Secure Administrator Portal for ArchiMate",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030615] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {children}
    </div>
  );
}
