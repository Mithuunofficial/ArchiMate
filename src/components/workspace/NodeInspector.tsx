"use client";

import React from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { useToast } from "@/hooks/useToast";
import { ArchitectureNodeType, ArchitectureLayer } from "@/types/node";
import { Copy, Trash2, X, Sliders } from "lucide-react";

export function NodeInspector() {
  const {
    currentArchitecture,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    deleteNode,
    duplicateNode,
  } = useArchitectureStore();
  const { toastSuccess, toastInfo } = useToast();

  if (!currentArchitecture) return null;

  const selectedNode = currentArchitecture.nodes.find(
    (n) => n.id === selectedNodeId
  );

  if (!selectedNode) return null;

  const data = selectedNode.data;

  const nodeTypes: ArchitectureNodeType[] = [
    "frontend",
    "backend",
    "database",
    "cache",
    "queue",
    "api",
    "service",
    "external",
    "storage",
    "auth",
    "load-balancer",
    "gateway",
  ];

  const layers: ArchitectureLayer[] = [
    "Presentation",
    "Application",
    "Business",
    "Data",
    "Infrastructure",
    "External Services",
  ];

  const handleDuplicate = () => {
    duplicateNode(selectedNode.id);
    toastSuccess(`Duplicated component "${data.label}"`);
  };

  const handleDelete = () => {
    deleteNode(selectedNode.id);
    toastInfo(`Deleted component "${data.label}"`);
  };

  // Find incoming & outgoing edge dependencies
  const incomingEdges = currentArchitecture.edges.filter(
    (e) => e.target === selectedNode.id
  );
  const outgoingEdges = currentArchitecture.edges.filter(
    (e) => e.source === selectedNode.id
  );

  return (
    <div className="w-80 bg-[#0B1120] border-l border-slate-800 flex flex-col h-full font-sans text-slate-100 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Node Inspector
          </h3>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Name */}
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Component Name
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { label: e.target.value })
            }
            className="w-full px-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        {/* Technology */}
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Technology Stack
          </label>
          <input
            type="text"
            value={data.technology}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { technology: e.target.value })
            }
            className="w-full px-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Type Select */}
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Node Category Type
          </label>
          <select
            value={data.type}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                type: e.target.value as ArchitectureNodeType,
              })
            }
            className="w-full px-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {nodeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Layer Select */}
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Architecture Layer
          </label>
          <select
            value={data.layer}
            onChange={(e) =>
              updateNodeData(selectedNode.id, {
                layer: e.target.value as ArchitectureLayer,
              })
            }
            className="w-full px-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {layers.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Description
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
          />
        </div>

        {/* Dependencies Section */}
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
            Connected Topology
          </label>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">
                Incoming ({incomingEdges.length}):
              </span>
              {incomingEdges.length === 0 ? (
                <span className="text-[11px] text-slate-500">None</span>
              ) : (
                incomingEdges.map((e) => {
                  const sourceNode = currentArchitecture.nodes.find(
                    (n) => n.id === e.source
                  );
                  return (
                    <span
                      key={e.id}
                      className="inline-block mr-1 mt-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono"
                    >
                      ← {sourceNode?.data.label || e.source}
                    </span>
                  );
                })
              )}
            </div>

            <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">
                Outgoing ({outgoingEdges.length}):
              </span>
              {outgoingEdges.length === 0 ? (
                <span className="text-[11px] text-slate-500">None</span>
              ) : (
                outgoingEdges.map((e) => {
                  const targetNode = currentArchitecture.nodes.find(
                    (n) => n.id === e.target
                  );
                  return (
                    <span
                      key={e.id}
                      className="inline-block mr-1 mt-1 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono"
                    >
                      → {targetNode?.data.label || e.target}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#0F172A]/50 flex items-center gap-2">
        <button
          onClick={handleDuplicate}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex flex-items items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
