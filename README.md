# ArchiMate — Advanced AI Software Architecture Generator

ArchiMate is an AI-powered software architecture generator built with Next.js 14, React 18, TypeScript, Tailwind CSS, React Flow v12, Supabase PostgreSQL, and Google Gemini AI. It converts application requirements into interactive software topology diagrams, system analysis, DB schemas, OpenAPI specs, Docker topologies, and modular directory structures.

---

## 🚀 Quick Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/archimate.git
cd archimate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Local Environment Variables
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your own local development placeholders in `.env.local`:

```env
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key-here

# Google Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Administrator Portal Credentials
ADMIN_USERNAME=your-admin-username-here
ADMIN_PASSWORD=your-admin-password-here
```

### 4. Setup Database Schema (Optional for Supabase)
Run the SQL script located at `supabase/schema.sql` in your Supabase SQL Editor to initialize `profiles`, `projects`, and `admin_activity_logs` tables with Row Level Security (RLS).

### 5. Start Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🛡️ Security Guidelines

Refer to [SECURITY.md](SECURITY.md) for full security rules, environment variable boundaries, and secret rotation policies. Never commit `.env` or `.env.local` files to GitHub.
