"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { ArchitectureNodeComponent } from "@/components/workspace/custom-nodes/ArchitectureNodeComponent";
import { CanvasToolbar } from "@/components/workspace/CanvasToolbar";
import { RequirementPanel } from "@/components/workspace/RequirementPanel";
import { ComponentSidebar } from "@/components/workspace/ComponentSidebar";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { GenerationModal } from "@/components/workspace/GenerationModal";
import { ExportMenu } from "@/components/workspace/ExportMenu";
import { architectureService, GenerationStep } from "@/services/architecture.service";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/useToast";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  Download,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";

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

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project");

  const [currentProject, setCurrentProject] = useState<Project | null | "not_found">(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  const {
    currentArchitecture,
    loadProjectArchitecture,
    setArchitecture,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    activeLayers,
    toggleLayer,
  } = useArchitectureStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [isComponentSidebarOpen, setIsComponentSidebarOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [projectName, setProjectName] = useState("");
  const { toastSuccess, toastError } = useToast();

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load project from Supabase PostgreSQL
  useEffect(() => {
    if (!projectId) {
      setCurrentProject(null);
      return;
    }

    let isMounted = true;
    projectService.getProjectById(projectId).then((proj) => {
      if (!isMounted) return;
      if (!proj) {
        setCurrentProject("not_found");
      } else {
        setCurrentProject(proj);
        setProjectName(proj.name);
        loadProjectArchitecture(proj.id, proj.architecture);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [projectId, loadProjectArchitecture]);

  // Debounced Auto-Save to Supabase PostgreSQL
  const triggerAutoSave = useCallback(
    (archToSave: typeof currentArchitecture, nameToSave: string) => {
      if (!projectId || !archToSave) return;
      setSaveStatus("saving");

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          await projectService.updateProject(projectId, {
            name: nameToSave,
            architecture: archToSave,
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2500);
        } catch {
          setSaveStatus("idle");
        }
      }, 1200);
    },
    [projectId]
  );

  // Listen to architecture changes for auto-save trigger
  useEffect(() => {
    if (currentArchitecture && currentProject && currentProject !== "not_found") {
      triggerAutoSave(currentArchitecture, projectName || currentProject.name);
    }
  }, [currentArchitecture, projectName]);

  const handleGenerate = async (prompt: string) => {
    if (!currentProject || currentProject === "not_found" || !currentArchitecture) return;

    setIsGenerating(true);
    try {
      const generatedArch = await architectureService.generateArchitecture(
        prompt,
        (steps) => setGenerationSteps(steps)
      );

      setArchitecture(generatedArch);
      await projectService.updateProject(currentProject.id, {
        name: projectName || generatedArch.name,
        architecture: generatedArch,
      });

      setSaveStatus("saved");
      toastSuccess("Architecture generated and saved to project!");
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      toastError("Failed to generate architecture.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject || currentProject === "not_found" || !currentArchitecture) return;
    setSaveStatus("saving");
    try {
      await projectService.updateProject(currentProject.id, {
        name: projectName,
        architecture: currentArchitecture,
      });
      setSaveStatus("saved");
      toastSuccess(`Project "${projectName}" updated successfully!`);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("idle");
      toastError("Failed to save project updates.");
    }
  };

  const handleCreateNewProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      const created = await projectService.createProject(newProjName.trim(), newProjDesc.trim());
      if (created) {
        setIsNewProjectModalOpen(false);
        setNewProjName("");
        setNewProjDesc("");
        toastSuccess(`Project "${created.name}" created!`);
        router.push(`/workspace?project=${created.id}`);
      }
    } catch (err: any) {
      toastError(err?.message || "Unable to create project.");
    }
  };

  // State 1: No project selected in URL
  if (!projectId) {
    return (
      <div className="flex-1 bg-[#050816] flex items-center justify-center p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-800 bg-[#0F172A] text-center shadow-2xl space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a new project or select an existing project from your dashboard to start designing software architecture.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>

            <button
              onClick={() => router.push("/projects")}
              className="w-full py-3 px-4 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors"
            >
              <span>Explore Projects Dashboard</span>
            </button>
          </div>
        </div>

        {/* Modal */}
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left">
            <div className="w-full max-w-md p-6 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200">Create New Project</h3>
                <button
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProjectSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="e.g. My Architecture Engine"
                    autoFocus
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Brief description of application requirements..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewProjectModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjName.trim()}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 disabled:opacity-50"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // State 2: Invalid Project ID
  if (currentProject === "not_found") {
    return (
      <div className="flex-1 bg-[#050816] flex items-center justify-center p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border border-rose-500/30 bg-[#0F172A] text-center shadow-2xl space-y-6">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-fit mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The project ID specified in the URL does not exist or has been deleted from your Supabase account.
            </p>
          </div>

          <button
            onClick={() => router.push("/projects")}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentArchitecture) return null;

  // Filter nodes based on active layer toggles
  const visibleNodes = currentArchitecture.nodes.filter((node) => {
    const layer = node.data?.layer;
    if (!layer) return true;
    return activeLayers.includes(layer);
  });

  const layerOptions = [
    "Presentation",
    "Application",
    "Business",
    "Data",
    "Infrastructure",
    "External Services",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#050816] font-sans text-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-12 px-4 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/projects")}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200"
            title="Toggle Requirement Panel"
          >
            {isLeftPanelOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleSaveProject}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:border-b focus:border-cyan-400 px-1 font-sans"
          />

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hidden sm:inline">
            {currentArchitecture.nodes.length} Nodes • {currentArchitecture.edges.length} Connections
          </span>

          {/* Auto-Save Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] pl-2 border-l border-slate-800">
            {saveStatus === "saving" && (
              <span className="text-cyan-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Layer Filter Toggles */}
          <div className="hidden lg:flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800 mr-2">
            <span className="text-[10px] font-mono text-slate-400 px-1">Layers:</span>
            {layerOptions.map((layer) => {
              const isActive = activeLayers.includes(layer);
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {layer.slice(0, 4)}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveProject}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => setIsExportMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main IDE Workspace Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer: Requirement Input Panel */}
        {isLeftPanelOpen && (
          <div className="w-80 shrink-0 z-10">
            <RequirementPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
        )}

        {/* Center: React Flow Canvas */}
        <div id="react-flow-wrapper" className="flex-1 h-full relative bg-[#050816]">
          <CanvasToolbar
            onOpenComponentSidebar={() => setIsComponentSidebarOpen(true)}
          />

          {currentArchitecture.nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-0">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mb-3 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">
                Start designing your architecture
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Describe your application requirements in the left panel to generate your software topology, or add components manually.
              </p>
            </div>
          ) : null}

          <ReactFlow
            nodes={visibleNodes}
            edges={currentArchitecture.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
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

      {/* Bottom Inspector & Multi-Tab Specs Panel */}
      <div className="h-72 shrink-0 z-20">
        <WorkspaceTabs />
      </div>

      {/* Modals & Overlays */}
      <GenerationModal isOpen={isGenerating} steps={generationSteps} />
      <ComponentSidebar
        isOpen={isComponentSidebarOpen}
        onClose={() => setIsComponentSidebarOpen(false)}
      />
      <ExportMenu
        isOpen={isExportMenuOpen}
        onClose={() => setIsExportMenuOpen(false)}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-xs">Loading Workspace...</div>}>
        <ReactFlowProvider>
          <WorkspaceContent />
        </ReactFlowProvider>
      </Suspense>
    </AuthGuard>
  );
}
