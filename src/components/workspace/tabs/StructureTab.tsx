"use client";

import React, { useState } from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, FolderGit2 } from "lucide-react";
import { DirectoryNode } from "@/types/architecture";

interface TreeNodeProps {
  node: DirectoryNode;
  depth?: number;
}

function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isDir = node.type === "directory";

  return (
    <div className="font-mono text-xs select-none">
      <div
        onClick={() => isDir && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-1 px-2 rounded-md hover:bg-slate-800/80 cursor-pointer transition-colors ${
          isDir ? "text-slate-200 font-semibold" : "text-slate-400"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 shrink-0" />
            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
          </>
        )}
        <span>{node.name}</span>
      </div>

      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function StructureTab() {
  const { currentArchitecture } = useArchitectureStore();

  if (!currentArchitecture || !currentArchitecture.projectStructure) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No project directory tree generated yet.
      </div>
    );
  }

  const { projectStructure } = currentArchitecture;

  return (
    <div className="p-5 bg-[#0B1120] text-slate-100 font-sans space-y-4 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-amber-400" />
          Recommended Project Directory Tree
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Clean modular repository layout reflecting microservices, frontend, and database layers.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-xl">
        <TreeNode node={projectStructure} />
      </div>
    </div>
  );
}
