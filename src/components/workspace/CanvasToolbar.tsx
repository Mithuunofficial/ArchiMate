"use client";

import React from "react";
import {
  Plus,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { useToast } from "@/hooks/useToast";

interface CanvasToolbarProps {
  onOpenComponentSidebar: () => void;
}

export function CanvasToolbar({ onOpenComponentSidebar }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { applyLayout, undo, redo, setArchitecture, currentArchitecture } =
    useArchitectureStore();
  const { toastInfo, toastSuccess } = useToast();

  const handleAutoLayout = () => {
    if (!currentArchitecture) return;
    applyLayout("HIERARCHICAL");
    toastSuccess("Architecture auto-arranged in hierarchical layers!");
  };

  const handleClear = () => {
    if (!currentArchitecture) return;
    if (confirm("Are you sure you want to clear the canvas?")) {
      setArchitecture({
        ...currentArchitecture,
        nodes: [],
        edges: [],
      });
      toastInfo("Canvas cleared");
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0F172A]/90 border border-slate-800 backdrop-blur-md rounded-xl shadow-xl">
      {/* Add Component Button */}
      <button
        onClick={onOpenComponentSidebar}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Component</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800 my-auto mx-0.5" />

      {/* Auto Layout */}
      <button
        onClick={handleAutoLayout}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        title="Auto Arrange Layout"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Auto Layout</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800 my-auto mx-0.5" />

      {/* Zoom Controls */}
      <button
        onClick={() => zoomIn()}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => zoomOut()}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => fitView({ padding: 0.2 })}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Fit Canvas View (F)"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-5 bg-slate-800 my-auto mx-0.5" />

      {/* Undo & Redo */}
      <button
        onClick={undo}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Undo (Ctrl + Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={redo}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Redo (Ctrl + Shift + Z)"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-5 bg-slate-800 my-auto mx-0.5" />

      {/* Clear Canvas */}
      <button
        onClick={handleClear}
        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-rose-400/80 hover:text-rose-300 transition-colors"
        title="Clear Canvas"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
