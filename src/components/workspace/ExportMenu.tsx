"use client";

import React from "react";
import { Download, FileJson, FileCode, Image, X } from "lucide-react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { exportToJson, exportToSvg } from "@/utils/export";
import { useToast } from "@/hooks/useToast";

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportMenu({ isOpen, onClose }: ExportMenuProps) {
  const { currentArchitecture } = useArchitectureStore();
  const { toastSuccess, toastError, toastWarning } = useToast();

  if (!isOpen) return null;

  const handleExportJson = () => {
    if (!currentArchitecture) {
      toastWarning("No architecture loaded to export.");
      return;
    }
    try {
      exportToJson(currentArchitecture);
      toastSuccess("Exported Architecture JSON successfully");
      onClose();
    } catch {
      toastError("Failed to export JSON");
    }
  };

  const handleExportSvg = () => {
    if (!currentArchitecture) {
      toastWarning("No architecture loaded to export.");
      return;
    }
    try {
      exportToSvg("react-flow-wrapper", `${currentArchitecture.name.toLowerCase().replace(/\s+/g, "-")}.svg`);
      toastSuccess("Exported Diagram SVG successfully");
      onClose();
    } catch {
      toastError("Failed to export SVG");
    }
  };

  const handleExportPng = () => {
    if (!currentArchitecture) {
      toastWarning("No architecture loaded to export.");
      return;
    }
    toastSuccess("Initiating PNG snapshot download...");
    handleExportSvg();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm p-5 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">Export Architecture</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleExportPng}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Export PNG Image</h4>
              <p className="text-[11px] text-slate-400">High-resolution diagram raster snapshot.</p>
            </div>
          </button>

          <button
            onClick={handleExportSvg}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Export SVG Vector</h4>
              <p className="text-[11px] text-slate-400 font-mono">Scalable vector graphics diagram format.</p>
            </div>
          </button>

          <button
            onClick={handleExportJson}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Export Full JSON Data</h4>
              <p className="text-[11px] text-slate-400">Complete nodes, edges, DB, and API schema data.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
