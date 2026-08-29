"use client";

import React, { useState, useEffect } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/useToast";
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant } from "@xyflow/react";
import { ArchitectureNodeComponent } from "@/components/workspace/custom-nodes/ArchitectureNodeComponent";
import { Architecture } from "@/types/architecture";
import {
  FolderGit2,
  Search,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  User,
} from "lucide-react";

interface AdminProjectItem {
  id: string;
  userId: string;
  ownerUsername: string;
  ownerEmail: string;
  name: string;
  description: string;
  techStack: string[];
  architecture: Architecture;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

const nodeTypes = {
  frontend: ArchitectureNodeComponent,
  backend: ArchitectureNodeComponent,
  database: ArchitectureNodeComponent,
  cache: ArchitectureNodeComponent,
  queue: ArchitectureNodeComponent,
  api: ArchitectureNodeComponent,
  service: ArchitectureNodeComponent,
  external: ArchitectureNodeComponent,
  storage: ArchitectureNodeComponent,
  auth: ArchitectureNodeComponent,
  "load-balancer": ArchitectureNodeComponent,
  gateway: ArchitectureNodeComponent,
};

function AdminProjectsContent() {
  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingArchitectureProject, setViewingArchitectureProject] = useState<AdminProjectItem | null>(null);
  const [deletingProject, setDeletingProject] = useState<AdminProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { adminSession } = useAdminAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();

  const fetchProjects = async (queryStr = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/projects?q=${encodeURIComponent(queryStr)}`, {
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      } else {
        toastError(data.error || "Failed to fetch projects.");
      }
    } catch {
      toastError("Unable to load global projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.access_token) {
      const timer = setTimeout(() => {
        fetchProjects(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, adminSession]);

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects/${deletingProject.id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminSession?.access_token || ""}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toastInfo(`Project "${deletingProject.name}" deleted.`);
        setDeletingProject(null);
        fetchProjects(search);
      } else {
        toastError(data.error || "Failed to delete project.");
      }
    } catch {
      toastError("Unable to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Global Projects Explorer
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Inspect user architectures in read-only mode, view project owners, and manage database records.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-[#090D1A] px-3 py-1.5 rounded-xl border border-slate-800">
            Total Projects: <strong className="text-cyan-300">{projects.length}</strong>
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by name..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#090D1A] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 font-mono">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400">Fetching global projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No projects matching search filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-800 bg-[#090D1A] p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-bold truncate max-w-[140px]">{project.ownerUsername}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                      {project.nodeCount} Components
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-cyan-300 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-500">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingArchitectureProject(project)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-rose-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Read-Only Architecture Inspection Modal */}
        {viewingArchitectureProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-5xl h-[85vh] bg-[#050816] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-[#090D1A] border-b border-slate-800 flex items-center justify-between shrink-0 font-sans">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      READ-ONLY ARCHITECTURE VIEWER
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {viewingArchitectureProject.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Owner: {viewingArchitectureProject.ownerUsername} ({viewingArchitectureProject.ownerEmail})
                  </p>
                </div>
                <button
                  onClick={() => setViewingArchitectureProject(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* React Flow Read-Only Canvas */}
              <div className="flex-1 relative bg-[#050816]">
                <ReactFlow
                  nodes={viewingArchitectureProject.architecture?.nodes || []}
                  edges={viewingArchitectureProject.architecture?.edges || []}
                  nodeTypes={nodeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={true}
                  className="bg-[#050816]"
                >
                  <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
                  <Controls className="!bottom-4 !left-4" />
                  <MiniMap
                    nodeColor={() => "#06b6d4"}
                    maskColor="rgba(5, 8, 22, 0.7)"
                    className="!bottom-4 !right-4 rounded-xl border border-slate-800"
                  />
                </ReactFlow>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 bg-[#090D1A] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Project?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This project belongs to{" "}
                  <span className="text-cyan-300 font-semibold font-mono">
                    {deletingProject.ownerUsername}
                  </span>
                  . Delete <span className="text-slate-200 font-semibold">&quot;{deletingProject.name}&quot;</span>?
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeletingProject(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminProjectsPage() {
  return (
    <AdminGuard>
      <AdminProjectsContent />
    </AdminGuard>
  );
}
