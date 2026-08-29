"use client";

import React, { useState } from "react";
import { Sparkles, Trash2, Zap } from "lucide-react";
import { cn } from "@/utils/cn";

interface RequirementPanelProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    label: "E-Commerce Platform",
    prompt:
      "Build an e-commerce platform with React frontend, Node.js backend, PostgreSQL database, Redis cache, authentication service and Stripe payment integration.",
  },
  {
    label: "SaaS Platform",
    prompt:
      "Design a multi-tenant SaaS platform with Next.js dashboard, API Gateway, Tenant auth service, PostgreSQL DB with RLS, Redis rate-limiter, and AWS S3 storage.",
  },
  {
    label: "AI Application",
    prompt:
      "Build an AI application with RAG vector search using Qdrant, FastAPI backend, LangChain agent pipeline, Redis conversation memory, and Gemini LLM integration.",
  },
  {
    label: "Social Media App",
    prompt:
      "Build a real-time social media app with React Native frontend, GraphQL API Gateway, Cassandra timeline feed store, WebSockets service, and Redis caching.",
  },
  {
    label: "Banking System",
    prompt:
      "Design a secure banking core system with Java Spring Boot microservices, mTLS API gateway, PostgreSQL ledger, Apache Kafka transaction logs, and HSM keys.",
  },
];

export function RequirementPanel({ onGenerate, isGenerating }: RequirementPanelProps) {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0].prompt);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1120] border-r border-slate-800 p-4 font-sans text-slate-100 overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            What are you building?
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {prompt.length} chars
        </span>
      </div>

      {/* Large Textarea */}
      <div className="relative mb-3 group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your application in plain English... e.g. Build an e-commerce platform with React, Node.js, PostgreSQL, Redis, and Stripe payments."
          rows={5}
          className="w-full p-3 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-sans leading-relaxed"
        />

        {prompt && (
          <button
            onClick={() => setPrompt("")}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear prompt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <label className="text-[11px] font-mono text-slate-400 block mb-2">
          Example Requirement Presets:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => setPrompt(item.prompt)}
              className={cn(
                "px-2.5 py-1 text-[11px] rounded-lg border transition-all duration-150 font-medium",
                prompt === item.prompt
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-800 bg-[#0F172A] text-slate-400 hover:border-slate-700 hover:text-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className={cn(
          "w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-lg",
          !prompt.trim() || isGenerating
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/20 active:scale-[0.99]"
        )}
      >
        <Zap className="w-4 h-4 fill-current" />
        {isGenerating ? "Generating Architecture..." : "Generate Architecture"}
      </button>
    </div>
  );
}
