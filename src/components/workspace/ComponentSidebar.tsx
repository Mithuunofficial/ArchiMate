"use client";

import React, { useState } from "react";
import { X, Search, Plus, Layers } from "lucide-react";
import { ArchitectureNodeType, ArchitectureLayer } from "@/types/node";
import { useArchitectureStore } from "@/hooks/useArchitecture";
import { useToast } from "@/hooks/useToast";

interface ComponentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ComponentPreset {
  name: string;
  type: ArchitectureNodeType;
  technology: string;
  layer: ArchitectureLayer;
  description: string;
  category: "Application" | "Data" | "Infrastructure" | "External Services";
}

const PALETTE_COMPONENTS: ComponentPreset[] = [
  // Application
  {
    name: "React Frontend",
    type: "frontend",
    technology: "React 18",
    layer: "Presentation",
    description: "Client-side SPA web application.",
    category: "Application",
  },
  {
    name: "Next.js App Router",
    type: "frontend",
    technology: "Next.js 14",
    layer: "Presentation",
    description: "Full-stack SSR web framework.",
    category: "Application",
  },
  {
    name: "Node.js REST API",
    type: "backend",
    technology: "Node.js + Express",
    layer: "Application",
    description: "Backend HTTP REST service.",
    category: "Application",
  },
  {
    name: "Python FastAPI Service",
    type: "backend",
    technology: "Python 3.11",
    layer: "Application",
    description: "High-performance async API.",
    category: "Application",
  },
  {
    name: "Microservice Worker",
    type: "service",
    technology: "Go (Golang)",
    layer: "Business",
    description: "Lightweight background processing service.",
    category: "Application",
  },

  // Data
  {
    name: "PostgreSQL Database",
    type: "database",
    technology: "PostgreSQL 16",
    layer: "Data",
    description: "Relational ACID database engine.",
    category: "Data",
  },
  {
    name: "MongoDB NoSQL",
    type: "database",
    technology: "MongoDB 7.0",
    layer: "Data",
    description: "Document-oriented NoSQL database.",
    category: "Data",
  },
  {
    name: "Redis In-Memory Cache",
    type: "cache",
    technology: "Redis 7.2",
    layer: "Data",
    description: "Ultra-fast key-value memory store.",
    category: "Data",
  },
  {
    name: "AWS S3 Bucket",
    type: "storage",
    technology: "AWS S3",
    layer: "Data",
    description: "Scalable object file storage.",
    category: "Data",
  },
  {
    name: "RabbitMQ Message Queue",
    type: "queue",
    technology: "RabbitMQ 3.12",
    layer: "Infrastructure",
    description: "AMQP async message queue broker.",
    category: "Data",
  },

  // Infrastructure
  {
    name: "Nginx API Gateway",
    type: "gateway",
    technology: "Nginx Alpine",
    layer: "Application",
    description: "Reverse proxy and rate limiting gateway.",
    category: "Infrastructure",
  },
  {
    name: "HAProxy Load Balancer",
    type: "load-balancer",
    technology: "HAProxy",
    layer: "Infrastructure",
    description: "Layer 7 traffic load distributor.",
    category: "Infrastructure",
  },
  {
    name: "Docker Container",
    type: "service",
    technology: "Docker",
    layer: "Infrastructure",
    description: "Isolated application container runtime.",
    category: "Infrastructure",
  },
  {
    name: "Auth0 / JWT Auth",
    type: "auth",
    technology: "OAuth2 / JWT",
    layer: "Business",
    description: "Identity and session authentication service.",
    category: "Infrastructure",
  },

  // External Services
  {
    name: "Stripe Billing API",
    type: "external",
    technology: "Stripe SDK",
    layer: "External Services",
    description: "Third-party payment checkout engine.",
    category: "External Services",
  },
  {
    name: "Google Maps API",
    type: "external",
    technology: "Google Cloud",
    layer: "External Services",
    description: "Geospatial mapping and route calculation.",
    category: "External Services",
  },
  {
    name: "SendGrid Mailer",
    type: "external",
    technology: "SendGrid REST",
    layer: "External Services",
    description: "Transactional email delivery service.",
    category: "External Services",
  },
];

export function ComponentSidebar({ isOpen, onClose }: ComponentSidebarProps) {
  const [search, setSearch] = useState("");
  const { addNode, currentArchitecture } = useArchitectureStore();
  const { toastSuccess } = useToast();

  if (!isOpen) return null;

  const categories: ("Application" | "Data" | "Infrastructure" | "External Services")[] = [
    "Application",
    "Data",
    "Infrastructure",
    "External Services",
  ];

  const handleAddComponent = (preset: ComponentPreset) => {
    const id = `node-${Date.now()}`;
    // Position near center with slight offset
    const randomOffset = Math.floor(Math.random() * 60) - 30;
    addNode({
      id,
      type: preset.type,
      position: { x: 300 + randomOffset, y: 200 + randomOffset },
      data: {
        label: preset.name,
        type: preset.type,
        technology: preset.technology,
        description: preset.description,
        layer: preset.layer,
        status: "healthy",
      },
    });
    toastSuccess(`Added "${preset.name}" to architecture canvas`);
  };

  const filtered = PALETTE_COMPONENTS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.technology.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-[#0B1120] border-l border-slate-800 shadow-2xl flex flex-col font-sans text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Component Palette
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search component or tech..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => {
          const items = filtered.filter((i) => i.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat}>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                {cat}
              </h4>
              <div className="space-y-1.5">
                {items.map((preset) => (
                  <div
                    key={preset.name}
                    onClick={() => handleAddComponent(preset)}
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-slate-800/80 hover:border-slate-700 cursor-pointer transition-all duration-150"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">
                        {preset.technology}
                      </span>
                    </div>
                    <button
                      className="p-1 rounded-md bg-slate-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-400 transition-colors"
                      title="Add to Canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
