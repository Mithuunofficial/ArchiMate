import { Architecture } from "@/types/architecture";

export const ECOMMERCE_MOCK_ARCHITECTURE: Architecture = {
  id: "arch-ecommerce-001",
  name: "Modern E-Commerce Engine",
  description: "High-throughput e-commerce system featuring storefront, API Gateway, auth service, PostgreSQL DB, Redis caching, RabbitMQ message queue, and Stripe payment integration.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    promptUsed: "Build an e-commerce application with React frontend, Node.js backend, PostgreSQL database, Redis cache, authentication service and Stripe payment integration.",
    technologies: ["React", "Node.js", "Express", "PostgreSQL", "Redis", "RabbitMQ", "Stripe", "Docker", "Nginx"],
    estimatedCost: "$145 / month (Cloud Infra Estimate)",
    layerCount: 5,
  },
  nodes: [
    {
      id: "node-1",
      type: "frontend",
      position: { x: 250, y: 50 },
      data: {
        label: "React Storefront",
        type: "frontend",
        technology: "React 18 + Next.js",
        description: "Customer-facing progressive web app & product checkout interface.",
        layer: "Presentation",
        status: "healthy",
        iconName: "Layout",
      },
    },
    {
      id: "node-2",
      type: "gateway",
      position: { x: 250, y: 190 },
      data: {
        label: "API Gateway",
        type: "gateway",
        technology: "Nginx / Express Gateway",
        description: "Routes requests, applies rate-limiting, and inspects JWT auth tokens.",
        layer: "Application",
        status: "healthy",
        iconName: "ShieldCheck",
      },
    },
    {
      id: "node-3",
      type: "auth",
      position: { x: 50, y: 330 },
      data: {
        label: "Auth Service",
        type: "auth",
        technology: "Node.js + OAuth2 / JWT",
        description: "Handles user login, registration, password hashing, and session tokens.",
        layer: "Business",
        status: "healthy",
        iconName: "Lock",
      },
    },
    {
      id: "node-4",
      type: "backend",
      position: { x: 250, y: 330 },
      data: {
        label: "Core Order Service",
        type: "backend",
        technology: "Node.js (TypeScript)",
        description: "Manages shopping carts, order fulfillment, pricing calculations, and inventory updates.",
        layer: "Business",
        status: "healthy",
        iconName: "Server",
      },
    },
    {
      id: "node-5",
      type: "external",
      position: { x: 490, y: 330 },
      data: {
        label: "Stripe Payment Gateway",
        type: "external",
        technology: "Stripe API v3",
        description: "Secure third-party credit card processing, refunds, and webhooks.",
        layer: "External Services",
        status: "healthy",
        iconName: "CreditCard",
      },
    },
    {
      id: "node-6",
      type: "cache",
      position: { x: 100, y: 490 },
      data: {
        label: "Redis Session & Product Cache",
        type: "cache",
        technology: "Redis 7.2",
        description: "Sub-millisecond query cache for trending products and active shopping carts.",
        layer: "Data",
        status: "healthy",
        iconName: "Zap",
      },
    },
    {
      id: "node-7",
      type: "database",
      position: { x: 250, y: 490 },
      data: {
        label: "PostgreSQL Primary DB",
        type: "database",
        technology: "PostgreSQL 16",
        description: "Relational database holding user accounts, catalog products, and purchase history.",
        layer: "Data",
        status: "healthy",
        iconName: "Database",
      },
    },
    {
      id: "node-8",
      type: "queue",
      position: { x: 450, y: 490 },
      data: {
        label: "RabbitMQ Message Queue",
        type: "queue",
        technology: "RabbitMQ 3.12",
        description: "Asynchronous task queue for email confirmations, order receipts, and analytics pipeline.",
        layer: "Infrastructure",
        status: "warning",
        iconName: "Layers",
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2", animated: true, label: "HTTPS / REST" },
    { id: "e2-3", source: "node-2", target: "node-3", animated: false, label: "/api/auth/*" },
    { id: "e2-4", source: "node-2", target: "node-4", animated: true, label: "/api/orders/*" },
    { id: "e4-5", source: "node-4", target: "node-5", animated: true, label: "Stripe SDK / Webhook" },
    { id: "e4-6", source: "node-4", target: "node-6", animated: false, label: "Cache Read/Write" },
    { id: "e4-7", source: "node-4", target: "node-7", animated: true, label: "SQL Queries (Prisma)" },
    { id: "e4-8", source: "node-4", target: "node-8", animated: true, label: "Publish Events" },
    { id: "e3-7", source: "node-3", target: "node-7", animated: false, label: "User Accounts SQL" },
  ],
  databaseSchema: {
    tables: [
      {
        id: "tbl-1",
        name: "users",
        description: "Stores registered customer profiles and authentication credentials.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "email", type: "VARCHAR(255)", nullable: false },
          { name: "password_hash", type: "TEXT", nullable: false },
          { name: "full_name", type: "VARCHAR(100)" },
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE" },
        ],
      },
      {
        id: "tbl-2",
        name: "products",
        description: "E-commerce product catalog metadata and inventory levels.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "sku", type: "VARCHAR(50)", nullable: false },
          { name: "title", type: "VARCHAR(255)", nullable: false },
          { name: "price_cents", type: "INTEGER", nullable: false },
          { name: "stock_quantity", type: "INTEGER", nullable: false },
          { name: "category", type: "VARCHAR(100)" },
        ],
      },
      {
        id: "tbl-3",
        name: "orders",
        description: "Customer purchases and payment tracking record.",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "user_id", type: "UUID", isForeign: true, references: "users.id" },
          { name: "stripe_payment_id", type: "VARCHAR(255)" },
          { name: "total_amount_cents", type: "INTEGER", nullable: false },
          { name: "status", type: "VARCHAR(50)" },
          { name: "created_at", type: "TIMESTAMP" },
        ],
      },
    ],
  },
  apiSpecification: {
    title: "E-Commerce Microservice API",
    version: "v1.4.0",
    endpoints: [
      {
        id: "api-1",
        method: "GET",
        path: "/api/products",
        summary: "Retrieve paginated list of catalog products with Redis caching.",
        tags: ["Catalog"],
        responseExample: '{\n  "data": [\n    { "id": "p-101", "name": "Wireless Noise-Canceling Headphones", "price": 199.99, "stock": 42 }\n  ],\n  "page": 1,\n  "totalPages": 5\n}',
      },
      {
        id: "api-2",
        method: "POST",
        path: "/api/orders/checkout",
        summary: "Create an order checkout session with Stripe payment processing.",
        tags: ["Orders"],
        requestBody: '{\n  "items": [{ "productId": "p-101", "quantity": 1 }],\n  "currency": "usd"\n}',
        responseExample: '{\n  "orderId": "ord_892341",\n  "stripeClientSecret": "pi_3MtwB2LkdIwXm5_secret_99812",\n  "status": "pending_payment"\n}',
      },
      {
        id: "api-3",
        method: "POST",
        path: "/api/auth/login",
        summary: "Authenticate user email and return JWT access token.",
        tags: ["Authentication"],
        requestBody: '{\n  "email": "user@example.com",\n  "password": "SecurePassword123!"\n}',
        responseExample: '{\n  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",\n  "expiresIn": 86400\n}',
      },
    ],
  },
  dockerCompose: `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - gateway

  gateway:
    image: nginx:alpine
    ports:
      - "8000:80"
    volumes:
      - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - auth-service

  backend:
    build:
      context: ./backend
    environment:
      - PORT=4000
      - DATABASE_URL=postgres://archimate:secret@postgres:5432/ecommerce
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
      - rabbitmq

  auth-service:
    build:
      context: ./services/auth
    environment:
      - PORT=4001
      - DATABASE_URL=postgres://archimate:secret@postgres:5432/ecommerce

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=archimate
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres_data:`,
  projectStructure: {
    name: "ecommerce-platform",
    type: "directory",
    children: [
      {
        name: "frontend",
        type: "directory",
        children: [
          { name: "src/components", type: "directory" },
          { name: "src/pages", type: "directory" },
          { name: "src/hooks", type: "directory" },
          { name: "Dockerfile", type: "file" },
        ],
      },
      {
        name: "backend",
        type: "directory",
        children: [
          { name: "src/controllers", type: "directory" },
          { name: "src/models", type: "directory" },
          { name: "src/routes", type: "directory" },
          { name: "src/services", type: "directory" },
          { name: "Dockerfile", type: "file" },
        ],
      },
      {
        name: "services",
        type: "directory",
        children: [
          {
            name: "auth",
            type: "directory",
            children: [{ name: "index.ts", type: "file" }],
          },
        ],
      },
      {
        name: "database",
        type: "directory",
        children: [{ name: "migrations/", type: "directory" }, { name: "schema.sql", type: "file" }],
      },
      { name: "docker-compose.yml", type: "file" },
      { name: "README.md", type: "file" },
    ],
  },
  analysis: {
    overallScore: 89,
    categoryScores: [
      { category: "Security", score: 92, color: "#22C55E" },
      { category: "Scalability", score: 85, color: "#06B6D4" },
      { category: "Performance", score: 91, color: "#2563EB" },
      { category: "Reliability", score: 84, color: "#F59E0B" },
      { category: "Maintainability", score: 93, color: "#22C55E" },
    ],
    insights: [
      {
        id: "ins-1",
        type: "success",
        category: "Security",
        title: "Isolated API Gateway Boundary",
        description: "Public client traffic passes through an Nginx API Gateway before touching application microservices.",
      },
      {
        id: "ins-2",
        type: "success",
        category: "Performance",
        title: "Sub-millisecond Session Caching",
        description: "Redis active session cache reduces database read overhead by up to 70%.",
      },
      {
        id: "ins-3",
        type: "warning",
        category: "Scalability",
        title: "Single Primary PostgreSQL Node",
        description: "High transaction concurrency during flash sales could bottleneck write capacity.",
        recommendation: "Consider configuring PostgreSQL read-replicas with a connection pooler like PgBouncer.",
        affectedNodeIds: ["node-7"],
      },
    ],
  },
};
