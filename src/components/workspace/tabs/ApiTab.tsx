"use client";

import React, { useState } from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { Code2, Copy, Check } from "lucide-react";
import { HttpMethod } from "@/types/api";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  PATCH: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

export function ApiTab() {
  const { currentArchitecture } = useArchitectureStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!currentArchitecture || !currentArchitecture.apiSpecification || !currentArchitecture.apiSpecification.endpoints || currentArchitecture.apiSpecification.endpoints.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No REST API specifications available for this project yet.
      </div>
    );
  }

  const { apiSpecification } = currentArchitecture;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 bg-[#0B1120] text-slate-100 font-sans space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            {apiSpecification.title} ({apiSpecification.version})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Generated REST API endpoints specification and payload contracts.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {apiSpecification.endpoints.map((ep) => (
          <div
            key={ep.id}
            className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-extrabold border ${
                    METHOD_COLORS[ep.method]
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-bold text-slate-100">
                  {ep.path}
                </span>
              </div>
              {ep.tags && (
                <div className="flex items-center gap-1">
                  {ep.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 mb-3">{ep.summary}</p>

            {/* Request Body & Response Example */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              {ep.requestBody && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
                    Request Payload Example:
                  </span>
                  <div className="relative group">
                    <pre className="p-3 rounded-lg bg-[#0B1120] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                      {ep.requestBody}
                    </pre>
                    <button
                      onClick={() => handleCopy(ep.requestBody!, `req-${ep.id}`)}
                      className="absolute top-2 right-2 p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === `req-${ep.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {ep.responseExample && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
                    Response Payload Example (200 OK):
                  </span>
                  <div className="relative group">
                    <pre className="p-3 rounded-lg bg-[#0B1120] border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                      {ep.responseExample}
                    </pre>
                    <button
                      onClick={() => handleCopy(ep.responseExample!, `res-${ep.id}`)}
                      className="absolute top-2 right-2 p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === `res-${ep.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
