export type ArchitectureNodeType =
  | "frontend"
  | "backend"
  | "database"
  | "cache"
  | "queue"
  | "api"
  | "service"
  | "external"
  | "storage"
  | "auth"
  | "load-balancer"
  | "gateway";

export type ArchitectureLayer =
  | "Presentation"
  | "Application"
  | "Business"
  | "Data"
  | "Infrastructure"
  | "External Services";

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: ArchitectureNodeType;
  technology: string;
  description: string;
  layer: ArchitectureLayer;
  status?: "healthy" | "warning" | "error" | "active";
  iconName?: string;
  metrics?: {
    latency?: string;
    throughput?: string;
    uptime?: string;
  };
}
