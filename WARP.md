# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands & Workflows

### Core Next.js app (Bun)
- **Install dependencies**: `bun install`
- **Start dev server** (Next.js App Router): `bun run dev`
  - Runs on `http://localhost:3000` and tees output to `dev.log`.
- **Build for production**: `bun run build`
  - Uses `next build` with `output: "standalone"` and copies `.next/static` and `public` into `.next/standalone/`.
- **Start production server**: `bun start`
  - Runs `.next/standalone/server.js` with `NODE_ENV=production`, logging to `server.log`.

### Linting
- **ESLint (Next.js + TypeScript)**: `bun run lint`
  - Config lives in `eslint.config.mjs` and extends `next/core-web-vitals` and `next/typescript`, with many strict rules relaxed for faster iteration.

### Database & Prisma (PostgreSQL)
- Prisma schema: `prisma/schema.prisma` (models: `User`, `Agent`, `AgentConfig`, `ApiKey`, `PromptTemplate`, `AgentCapability`, `AgentPerformance`).
- Env vars (see `datasource db`): `DATABASE_URL`, `DIRECT_URL`, `SHADOW_DATABASE_URL` must point at PostgreSQL.
- **Generate Prisma client** (after changing schema):
  - `bun run db:generate`
- **Apply schema to DB (dev)**:
  - `bun run db:push`
- **Create and apply migrations** (when you care about migration history):
  - `bun run db:migrate`
- **Reset dev database** (drops and recreates; do not use on prod):
  - `bun run db:reset`

### Backend setup helper
- **One-time/local setup for the API layer**:
  - `bash setup-api.sh`
- What it does:
  - Ensures `.env` has `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (defaults to `http://localhost:3000`), and `ENCRYPTION_KEY`.
  - Runs `bun install` if `node_modules` is missing.
  - Runs `bun run db:generate` then `bun run db:push`.
  - Prints follow‑up steps for starting `bun run dev` and where to find API docs.

### WebSocket mini-service
- Location: `mini-services/websocket-service/`.
- Purpose: mock real-time agent status, lead updates, and notifications via Socket.io.
- Commands (from project root):
  - Dev: `cd mini-services/websocket-service && bun install && bun run dev`
  - Prod-like: `cd mini-services/websocket-service && bun start`
- Service port is currently **3001** (see `index.ts`), while the frontend hook `useWebSocket` connects to `ws://localhost:3003`; align these before relying on real-time data (either adjust the hook URL or the service port).

### Quick API smoke tests ("single test")
With `bun run dev` running and a valid NextAuth session cookie:
- **List agents for the current user**:
  - `curl -X GET http://localhost:3000/api/agents -H "Cookie: next-auth.session-token=YOUR_TOKEN"`
- **Create a test agent** (see `API_DOCUMENTATION.md` for full payloads):
  - `curl -X POST http://localhost:3000/api/agents -H "Content-Type: application/json" -H "Cookie: next-auth.session-token=YOUR_TOKEN" -d '{"name":"Scout Agent","type":"scout","description":"Lead qualification bot","status":"active"}'`

## High-Level Architecture

### Frontend shell & navigation
- Framework: **Next.js 15 App Router** with **TypeScript** and **Tailwind CSS 4**.
- Root layout: `src/app/layout.tsx`
  - Loads `./globals.css`, registers Geist fonts, sets SEO/OG/Twitter metadata, and wraps the app in `ThemeProvider` and `ThemeToggle` plus a global `Toaster`.
- Main route: `src/app/page.tsx`
  - Declares a `ViewType` union (e.g. `dashboard`, `agents`, `ghostwriter`, `secretary`, `knowledge`, `settings`, `home`).
  - Holds the current view in local state and renders the appropriate feature component inside `MainLayout`:
    - `IntelligenceDashboard` (analytics overview).
    - `AgentManagement` (agent configuration UI).
    - `AgentWorkspace` + `GhostwriterSettings` (outreach content workspace).
    - `VoiceRecorder` (secretary/voice UI).
    - `CommandCenter` (system settings).
    - `HomeView` (marketing-style landing dashboard).
- Layout & navigation:
  - `src/components/layout/main-layout.tsx`: top-level shell that combines the sidebar and main content, reusing the UI `Toaster`.
  - `src/components/layout/sidebar.tsx`: all left-nav structure and active state styles.
    - Sidebar items are defined as a static array with `id` values that match the view IDs in `src/app/page.tsx`; switching views is controlled entirely on the client.

### UI component layers
- **Design system & primitives**: `src/components/ui/*`
  - shadcn/ui-style primitives (buttons, cards, tables, dialogs, forms, etc.) that should be reused rather than re-implemented.
- **Theming**: `src/components/theme/*`
  - `theme-provider.tsx` and `theme-toggle.tsx` integrate `next-themes` with the design system.
- **Feature modules** (selected examples):
  - `src/components/dashboard/intelligence-dashboard.tsx`
    - Visual "Sales OS" dashboard (KPIs, charts, and activity view). Intended to combine static metrics with WebSocket-driven updates.
  - `src/components/agent-management/*`
    - `agent-management.tsx`: top-level Agent Management screen.
      - Manages three built-in agents (`scout`, `ghostwriter`, `secretary`) with per-agent config, capabilities, and performance summaries.
      - Uses `useScoutAgent` for the Scout agent to persist configuration and API keys to the backend.
      - Maintains local state for other agents until their backend endpoints are wired up.
    - `scout-agent-config.tsx`, `agent-identity-panel.tsx`, `scout-agent-dashboard.tsx` (see docs under `SCOUT_AGENT_*`) provide a more detailed configuration and dashboard experience for Scout.
  - `src/components/agent-workspace/agent-workspace.tsx`
    - Two-pane Ghostwriter workspace:
      - Left: lead/company intelligence (mocked data: company overview, recent news, key contacts, competitor analysis).
      - Right: multiple email drafts with refinement controls (tone/length/focus selectors, freeform instructions, and simple refinement simulation).
    - Currently uses in-memory mock data only; no API calls are wired into this workspace yet.
  - `src/components/command-center/command-center.tsx`
    - "Command Center" for the system:
      - **API Vault** tab: manages API keys UI (OpenAI, Anthropic, Tavily) using masked inputs and status badges, backed by mock data.
      - **Agent Personas** tab: high-level persona settings (name/role/temperature) with basic toggles, backed by local state.
      - **Knowledge Center** tab: mock knowledge items (PDFs, docs, URLs) with status indicators.
- **Voice tools**: `src/components/voice/voice-recorder.tsx`
  - UI scaffolding for capturing and processing voice input for the Secretary agent.

### Backend: API layer & auth
- All backend logic lives under `src/app/api/**` and follows a consistent pattern:
  - Env-level auth configuration in `src/lib/auth.ts` using **NextAuth.js** with a **Credentials provider** and JWT sessions.
  - Shared Prisma client in `src/lib/db.ts` (singleton pattern across hot reloads).
  - Shared response helpers in `src/lib/api-response.ts` (`successResponse`, `errorResponse`, `validationError`).
  - Input validation in `src/lib/validators.ts` using **Zod** (schemas + exported types for agents, configs, keys, prompts, and auth forms).

Key groups of routes (see `BACKEND_README.md` and `API_DOCUMENTATION.md` for full details):
- **Authentication** (`src/app/api/auth/**`)
  - `[...nextauth]/route.ts`: NextAuth handler using the `authConfig` credentials provider.
  - `signup/route.ts`: user registration with Zod validation and `bcryptjs` password hashing.
  - `session/route.ts`: returns the normalized session/user payload, wrapped in the standard `ApiResponse` shape.
  - `signout/route.ts`: session termination.
- **Agent CRUD & configuration** (`src/app/api/agents/**`)
  - `agents/route.ts`:
    - `GET /api/agents`: lists agents for the current user, including `config`, `apiKeys`, and `promptTemplates`.
    - `POST /api/agents`: creates a new agent, validates input with `createAgentSchema`, and initializes a default `AgentConfig` row.
  - `agents/[id]/route.ts`:
    - `GET /api/agents/{id}`: fetches a single agent with relations, enforcing ownership (or `admin` role) from the NextAuth session.
    - `PUT /api/agents/{id}`: updates core agent fields with `updateAgentSchema` validation.
    - `DELETE /api/agents/{id}`: deletes an agent (and cascades related rows via Prisma relations).
  - `agents/[id]/config/route.ts`: reads and updates `AgentConfig` using `agentConfigSchema` and the standardized response helpers.
  - `agents/[id]/api-keys/**`: creates, lists, and deletes encrypted API keys bound to a given agent using `apiKeySchema`.
  - `agents/[id]/prompts/**`: CRUD for prompt templates using `promptTemplateSchema`.
- **Agent-specific execution endpoints**
  - `agents/scout/**`: endpoints like `/analyze` and `/create` are used by `use-scout-agent` and the Scout dashboard for test/execution flows.
  - `agents/ghostwriter/**`: endpoints for Ghostwriter content (`/generate`, `/settings`, `/test-connection`).
  - `agents/secretary/**`: endpoints like `/crm-update` scaffold CRM integration.

### Data & persistence
- Database is **PostgreSQL** accessed via Prisma:
  - Users own agents; agents own a single `AgentConfig` and multiple `ApiKey` and `PromptTemplate` rows.
  - Additional models `AgentCapability` and `AgentPerformance` support richer configuration and analytics.
  - Relationships and flows are diagrammed in `ARCHITECTURE.md` (see "Database Schema Relationships" and related sections).
- All API endpoints return a consistent JSON envelope:
  - Success: `{ "success": true, "data": ..., "message": string | undefined, "statusCode": number }`.
  - Errors and validation failures follow the patterns documented in `API_DOCUMENTATION.md` and `QUICK_REFERENCE.md`.

### Real-time layer
- **Socket.io server**: `mini-services/websocket-service/index.ts`
  - Plain Node HTTP server + Socket.io, tracking `activeConnections` in memory.
  - Emits and responds to events:
    - `agent-status`: initial snapshot and subsequent status updates for `scout`, `ghostwriter`, and `secretary` (includes status, `lastActivity`, and counters like `leadsProcessed`).
    - `lead-update`: broadcasts per-lead status, confidence, and responsible agent.
    - `notification`: broadcasts generic notifications with `type`, `message`, `priority`, and `timestamp`.
    - `ping` / `pong`: connection health checks and cleanup of inactive connections.
  - Periodic timers (`setInterval`) simulate agent activity and lead updates for demo purposes.
- **Frontend hook**: `src/hooks/use-websocket.ts`
  - Connects to the Socket.io service, maintains connection state, and exposes:
    - `connected`: boolean flag.
    - `agentStatus`, `leadUpdates`, `notifications`: live state arrays/objects.
    - `sendAgentUpdate`, `sendLeadUpdate`, `sendNotification`: convenience emitters for the corresponding events.
  - Uses an internal ping interval for connection health and simple in-memory buffers (e.g. last 50 lead updates, last 20 notifications).

### Skills directory
- Location: `skills/**`.
- Contains a library of standalone "skills" (ASR, LLM, VLM, TTS, document skills, web-search, web-reader, image/video generation, and **frontend-design**):
  - Each skill has its own `SKILL.md` plus supporting scripts and examples.
  - These are **not automatically wired into the Next.js app**; they are reusable building blocks intended to be invoked by agents or backend workflows.
- Notable skill for UI work: `skills/frontend-design/`
  - `README.md` and `SKILL.md` describe a complete design-token-based frontend methodology with CSS and TypeScript examples (`examples/**`) and Tailwind templates (`templates/**`).
  - This skill is packaged as `@z-ai/frontend-design-skill` (see its `package.json`) and can be treated like an external library of design primitives when extending the UI.

## Existing Documentation to Rely On

When performing non-trivial work, prefer consulting and preserving the patterns in these files instead of re-inventing new structures:

- Root `README.md`
  - High-level tech stack (Next.js 15, TypeScript 5, Tailwind 4, shadcn/ui, TanStack Query/Table, Prisma, NextAuth, Next Intl, etc.).
  - Basic project structure summary for `src/app`, `src/components`, `src/hooks`, and `src/lib`.
- Backend documentation (treat these as authoritative for the API and data model):
  - `BACKEND_README.md`: entry point and index into backend docs; includes quick commands, file layout, and status.
  - `API_DOCUMENTATION.md`: full REST API reference for auth, agents, configs, API keys, and prompts, including request/response examples.
  - `ARCHITECTURE.md`: system and data-flow diagrams (auth pipeline, validation, error handling, DB relationships, status code conventions).
  - `BACKEND_API_SETUP.md`: details on environment variables, setup commands, and cURL-based testing.
  - `QUICK_REFERENCE.md`: quick-start steps, command summary, response format, and locations of key backend files.
  - `SCOUT_AGENT_IMPLEMENTATION.md`, `SCOUT_AGENT_SETUP.md`, `SCOUT_AGENT_QUICK_REFERENCE.md`: detailed design and usage of the Scout agent types, hooks, components, and endpoints.
- Skills documentation (selected):
  - `skills/frontend-design/README.md` and `skills/frontend-design/SKILL.md` for design-system and token-based UI work.

Future changes should extend these established patterns (API response envelope, Zod validators, Prisma models, hook-based client access) rather than introducing parallel conventions.
