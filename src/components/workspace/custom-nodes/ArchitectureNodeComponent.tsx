import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { CustomNodeData, ArchitectureNodeType } from "@/types/node";
import {
  Layout,
  Server,
  Database,
  Zap,
  Layers,
  Code,
  Cpu,
  ExternalLink,
  HardDrive,
  Lock,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";

const TYPE_CONFIG: Record<
  ArchitectureNodeType,
  {
    icon: React.ElementType;
    borderColor: string;
    bgColor: string;
    badgeColor: string;
    accentGlow: string;
  }
> = {
  frontend: {
    icon: Layout,
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-950/30",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    accentGlow: "shadow-blue-500/10",
  },
  backend: {
    icon: Server,
    borderColor: "border-cyan-500/50",
    bgColor: "bg-cyan-950/30",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    accentGlow: "shadow-cyan-500/10",
  },
  database: {
    icon: Database,
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-950/30",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentGlow: "shadow-emerald-500/10",
  },
  cache: {
    icon: Zap,
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-950/30",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    accentGlow: "shadow-amber-500/10",
  },
  queue: {
    icon: Layers,
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-950/30",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    accentGlow: "shadow-purple-500/10",
  },
  api: {
    icon: Code,
    borderColor: "border-indigo-500/50",
    bgColor: "bg-indigo-950/30",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    accentGlow: "shadow-indigo-500/10",
  },
  service: {
    icon: Cpu,
    borderColor: "border-teal-500/50",
    bgColor: "bg-teal-950/30",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    accentGlow: "shadow-teal-500/10",
  },
  external: {
    icon: ExternalLink,
    borderColor: "border-rose-500/50",
    bgColor: "bg-rose-950/30",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    accentGlow: "shadow-rose-500/10",
  },
  storage: {
    icon: HardDrive,
    borderColor: "border-sky-500/50",
    bgColor: "bg-sky-950/30",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    accentGlow: "shadow-sky-500/10",
  },
  auth: {
    icon: Lock,
    borderColor: "border-violet-500/50",
    bgColor: "bg-violet-950/30",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    accentGlow: "shadow-violet-500/10",
  },
  "load-balancer": {
    icon: Network,
    borderColor: "border-orange-500/50",
    bgColor: "bg-orange-950/30",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    accentGlow: "shadow-orange-500/10",
  },
  gateway: {
    icon: ShieldCheck,
    borderColor: "border-cyan-400/60",
    bgColor: "bg-cyan-950/40",
    badgeColor: "bg-cyan-400/10 text-cyan-300 border-cyan-400/40",
    accentGlow: "shadow-cyan-400/20",
  },
};

export const ArchitectureNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = TYPE_CONFIG[nodeData.type] || TYPE_CONFIG.service;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative group min-w-[230px] rounded-xl border backdrop-blur-md transition-all duration-200 p-3.5 shadow-xl",
        config.bgColor,
        config.borderColor,
        config.accentGlow,
        selected
          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#050816] border-cyan-400 scale-[1.02]"
          : "hover:border-slate-400/40 hover:shadow-2xl"
      )}
    >
      {/* Input Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-[#050816] transition-transform group-hover:scale-125"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg border", config.badgeColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
            {nodeData.type}
          </span>
        </div>

        {/* Status Indicator */}
        {nodeData.status && (
          <div className="flex items-center gap-1">
            {nodeData.status === "healthy" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {nodeData.status === "warning" && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            {nodeData.status === "error" && (
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
        )}
      </div>

      {/* Main Title & Technology */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">
          {nodeData.label}
        </h3>
        <p className="text-[11px] font-mono text-cyan-300/80 font-medium">
          {nodeData.technology}
        </p>
      </div>

      {/* Description */}
      {nodeData.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
          {nodeData.description}
        </p>
      )}

      {/* Footer Layer Tag */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
        <span className="font-mono">{nodeData.layer}</span>
      </div>

      {/* Output Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-[#050816] transition-transform group-hover:scale-125"
      />
    </div>
  );
});

ArchitectureNodeComponent.displayName = "ArchitectureNodeComponent";
