"use client";

import React, { useState } from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { Copy, Download, Check, Box } from "lucide-react";
import { downloadTextFile } from "@/utils/export";
import { useToast } from "@/hooks/useToast";

export function DockerTab() {
  const { currentArchitecture } = useArchitectureStore();
  const [copied, setCopied] = useState(false);
  const { toastSuccess, toastWarning } = useToast();

  if (!currentArchitecture) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No project active.
      </div>
    );
  }

  const { dockerCompose } = currentArchitecture;

  const handleCopy = () => {
    if (!dockerCompose) return;
    navigator.clipboard.writeText(dockerCompose);
    setCopied(true);
    toastSuccess("Docker Compose YAML copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dockerCompose) return;
    downloadTextFile(dockerCompose, "docker-compose.yml", "application/x-yaml");
    toastSuccess("Downloaded docker-compose.yml");
  };

  return (
    <div className="p-5 bg-[#0B1120] text-slate-100 font-sans space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            Generated Docker Compose Topology
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Production container orchestration specification matching architecture nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copied ? "Copied" : "Copy YAML"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-xl font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
        <pre>{dockerCompose || "# No docker compose configuration available for this project yet."}</pre>
      </div>
    </div>
  );
}
