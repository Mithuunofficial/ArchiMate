"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_TEMPLATES } from "@/mocks/templates.mock";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { Layers, ArrowRight, Filter, X, Lock, LogIn, UserPlus } from "lucide-react";
import { Template } from "@/types/template";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");

  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const { isAuthenticated } = useAuth();

  const categories = ["All", "E-Commerce", "SaaS", "AI/ML", "Real-Time", "FinTech"];

  const handleOpenTemplateModal = (template: Template) => {
    if (!isAuthenticated) {
      setSelectedTemplate(template);
      setShowAuthModal(true);
      return;
    }
    setSelectedTemplate(template);
    setShowAuthModal(false);
    setProjName(`My ${template.name}`);
    setProjDesc(template.description);
  };

  const handleCreateFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !projName.trim()) return;

    try {
      // Deep copy template architecture with user project name
      const copiedArch = JSON.parse(JSON.stringify(selectedTemplate.architecture));
      copiedArch.name = projName.trim();
      copiedArch.description = projDesc.trim();

      const created = await projectService.createProject(projName.trim(), projDesc.trim(), copiedArch);
      if (created) {
        toastSuccess(`Created project "${created.name}" from ${selectedTemplate.name} template!`);
        setSelectedTemplate(null);
        router.push(`/workspace?project=${created.id}`);
      }
    } catch (err: any) {
      toastError(err?.message || "Failed to create project from template.");
    }
  };

  const filteredTemplates =
    selectedCategory === "All"
      ? MOCK_TEMPLATES
      : MOCK_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 font-sans p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Architecture Templates Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Production-grade reference architectures designed for modern cloud and microservice systems.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap bg-[#0B1120] p-1.5 rounded-xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                  {template.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {template.componentsCount} Components
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {template.description}
              </p>

              {/* Node Topology Preview Pills */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-slate-500 block mb-1.5 uppercase">
                  Topology Preview:
                </span>
                <div className="flex flex-wrap gap-1">
                  {template.previewNodes.map((node) => (
                    <span
                      key={node}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="mb-6 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {template.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => handleOpenTemplateModal(template)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
            >
              <span>Use Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Unauthenticated Login Prompt Modal */}
      {selectedTemplate && showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Login Required</h3>
              <p className="text-xs text-slate-400">
                Create an account or sign in to use the <span className="text-cyan-300 font-semibold">{selectedTemplate.name}</span> architecture template.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setSelectedTemplate(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setSelectedTemplate(null)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Link>
            </div>

            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors pt-2 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Authenticated Create Project From Template Modal */}
      {selectedTemplate && !showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Create Project From Template</h3>
                <span className="text-[10px] font-mono text-cyan-400">
                  Template: {selectedTemplate.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFromTemplate} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Project Name"
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projName.trim()}
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
