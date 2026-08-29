"use client";

import React, { useState, useEffect } from "react";
import { useCommandPaletteStore } from "@/hooks/useCommandPalette";
import { useRouter } from "next/navigation";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Sparkles,
  FolderPlus,
  Folder,
  LayoutGrid,
  Download,
  BookOpen,
  Sliders,
} from "lucide-react";
import { exportToJson, exportToSvg } from "@/utils/export";

export function CommandPaletteModal() {
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { applyLayout, currentArchitecture } = useArchitectureStore();
  const { toastSuccess, toastWarning } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle, close]);

  if (!isOpen) return null;

  const commands = [
    {
      id: "cmd-gen",
      title: "Generate Architecture with AI",
      icon: Sparkles,
      action: () => {
        router.push("/workspace");
        close();
      },
    },
    {
      id: "cmd-new-proj",
      title: "Create New Project",
      icon: FolderPlus,
      action: () => {
        router.push("/projects");
        close();
      },
    },
    {
      id: "cmd-projects",
      title: "Open Projects Dashboard",
      icon: Folder,
      action: () => {
        router.push("/projects");
        close();
      },
    },
    {
      id: "cmd-templates",
      title: "Explore Architecture Templates",
      icon: BookOpen,
      action: () => {
        router.push("/templates");
        close();
      },
    },
    {
      id: "cmd-layout",
      title: "Trigger Auto Layout (Hierarchical)",
      icon: LayoutGrid,
      action: () => {
        if (!currentArchitecture) {
          toastWarning("No project active to layout.");
        } else {
          applyLayout("HIERARCHICAL");
          toastSuccess("Auto layout applied!");
        }
        close();
      },
    },
    {
      id: "cmd-export-json",
      title: "Export Architecture JSON",
      icon: Download,
      action: () => {
        if (!currentArchitecture) {
          toastWarning("No active project architecture to export.");
        } else {
          exportToJson(currentArchitecture);
          toastSuccess("Exported Architecture JSON");
        }
        close();
      },
    },
    {
      id: "cmd-export-svg",
      title: "Export Diagram SVG",
      icon: Download,
      action: () => {
        if (!currentArchitecture) {
          toastWarning("No active project architecture to export.");
        } else {
          exportToSvg();
          toastSuccess("Exported Diagram SVG");
        }
        close();
      },
    },
    {
      id: "cmd-settings",
      title: "Open Settings",
      icon: Sliders,
      action: () => {
        router.push("/settings");
        close();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#0B1120] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-[#0F172A]">
          <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search... (Press Esc to exit)"
            autoFocus
            className="w-full py-3 text-xs bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No matching command found.
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {cmd.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                    Run
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
