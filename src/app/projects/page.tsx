"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  FolderGit2,
  Plus,
  Search,
  Grid,
  List,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Copy,
  X,
  AlertTriangle,
  Sparkles,
  Loader2,
  FolderPlus,
} from "lucide-react";

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // New Project Form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { toastSuccess, toastInfo, toastError } = useToast();
  const { profile, user } = useAuth();

  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Architect";

  const refreshProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const fetched = await projectService.getProjects();
      setProjects(fetched);
    } catch (err: any) {
      toastError("Unable to load projects from Supabase.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleOpenProject = (project: Project) => {
    toastSuccess(`Opened "${project.name}"`);
    router.push(`/workspace?project=${project.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    const success = await projectService.deleteProject(deletingProject.id);
    if (success) {
      toastInfo(`Deleted project "${deletingProject.name}"`);
      await refreshProjects();
    } else {
      toastError("Failed to delete project.");
    }
    setDeletingProject(null);
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const duplicated = await projectService.duplicateProject(project.id);
      if (duplicated) {
        toastSuccess(`Duplicated "${project.name}"`);
        await refreshProjects();
      }
    } catch (err: any) {
      toastError("Failed to duplicate project.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const created = await projectService.createProject(newName.trim(), newDesc.trim());
      if (created) {
        setIsModalOpen(false);
        setNewName("");
        setNewDesc("");
        toastSuccess(`Project "${created.name}" created!`);
        router.push(`/workspace?project=${created.id}`);
      }
    } catch (err: any) {
      toastError(err?.message || "Failed to create project.");
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const architecturesCount = projects.filter(
    (p) => p.architecture && p.architecture.nodes && p.architecture.nodes.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 font-sans p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* User Dashboard Greeting Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#0F172A] to-[#0B1120] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AUTHENTICATED DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-cyan-400">{displayName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your Cloud Architecture Workspace & PostgreSQL Project Storage
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-[#050816]/70 p-3.5 rounded-2xl border border-slate-800 font-mono text-xs">
            <div className="text-center px-2 border-r border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Projects</span>
              <span className="text-lg font-bold text-cyan-300">{projects.length}</span>
            </div>
            <div className="text-center px-2 border-r border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Architectures</span>
              <span className="text-lg font-bold text-blue-300">{architecturesCount}</span>
            </div>
            <div className="text-center px-2">
              <span className="text-slate-400 text-[10px] block uppercase">Last Activity</span>
              <span className="text-xs font-semibold text-emerald-400">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0B1120] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[#0B1120] border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Project CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingProjects && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading your projects from Supabase...</p>
        </div>
      )}

      {/* Empty State Requirements */}
      {!isLoadingProjects && projects.length === 0 && (
        <div className="py-20 px-6 rounded-3xl border border-dashed border-slate-800 bg-[#0F172A]/40 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No projects yet</h3>
            <p className="text-xs text-slate-400">
              Create your first architecture project to generate multi-tier cloud topology.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      )}

      {/* Projects Grid View */}
      {!isLoadingProjects && projects.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono text-slate-400">
                      {project.nodeCount} Components
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicateProject(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-cyan-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {project.description || "No description provided."}
                </p>

                {/* Tech Stack Pills */}
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleOpenProject(project)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects List View */}
      {!isLoadingProjects && projects.length > 0 && viewMode === "list" && (
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A] overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{project.name}</h4>
                    <p className="text-xs text-slate-400">{project.description || "No description"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-500">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProject(project)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Create New Architecture Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. E-Commerce Microservices"
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief overview of application purpose..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || isCreating}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Project?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="text-slate-200 font-semibold">&quot;{deletingProject.name}&quot;</span>? This action cannot be undone.
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
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsContent />
    </AuthGuard>
  );
}
