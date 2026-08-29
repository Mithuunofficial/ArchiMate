import { Architecture } from "@/types/architecture";
import { ECOMMERCE_MOCK_ARCHITECTURE } from "./ecommerce.mock";
import { SAAS_MOCK_ARCHITECTURE } from "./saas.mock";

export const AI_APP_MOCK_ARCHITECTURE: Architecture = {
  id: "arch-ai-003",
  name: "AI / LLM Agent Architecture",
  description: "High-performance AI application architecture utilizing React client, FastAPI, Vector DB (Qdrant), Redis Memory, Celery Worker Nodes, and LLM Inference APIs.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    promptUsed: "Build an AI application with RAG vector search, LLM agent execution pipeline, and chat streaming.",
    technologies: ["React", "FastAPI", "Qdrant Vector DB", "Redis", "Celery", "OpenAI / Gemini", "Docker"],
    estimatedCost: "$310 / month",
    layerCount: 5,
  },
  nodes: [
    {
      id: "ai-1",
      type: "frontend",
      position: { x: 260, y: 50 },
      data: {
        label: "Chat & Playground UI",
        type: "frontend",
        technology: "React + Tailwind",
        description: "Streaming LLM chat interface with Markdown and Code syntax rendering.",
        layer: "Presentation",
        status: "healthy",
        iconName: "MessageSquare",
      },
    },
    {
      id: "ai-2",
      type: "gateway",
      position: { x: 260, y: 180 },
      data: {
        label: "FastAPI Gateway",
        type: "gateway",
        technology: "Python FastAPI",
        description: "Handles Server-Sent Events (SSE) streams and API key validation.",
        layer: "Application",
        status: "healthy",
        iconName: "Zap",
      },
    },
    {
      id: "ai-3",
      type: "backend",
      position: { x: 260, y: 310 },
      data: {
        label: "RAG & Agent Orchestrator",
        type: "backend",
        technology: "LangChain / LlamaIndex",
        description: "Manages prompt construction, tool execution loops, and context retrieval.",
        layer: "Business",
        status: "healthy",
        iconName: "Cpu",
      },
    },
    {
      id: "ai-4",
      type: "database",
      position: { x: 80, y: 440 },
      data: {
        label: "Qdrant Vector DB",
        type: "database",
        technology: "Qdrant",
        description: "Stores high-dimensional document embeddings for semantic similarity search.",
        layer: "Data",
        status: "healthy",
        iconName: "Database",
      },
    },
    {
      id: "ai-5",
      type: "external",
      position: { x: 440, y: 310 },
      data: {
        label: "LLM Provider API",
        type: "external",
        technology: "Gemini / OpenAI API",
        description: "External foundation model for text generation, embeddings, and code execution.",
        layer: "External Services",
        status: "healthy",
        iconName: "Sparkles",
      },
    },
    {
      id: "ai-6",
      type: "cache",
      position: { x: 260, y: 440 },
      data: {
        label: "Redis Conversation Memory",
        type: "cache",
        technology: "Redis Enterprise",
        description: "Buffers recent conversation turns and token sliding windows.",
        layer: "Data",
        status: "healthy",
        iconName: "Server",
      },
    },
  ],
  edges: [
    { id: "e-ai1", source: "ai-1", target: "ai-2", animated: true, label: "SSE / HTTP Stream" },
    { id: "e-ai2", source: "ai-2", target: "ai-3", animated: true, label: "Invoke Pipeline" },
    { id: "e-ai3", source: "ai-3", target: "ai-4", animated: true, label: "Similarity Search" },
    { id: "e-ai4", source: "ai-3", target: "ai-5", animated: true, label: "Generate Tokens" },
    { id: "e-ai5", source: "ai-3", target: "ai-6", animated: false, label: "Fetch Chat History" },
  ],
  databaseSchema: {
    tables: [
      {
        id: "tb-emb",
        name: "document_chunks",
        description: "Vector database embeddings for semantic search.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "document_id", type: "UUID" },
          { name: "embedding_vector", type: "VECTOR(1536)" },
          { name: "content", type: "TEXT" },
        ],
      },
    ],
  },
  apiSpecification: {
    title: "AI Agent REST & SSE API",
    version: "v1.0",
    endpoints: [
      {
        id: "ai-ep-1",
        method: "POST",
        path: "/api/chat/stream",
        summary: "Stream completion tokens via Server-Sent Events (SSE).",
        requestBody: '{\n  "prompt": "Explain Microservices Architecture",\n  "stream": true\n}',
      },
    ],
  },
  dockerCompose: `version: '3.8'
services:
  fastapi:
    build: .
    ports:
      - "8000:8000"
  qdrant:
    image: qdrant/qdrant:v1.7.4
    ports:
      - "6333:6333"`,
  projectStructure: {
    name: "ai-architecture",
    type: "directory",
    children: [
      { name: "src/agents", type: "directory" },
      { name: "src/embeddings", type: "directory" },
      { name: "docker-compose.yml", type: "file" },
    ],
  },
  analysis: {
    overallScore: 91,
    categoryScores: [
      { category: "Security", score: 88, color: "#06B6D4" },
      { category: "Scalability", score: 95, color: "#22C55E" },
      { category: "Performance", score: 90, color: "#2563EB" },
      { category: "Reliability", score: 89, color: "#F59E0B" },
      { category: "Maintainability", score: 93, color: "#22C55E" },
    ],
    insights: [
      {
        id: "ai-ins-1",
        type: "success",
        category: "Scalability",
        title: "Vector DB Indexed for Low Latency",
        description: "Qdrant HNSW indexing ensures sub-20ms nearest-neighbor retrieval.",
      },
    ],
  },
};

export function getMockArchitectureForPrompt(prompt: string): Architecture {
  const lower = prompt.toLowerCase();

  if (lower.includes("ai") || lower.includes("llm") || lower.includes("gpt") || lower.includes("chatgpt") || lower.includes("agent")) {
    return { ...AI_APP_MOCK_ARCHITECTURE, id: `arch-gen-${Date.now()}` };
  } else if (lower.includes("saas") || lower.includes("b2b") || lower.includes("multi-tenant") || lower.includes("workspace")) {
    return { ...SAAS_MOCK_ARCHITECTURE, id: `arch-gen-${Date.now()}` };
  } else {
    // Default to E-Commerce architecture adjusted with prompt title
    return {
      ...ECOMMERCE_MOCK_ARCHITECTURE,
      id: `arch-gen-${Date.now()}`,
      metadata: {
        ...ECOMMERCE_MOCK_ARCHITECTURE.metadata,
        promptUsed: prompt,
      },
    };
  }
}
