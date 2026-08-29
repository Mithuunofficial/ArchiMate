import { Architecture } from "@/types/architecture";

export const SAAS_MOCK_ARCHITECTURE: Architecture = {
  id: "arch-saas-002",
  name: "SaaS Multi-Tenant Cloud Architecture",
  description: "Enterprise SaaS platform with API Gateway, Tenant Isolation Service, PostgreSQL Multi-tenant database, Redis Rate-Limiter, AWS S3 file storage, and SendGrid/Stripe integrations.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    promptUsed: "Design a multi-tenant SaaS platform with Next.js dashboard, API Gateway, Tenant service, PostgreSQL DB, Redis cache, S3 file storage, and subscription billing.",
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "Redis", "AWS S3", "Docker", "SendGrid", "Stripe"],
    estimatedCost: "$280 / month",
    layerCount: 5,
  },
  nodes: [
    {
      id: "saas-1",
      type: "frontend",
      position: { x: 260, y: 40 },
      data: {
        label: "Next.js Admin Dashboard",
        type: "frontend",
        technology: "Next.js 14 App Router",
        description: "Multi-tenant tenant management console & analytics UI.",
        layer: "Presentation",
        status: "healthy",
        iconName: "Layout",
      },
    },
    {
      id: "saas-2",
      type: "gateway",
      position: { x: 260, y: 170 },
      data: {
        label: "Kong API Gateway",
        type: "gateway",
        technology: "Kong Enterprise",
        description: "Enforces tenant authentication, JWT validation, and API quota limits.",
        layer: "Application",
        status: "healthy",
        iconName: "ShieldCheck",
      },
    },
    {
      id: "saas-3",
      type: "service",
      position: { x: 80, y: 300 },
      data: {
        label: "Tenant Auth & License Service",
        type: "service",
        technology: "Go (Golang)",
        description: "Validates tenant isolation headers, workspace permissions, and user roles.",
        layer: "Business",
        status: "healthy",
        iconName: "Lock",
      },
    },
    {
      id: "saas-4",
      type: "backend",
      position: { x: 260, y: 300 },
      data: {
        label: "Core SaaS API Service",
        type: "backend",
        technology: "Python FastAPI",
        description: "Processes SaaS workspace data, automated reports, and team collaboration events.",
        layer: "Business",
        status: "healthy",
        iconName: "Server",
      },
    },
    {
      id: "saas-5",
      type: "storage",
      position: { x: 480, y: 300 },
      data: {
        label: "AWS S3 Object Storage",
        type: "storage",
        technology: "AWS S3 Bucket",
        description: "Stores customer uploaded documents, exports, avatar assets, and audit logs.",
        layer: "Data",
        status: "healthy",
        iconName: "HardDrive",
      },
    },
    {
      id: "saas-6",
      type: "cache",
      position: { x: 120, y: 440 },
      data: {
        label: "Redis Tenant Quota Cache",
        type: "cache",
        technology: "Redis Cluster",
        description: "Tracks active tenant rate limits and in-memory feature flag toggles.",
        layer: "Data",
        status: "healthy",
        iconName: "Zap",
      },
    },
    {
      id: "saas-7",
      type: "database",
      position: { x: 260, y: 440 },
      data: {
        label: "PostgreSQL (Row-Level Security)",
        type: "database",
        technology: "PostgreSQL 16",
        description: "Multi-tenant database with strict Row-Level Security (RLS) tenant_id policies.",
        layer: "Data",
        status: "healthy",
        iconName: "Database",
      },
    },
  ],
  edges: [
    { id: "e-s1", source: "saas-1", target: "saas-2", animated: true, label: "HTTPS / REST" },
    { id: "e-s2", source: "saas-2", target: "saas-3", animated: true, label: "Tenant Context check" },
    { id: "e-s3", source: "saas-2", target: "saas-4", animated: true, label: "Routed Requests" },
    { id: "e-s4", source: "saas-4", target: "saas-5", animated: false, label: "Pre-signed URLs" },
    { id: "e-s5", source: "saas-4", target: "saas-6", animated: true, label: "Quota Verification" },
    { id: "e-s6", source: "saas-4", target: "saas-7", animated: true, label: "SQL RLS Queries" },
  ],
  databaseSchema: {
    tables: [
      {
        id: "t-tenant",
        name: "tenants",
        description: "SaaS organizations/companies using the application.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "slug", type: "VARCHAR(50)", nullable: false },
          { name: "company_name", type: "VARCHAR(150)" },
          { name: "subscription_tier", type: "VARCHAR(50)" },
        ],
      },
      {
        id: "t-user",
        name: "tenant_users",
        description: "Users affiliated with a specific tenant.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "tenant_id", type: "UUID", isForeign: true, references: "tenants.id" },
          { name: "email", type: "VARCHAR(255)" },
          { name: "role", type: "VARCHAR(50)" },
        ],
      },
    ],
  },
  apiSpecification: {
    title: "SaaS Multi-tenant REST API",
    version: "v2.1.0",
    endpoints: [
      {
        id: "saas-api-1",
        method: "GET",
        path: "/api/v1/tenant/metrics",
        summary: "Fetch usage metrics and bandwidth for the current tenant.",
        responseExample: '{\n  "tenantId": "org_98123",\n  "activeUsers": 48,\n  "storageUsedMb": 10240,\n  "monthlyQuotaPercent": 42.5\n}',
      },
    ],
  },
  dockerCompose: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://saas:pass@postgres:5432/saas_db
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=saas_db
      - POSTGRES_USER=saas
      - POSTGRES_PASSWORD=pass`,
  projectStructure: {
    name: "saas-platform",
    type: "directory",
    children: [
      { name: "src/app", type: "directory" },
      { name: "src/services", type: "directory" },
      { name: "src/tenant", type: "directory" },
      { name: "docker-compose.yml", type: "file" },
    ],
  },
  analysis: {
    overallScore: 94,
    categoryScores: [
      { category: "Security", score: 96, color: "#22C55E" },
      { category: "Scalability", score: 95, color: "#22C55E" },
      { category: "Performance", score: 92, color: "#06B6D4" },
      { category: "Reliability", score: 91, color: "#2563EB" },
      { category: "Maintainability", score: 94, color: "#22C55E" },
    ],
    insights: [
      {
        id: "s-ins-1",
        type: "success",
        category: "Security",
        title: "Row-Level Security Active",
        description: "PostgreSQL policies enforce strict data isolation per tenant id automatically.",
      },
    ],
  },
};
