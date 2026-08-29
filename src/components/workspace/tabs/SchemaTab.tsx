"use client";

import React from "react";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { Database, Key, Link2 } from "lucide-react";

export function SchemaTab() {
  const { currentArchitecture } = useArchitectureStore();

  if (!currentArchitecture || !currentArchitecture.databaseSchema || !currentArchitecture.databaseSchema.tables || currentArchitecture.databaseSchema.tables.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No database schema generated for this project yet.
      </div>
    );
  }

  const { databaseSchema } = currentArchitecture;

  return (
    <div className="p-5 bg-[#0B1120] text-slate-100 font-sans space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Generated Relational Database Schema
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-derived table structures, primary keys, and foreign key relationships.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
          {databaseSchema.tables.length} Tables
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {databaseSchema.tables.map((table) => (
          <div
            key={table.id}
            className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden flex flex-col shadow-lg"
          >
            {/* Table Header */}
            <div className="p-3 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {table.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {table.columns.length} cols
              </span>
            </div>

            {table.description && (
              <p className="px-3 pt-2 text-[11px] text-slate-400 italic leading-snug">
                {table.description}
              </p>
            )}

            {/* Column Table */}
            <div className="p-3 flex-1">
              <div className="space-y-1.5 font-mono text-xs">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between py-1 border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.isPrimary && (
                        <span title="Primary Key">
                          <Key className="w-3 h-3 text-amber-400 shrink-0" />
                        </span>
                      )}
                      {col.isForeign && (
                        <span title="Foreign Key">
                          <Link2 className="w-3 h-3 text-cyan-400 shrink-0" />
                        </span>
                      )}
                      <span
                        className={`text-xs ${
                          col.isPrimary
                            ? "font-bold text-amber-300"
                            : col.isForeign
                            ? "text-cyan-300"
                            : "text-slate-300"
                        }`}
                      >
                        {col.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {col.type}
                      </span>
                      {col.references && (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800"
                          title={`References ${col.references}`}
                        >
                          → {col.references}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
