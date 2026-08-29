"use client";

import React from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export function AnalysisTab() {
  const { currentArchitecture } = useArchitectureStore();

  if (!currentArchitecture || !currentArchitecture.analysis) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No health metrics or analysis available yet. Generate an architecture to analyze system health.
      </div>
    );
  }

  const { analysis } = currentArchitecture;

  return (
    <div className="p-5 bg-[#0B1120] text-slate-100 font-sans space-y-6 h-full overflow-y-auto">
      {/* Top Banner: Score Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-cyan-500/30 bg-[#0F172A] shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20">
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">
              {analysis.overallScore}
            </span>
            <span className="text-[10px] text-slate-400 absolute bottom-2">/100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Architecture Health Score
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                HEALTHY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated across Security, Scalability, Performance, Reliability, and Maintainability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-slate-500 font-mono text-[10px] block">TOTAL NODES</span>
            <span className="text-base font-bold text-slate-200 font-mono">{currentArchitecture.nodes.length}</span>
          </div>
          <div>
            <span className="text-slate-500 font-mono text-[10px] block">LAYERS</span>
            <span className="text-base font-bold text-cyan-400 font-mono">{currentArchitecture.metadata?.layerCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Chart & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recharts Bar Chart */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] flex flex-col justify-between">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-3">
            Metric Category Scores
          </h4>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.categoryScores} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0B1120", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#06B6D4" }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {analysis.categoryScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Architectural Insights & Recommendations
          </h4>
          {analysis.insights.length === 0 ? (
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] text-xs text-slate-500 font-mono">
              No architectural warnings or bottlenecks detected.
            </div>
          ) : (
            analysis.insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3.5 rounded-xl border ${
                  insight.type === "success"
                    ? "border-emerald-500/30 bg-emerald-950/20"
                    : insight.type === "warning"
                    ? "border-amber-500/30 bg-amber-950/20"
                    : "border-rose-500/30 bg-rose-950/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {insight.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {insight.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <h5 className="text-xs font-semibold text-slate-200">{insight.title}</h5>
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {insight.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1">{insight.description}</p>
                {insight.recommendation && (
                  <div className="text-[11px] text-cyan-300 font-mono pt-1.5 border-t border-slate-800/80">
                    💡 Recommendation: {insight.recommendation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
