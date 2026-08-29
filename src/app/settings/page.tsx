"use client";

import React from "react";
import { useSettingsStore } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import { Sliders, LayoutGrid, Eye, Keyboard, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { toastSuccess } = useToast();

  const handleUpdate = (updated: Partial<typeof settings>) => {
    settings.updateSettings(updated);
    toastSuccess("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 font-sans p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Application Preferences & Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize diagram rendering, layout defaults, editor options, and keyboard shortcuts.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          Appearance & Theme
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(["dark", "light", "system"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleUpdate({ theme: mode })}
              className={`p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider font-mono flex items-center justify-between transition-all ${
                settings.theme === mode
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md"
                  : "border-slate-800 bg-[#0B1120] text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{mode}</span>
              {settings.theme === mode && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Diagram Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-cyan-400" />
          Diagram & Canvas Preferences
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-200">Default Auto-Layout Algorithm</h3>
              <p className="text-slate-400 text-[11px]">Primary structure used for canvas auto-arrangement.</p>
            </div>
            <select
              value={settings.defaultLayout}
              onChange={(e) => handleUpdate({ defaultLayout: e.target.value as any })}
              className="bg-[#0F172A] border border-slate-700 text-cyan-300 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="HIERARCHICAL">HIERARCHICAL (Layered)</option>
              <option value="HORIZONTAL">HORIZONTAL (Left-to-Right)</option>
              <option value="VERTICAL">VERTICAL (Top-to-Bottom)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-200">Show Minimap View</h3>
              <p className="text-slate-400 text-[11px]">Display bottom-right canvas overview minimap.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showMinimap}
              onChange={(e) => handleUpdate({ showMinimap: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-200">Animated Connection Edges</h3>
              <p className="text-slate-400 text-[11px]">Show active animated pulse along directional flow paths.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.animatedEdges}
              onChange={(e) => handleUpdate({ animatedEdges: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          Keyboard Shortcuts Legend
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Command Palette</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Ctrl + K</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Save Project</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Ctrl + S</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Undo Action</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Ctrl + Z</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Redo Action</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Ctrl + Shift + Z</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Delete Selected Node</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Delete / Backspace</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1120] border border-slate-800">
            <span className="text-slate-300">Fit Canvas View</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">F</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
