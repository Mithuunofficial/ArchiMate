"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GenerationStep } from "@/services/architecture.service";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface GenerationModalProps {
  isOpen: boolean;
  steps: GenerationStep[];
}

export function GenerationModal({ isOpen, steps }: GenerationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg p-6 bg-[#0B1120] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                ArchiMate AI Engine
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Transforming requirements into visual software topology...
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3.5 mb-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-[#0F172A]/80"
              >
                <div className="flex items-center gap-3">
                  {step.status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {step.status === "in-progress" && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  )}
                  {step.status === "pending" && (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      step.status === "completed"
                        ? "text-slate-200"
                        : step.status === "in-progress"
                        ? "text-cyan-300 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-500">
                  {step.status === "completed"
                    ? "DONE"
                    : step.status === "in-progress"
                    ? "RUNNING"
                    : "QUEUED"}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${
                  (steps.filter((s) => s.status === "completed").length /
                    steps.length) *
                  100
                }%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
