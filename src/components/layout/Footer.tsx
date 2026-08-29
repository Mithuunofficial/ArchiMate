import React from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#050816] border-t border-slate-800/80 font-sans text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white font-mono tracking-tight">
              Archi<span className="text-cyan-400">Mate</span>
            </span>
            <p className="text-xs text-slate-500">
              AI-Powered Software Architecture Generator & Visual Modeler.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="/workspace" className="hover:text-cyan-300 transition-colors">
            Workspace IDE
          </Link>
          <Link href="/templates" className="hover:text-cyan-300 transition-colors">
            Templates Catalog
          </Link>
          <Link href="/projects" className="hover:text-cyan-300 transition-colors">
            Saved Projects
          </Link>
          <Link href="/settings" className="hover:text-cyan-300 transition-colors">
            Preferences
          </Link>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} ArchiMate. Built for Software Engineers.
        </div>
      </div>
    </footer>
  );
}
