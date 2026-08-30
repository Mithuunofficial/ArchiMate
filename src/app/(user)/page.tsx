"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Zap,
  LayoutGrid,
  Database,
  Code2,
  Box,
  FolderGit2,
  Activity,
  Download,
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleStartDesigning = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/workspace");
    } else {
      router.push("/login?redirect=workspace");
    }
  };

  const features = [
    {
      title: "AI Architecture Generation",
      description: "Turn natural-language prompts into production-grade multi-tier architecture diagrams.",
      icon: Sparkles,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Interactive Diagram Canvas",
      description: "Drag, connect, customize, and re-arrange software components with auto-layout.",
      icon: LayoutGrid,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      title: "Relational Database Design",
      description: "Generate entity-relationship tables, columns, data types, primary keys, and foreign keys.",
      icon: Database,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      title: "REST API Specifications",
      description: "Auto-generate HTTP endpoints, request payloads, response samples, and OpenAPI data.",
      icon: Code2,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      title: "Docker Container Topology",
      description: "Produce ready-to-run docker-compose.yml files for local microservice orchestration.",
      icon: Box,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Project Repository Trees",
      description: "Visualize modular project folder directory structures tailored to your technology stack.",
      icon: FolderGit2,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      title: "System Health & Security Analysis",
      description: "Identify bottlenecks, single points of failure, scalability ratings, and security risks.",
      icon: Activity,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "High-Res Export System",
      description: "Export high-resolution PNG snapshots, scalable SVG vectors, or full architecture JSON.",
      icon: Download,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-radial-glow opacity-80" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Generation Developer Tooling</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight"
        >
          Design Software Architecture with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">AI Precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Describe your application requirements in plain English. ArchiMate transforms your text into an interactive, visual, and editable software architecture diagram.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={handleStartDesigning}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Start Designing</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/templates"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore Templates</span>
          </Link>
        </motion.div>

        {/* Animated Architecture Canvas Preview Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative max-w-4xl mx-auto rounded-2xl border border-cyan-500/30 bg-[#0B1120]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">archimate_workspace.design</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              SUPABASE DB PERSISTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Server className="w-4 h-4" />
                <span>Next.js Client</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">React Flow Canvas & User Dashboard</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Supabase Auth</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Secure Credentials & User Profiles</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Database className="w-4 h-4" />
                <span>PostgreSQL DB</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">Row-Level Security & Architecture JSON</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Everything Needed to Model Enterprise Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            From plain-text prompts to complete developer artifacts in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-5 rounded-2xl border border-slate-800 bg-[#0F172A]/70 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className={`p-2.5 rounded-xl border w-fit mb-4 ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Showreel Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center z-10">
        <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0B1120] to-[#0F172A] shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Visualize Your Application Architecture?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md mx-auto">
            Secure authentication, user profiles, and persistent architecture workspace with Supabase PostgreSQL.
          </p>
          <button
            onClick={handleStartDesigning}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Workspace IDE</span>
          </button>
        </div>
      </section>
    </div>
  );
}
