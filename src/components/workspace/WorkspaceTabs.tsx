"use client";

import React from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { Sliders, Activity, Database, Code2, Box, FolderGit2 } from "lucide-react";
import { NodeInspector } from "./NodeInspector";
import { AnalysisTab } from "./tabs/AnalysisTab";
import { SchemaTab } from "./tabs/SchemaTab";
import { ApiTab } from "./tabs/ApiTab";
import { DockerTab } from "./tabs/DockerTab";
import { StructureTab } from "./tabs/StructureTab";

export function WorkspaceTabs() {
  const { activeTab, setActiveTab, selectedNodeId } = useArchitectureStore();

  const tabs = [
    { id: "inspector", label: "Node Inspector", icon: Sliders },
    { id: "analysis", label: "Health & Analysis", icon: Activity },
    { id: "schema", label: "DB Schema", icon: Database },
    { id: "api", label: "API Spec", icon: Code2 },
    { id: "docker", label: "Docker Compose", icon: Box },
    { id: "structure", label: "Folder Tree", icon: FolderGit2 },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-[#0B1120] border-t border-slate-800 font-sans text-slate-100">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-1 px-4 pt-2 bg-[#050816] border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-t border-x ${
                isActive
                  ? "bg-[#0B1120] border-slate-800 text-cyan-300 border-b-transparent"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.id === "inspector" && selectedNodeId && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "inspector" && <NodeInspector />}
        {activeTab === "analysis" && <AnalysisTab />}
        {activeTab === "schema" && <SchemaTab />}
        {activeTab === "api" && <ApiTab />}
        {activeTab === "docker" && <DockerTab />}
        {activeTab === "structure" && <StructureTab />}
      </div>
    </div>
  );
}
