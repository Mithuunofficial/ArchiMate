import { Template } from "@/types/template";
import { ECOMMERCE_MOCK_ARCHITECTURE } from "./ecommerce.mock";
import { SAAS_MOCK_ARCHITECTURE } from "./saas.mock";
import { AI_APP_MOCK_ARCHITECTURE } from "./presets";

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl-ecommerce",
    name: "E-Commerce Microservices",
    category: "E-Commerce",
    description: "Production-ready e-commerce architecture with React frontend, Nginx API gateway, order processing microservice, Redis cache, PostgreSQL DB, and Stripe payments.",
    technologies: ["React", "Node.js", "PostgreSQL", "Redis", "RabbitMQ", "Stripe"],
    componentsCount: 8,
    previewNodes: ["React Storefront", "API Gateway", "Order Microservice", "PostgreSQL", "Redis", "Stripe"],
    architecture: ECOMMERCE_MOCK_ARCHITECTURE,
  },
  {
    id: "tpl-saas",
    name: "Multi-Tenant SaaS Platform",
    category: "SaaS",
    description: "Enterprise SaaS stack with Next.js dashboard, Fast API core, Kong Gateway, tenant isolation layer, PostgreSQL RLS, AWS S3 storage, and Stripe Billing.",
    technologies: ["Next.js", "FastAPI", "Kong", "PostgreSQL", "AWS S3", "Stripe"],
    componentsCount: 7,
    previewNodes: ["Next.js UI", "Kong Gateway", "Tenant Auth", "FastAPI Core", "PostgreSQL RLS", "AWS S3"],
    architecture: SAAS_MOCK_ARCHITECTURE,
  },
  {
    id: "tpl-ai",
    name: "AI RAG & Agent Pipeline",
    category: "AI/ML",
    description: "Modern AI application with React chat UI, FastAPI SSE streaming, Qdrant vector database for document embeddings, and LLM inference API.",
    technologies: ["React", "FastAPI", "Qdrant", "Redis", "LangChain", "Gemini API"],
    componentsCount: 6,
    previewNodes: ["Chat UI", "FastAPI Stream", "LangChain Agent", "Qdrant Vector DB", "Redis Memory", "Gemini API"],
    architecture: AI_APP_MOCK_ARCHITECTURE,
  },
  {
    id: "tpl-chat",
    name: "Real-Time Chat & Collaboration",
    category: "Real-Time",
    description: "High-concurrency chat platform utilizing WebSocket servers, Socket.io gateway, Cassandra message store, and Redis pub/sub.",
    technologies: ["React", "Node.js", "WebSockets", "Redis Pub/Sub", "Cassandra"],
    componentsCount: 7,
    previewNodes: ["Web App", "WebSocket Gateway", "Chat Service", "Redis Pub/Sub", "Cassandra DB"],
    architecture: {
      ...ECOMMERCE_MOCK_ARCHITECTURE,
      id: "arch-chat-tpl",
      name: "Real-Time Chat Architecture",
    },
  },
  {
    id: "tpl-fintech",
    name: "Banking & FinTech Core",
    category: "FinTech",
    description: "Secure, audit-compliant financial service architecture with mTLS API gateway, double-entry ledger database, and HSM transaction signing.",
    technologies: ["Java Spring Boot", "PostgreSQL", "Kafka", "Redis", "HashiCorp Vault"],
    componentsCount: 9,
    previewNodes: ["Mobile App", "mTLS Gateway", "Ledger Service", "PostgreSQL", "Apache Kafka"],
    architecture: {
      ...ECOMMERCE_MOCK_ARCHITECTURE,
      id: "arch-fintech-tpl",
      name: "FinTech Core Architecture",
    },
  },
  {
    id: "tpl-food",
    name: "Food Delivery Platform",
    category: "E-Commerce",
    description: "Real-time dispatch and driver tracking architecture featuring WebSockets, Geospatial Redis, delivery queue, and Google Maps API.",
    technologies: ["React Native", "Go", "Redis Geo", "PostgreSQL", "Google Maps API"],
    componentsCount: 8,
    previewNodes: ["Customer App", "Driver App", "Dispatch Engine", "Redis Geo", "PostgreSQL"],
    architecture: {
      ...ECOMMERCE_MOCK_ARCHITECTURE,
      id: "arch-food-tpl",
      name: "Food Delivery Architecture",
    },
  },
];
