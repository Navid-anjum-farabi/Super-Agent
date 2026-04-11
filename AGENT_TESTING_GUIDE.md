# 🧪 Agent Testing & API Configuration Guide

A comprehensive guide to configure API keys and test all three agents (Scout, Ghostwriter, Secretary) in your Super-Agent Sales OS.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Authentication Setup](#authentication-setup)
5. [Testing Scout Agent](#testing-scout-agent)
6. [Testing Ghostwriter Agent](#testing-ghostwriter-agent)
7. [Testing Secretary Agent](#testing-secretary-agent)
8. [Testing via UI](#testing-via-ui)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before testing, ensure you have:

- [ ] PostgreSQL database running
- [ ] Node.js 18+ or Bun installed
- [ ] API keys for LLM providers (OpenRouter recommended)
- [ ] Project dependencies installed (`bun install`)

---

## 🔐 Environment Setup

### Step 1: Create `.env` file

Create a `.env` file in the project root with the following variables:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/agentcrm"
DIRECT_URL="postgresql://username:password@localhost:5432/agentcrm"

# NextAuth.js (Generate secure secrets!)
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Encryption for API keys stored in DB
ENCRYPTION_KEY="your-encryption-key-32-chars"

# LLM Provider - OpenRouter (Recommended - access to multiple models)
OPENROUTER_API_KEY="sk-or-v1-your-openrouter-api-key"
OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"  # or "openai/gpt-4o-mini"

# Alternative: Direct OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Optional: Tavily for web search (Scout Agent)
TAVILY_API_KEY="tvly-your-tavily-api-key"

# Optional: Anthropic direct
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
```

### Step 2: Get API Keys

| Provider | Purpose | Get Key |
|----------|---------|---------|
| **OpenRouter** | LLM access (recommended) | https://openrouter.ai/keys |
| **OpenAI** | GPT models | https://platform.openai.com/api-keys |
| **Anthropic** | Claude models | https://console.anthropic.com/ |
| **Tavily** | Web search | https://tavily.com/ |

> **💡 Tip**: OpenRouter gives you access to multiple models (GPT-4, Claude, Llama, etc.) with a single API key.

---

## 🗄️ Database Setup

### Step 1: Start PostgreSQL

```bash
# Using Docker (easiest)
docker run --name agentcrm-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=agentcrm -p 5432:5432 -d postgres:15

# Or use your existing PostgreSQL installation
```

### Step 2: Generate Prisma Client & Push Schema

```bash
# Generate the Prisma client
bun run db:generate

# Push schema to database (creates all tables)
bun run db:push
```

### Step 3: Verify Database

```bash
# Check tables were created
bunx prisma studio
```

This opens a visual database browser at http://localhost:5555

---

## 🔑 Authentication Setup

### Step 1: Start the Dev Server

```bash
bun run dev
```

Server runs at http://localhost:3000

### Step 2: Create a Test User

```bash
# Create user via API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "message": "User created successfully"
}
```

> **Note**: This automatically creates 3 default agents (Scout, Ghostwriter, Secretary) for the user!

### Step 3: Get Session Token

Option A: **Login via Browser** (Easiest)
1. Visit http://localhost:3000
2. The app uses NextAuth - you'll need to create a login page or use the API

Option B: **Get Token via cURL**
```bash
# Login and get session cookie
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=password123" \
  -c cookies.txt \
  -v
```

Option C: **Use Browser DevTools**
1. Login through NextAuth (if you have a login page)
2. Open DevTools → Application → Cookies
3. Copy the `next-auth.session-token` value

### Step 4: Verify Agents Were Created

```bash
# List all agents (use session cookie from step 3)
curl -X GET http://localhost:3000/api/agents \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "Scout Agent",
      "type": "scout",
      "status": "active"
    },
    {
      "id": "clyyy...",
      "name": "Ghostwriter Agent",
      "type": "ghostwriter",
      "status": "active"
    },
    {
      "id": "clzzz...",
      "name": "Secretary Agent",
      "type": "secretary",
      "status": "active"
    }
  ]
}
```

---

## 🔍 Testing Scout Agent

The Scout Agent analyzes leads and qualifies them using AI.

### API Endpoint
```
POST /api/agents/scout/analyze
```

### Required Environment Variable
```bash
OPENROUTER_API_KEY="sk-or-v1-xxx"  # Required for AI processing
```

### Test 1: Basic Lead Analysis

```bash
curl -X POST http://localhost:3000/api/agents/scout/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyName": "TechVentures Inc",
    "website": "https://techventures.com",
    "industry": "SaaS / FinTech",
    "size": "201-500 employees",
    "location": "San Francisco, CA",
    "contactName": "Sarah Chen",
    "title": "CEO",
    "notes": "Recently raised $50M Series B. Looking to scale sales operations."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "qualification": "qualified",
    "score": 85,
    "reasons": [
      "Recent Series B funding indicates growth phase",
      "Company size appropriate for enterprise solution",
      "CEO involvement suggests high-level decision making"
    ],
    "nextSteps": [
      "Schedule introductory call",
      "Prepare customized demo",
      "Research competitive landscape"
    ],
    "rawExplanation": "..."
  },
  "message": "Lead analyzed successfully"
}
```

### Test 2: Minimal Lead Data

```bash
curl -X POST http://localhost:3000/api/agents/scout/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyName": "Unknown Startup",
    "notes": "Cold lead, no other info available"
  }'
```

### Test 3: Using Custom Prompt Template

First, create a prompt template:
```bash
# Get your Scout agent ID
SCOUT_ID=$(curl -s http://localhost:3000/api/agents \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" | jq -r '.data[] | select(.type=="scout") | .id')

# Create a prompt template
curl -X POST "http://localhost:3000/api/agents/$SCOUT_ID/prompts" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "BANT Qualification",
    "type": "user",
    "template": "Evaluate lead {leadData} using BANT criteria (Budget, Authority, Need, Timeline). Return JSON with qualification score and detailed breakdown.",
    "description": "BANT-based lead qualification"
  }'
```

Then use it:
```bash
curl -X POST http://localhost:3000/api/agents/scout/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "companyName": "Enterprise Corp",
    "promptName": "BANT Qualification",
    "notes": "Budget: $100k, Decision maker: Yes, Timeline: Q2"
  }'
```

---

## ✍️ Testing Ghostwriter Agent

The Ghostwriter Agent generates personalized outreach content.

### API Endpoint
```
POST /api/agents/ghostwriter/generate
```

### Current Status
⚠️ **Note**: This endpoint currently returns **mock data**. It doesn't use real AI yet.

### Test 1: Generate Email Draft

```bash
curl -X POST http://localhost:3000/api/agents/ghostwriter/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "leadId": "lead_123",
    "action": "generate",
    "tone": "professional",
    "length": "medium",
    "focus": "solution"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "agent": "ghostwriter",
  "action": "generate",
  "data": {
    "id": "lead_123",
    "status": "generated",
    "drafts": [
      {
        "id": "draft_1",
        "subject": "Re: Scaling Your Sales Operations with AI",
        "body": "Hi Sarah,\n\nCongratulations on the recent Series B funding...",
        "tone": "professional",
        "length": "medium",
        "focus": "solution",
        "confidence": 94
      }
    ]
  }
}
```

### Test 2: Refine Existing Draft

```bash
curl -X POST http://localhost:3000/api/agents/ghostwriter/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "leadId": "lead_123",
    "action": "refine",
    "originalId": "draft_1",
    "instruction": "Make it more casual and shorter"
  }'
```

### Tone Options
- `professional` - Formal business tone
- `casual` - Friendly, conversational
- `friendly` - Warm but still business appropriate
- `formal` - Very formal, corporate

### Length Options
- `short` - 2-3 sentences
- `medium` - 1 paragraph
- `long` - Multiple paragraphs

### Focus Options
- `product` - Focus on product features
- `value` - Focus on value proposition
- `relationship` - Focus on building rapport
- `solution` - Focus on solving pain points

---

## 📝 Testing Secretary Agent

The Secretary Agent handles CRM updates, scheduling, and voice processing.

### API Endpoint
```
POST /api/agents/secretary/crm-update
```

### Current Status
⚠️ **Note**: This endpoint currently returns **mock data**. Voice transcription isn't real yet.

### Test 1: CRM Update

```bash
curl -X POST http://localhost:3000/api/agents/secretary/crm-update \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "leadId": "lead_456",
    "action": "crm-update",
    "data": {
      "notes": "Completed initial discovery call. Very interested in AI features."
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "agent": "secretary",
  "action": "crm-update",
  "data": {
    "id": "lead_456",
    "status": "updated",
    "crmUpdates": {
      "leadStatus": "contacted",
      "lastActivity": "2024-01-29T14:30:00.000Z",
      "notes": "Completed initial discovery call. Very interested in AI features.",
      "nextFollowUp": "2024-02-01T14:30:00.000Z",
      "tags": ["AI-generated", "high-priority", "series-b-funded"]
    }
  }
}
```

### Test 2: Schedule Follow-up

```bash
curl -X POST http://localhost:3000/api/agents/secretary/crm-update \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "leadId": "lead_456",
    "action": "schedule-followup",
    "data": {
      "type": "email",
      "days": 3
    }
  }'
```

### Test 3: Voice Update (Mock Transcription)

```bash
curl -X POST http://localhost:3000/api/agents/secretary/crm-update \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "leadId": "lead_456",
    "action": "voice-update",
    "data": {
      "transcription": "Just finished a call with the CEO. They want a demo next Tuesday."
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "agent": "secretary",
  "action": "voice-update",
  "data": {
    "transcription": {
      "text": "Just finished a call with the CEO...",
      "summary": "Positive call outcome. Demo requested for Tuesday.",
      "actionItems": [
        "Schedule demo for Tuesday",
        "Prepare demo materials",
        "Send calendar invite"
      ],
      "confidence": 92
    }
  }
}
```

---

## 🖥️ Testing via UI

### Step 1: Start the Application

```bash
bun run dev
```

### Step 2: Access the Application

Open http://localhost:3000 in your browser.

### Step 3: Navigate to Agent Management

> **Note**: You need to be logged in. If no login page exists, you'll need to create a session via API first.

The Agent Management page shows:
- All 3 agents (Scout, Ghostwriter, Secretary)
- Configuration for each agent
- Capabilities toggle
- Performance metrics

### Step 4: Test Agent Features

**Scout Agent Dashboard** (`/agents/scout`):
- Enter lead details
- Click "Analyze Lead"
- View qualification results

**Ghostwriter Workspace** (`/workspace`):
- Select a lead
- Generate email drafts
- Adjust tone/length/focus
- Refine drafts

**Voice Recorder** (`/secretary`):
- Record voice note
- View transcription (mock)
- See action items

---

## 🔧 Troubleshooting

### Error: "Unauthorized" (401)

**Cause**: Missing or invalid session token

**Fix**:
1. Create a user via `/api/auth/signup`
2. Login to get a session token
3. Include the token in your request headers

```bash
# Check if you have a valid session
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Error: "Scout Agent not found" (404)

**Cause**: Agents weren't seeded for the user

**Fix**:
1. The signup endpoint should automatically create agents
2. If not, manually create via API:

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "Scout Agent",
    "type": "scout",
    "description": "Lead research and qualification",
    "status": "active"
  }'
```

### Error: "OPENROUTER_API_KEY is not set"

**Cause**: Missing environment variable

**Fix**:
1. Add `OPENROUTER_API_KEY` to your `.env` file
2. Restart the dev server

```bash
# Verify env vars are loaded
echo $OPENROUTER_API_KEY
```

### Error: Database connection failed

**Cause**: PostgreSQL not running or wrong credentials

**Fix**:
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Test connection:

```bash
bunx prisma db pull  # Should connect without errors
```

### Error: "Could not parse model output as JSON"

**Cause**: LLM returned unexpected format

**Fix**:
1. This is handled gracefully - returns "uncertain" qualification
2. Check your prompt templates for clarity
3. Try a different model (Claude vs GPT)

### Slow Response Times

**Cause**: LLM API latency

**Fix**:
1. Use a faster model (gpt-4o-mini vs gpt-4)
2. Reduce `maxTokens` in agent config
3. Check your OpenRouter dashboard for rate limits

---

## 📊 Quick Reference

### API Endpoints Summary

| Agent | Endpoint | Method | Real AI? |
|-------|----------|--------|----------|
| Scout | `/api/agents/scout/analyze` | POST | ✅ Yes |
| Scout | `/api/agents/scout/create` | POST | ✅ Yes |
| Ghostwriter | `/api/agents/ghostwriter/generate` | POST | ❌ Mock |
| Ghostwriter | `/api/agents/ghostwriter/settings` | GET/PUT | ✅ Yes |
| Secretary | `/api/agents/secretary/crm-update` | POST | ❌ Mock |

### Environment Variables Required

| Variable | Required For | Example |
|----------|--------------|---------|
| `DATABASE_URL` | All | `postgresql://...` |
| `NEXTAUTH_SECRET` | Auth | Random 32+ chars |
| `NEXTAUTH_URL` | Auth | `http://localhost:3000` |
| `OPENROUTER_API_KEY` | Scout Agent | `sk-or-v1-...` |
| `ENCRYPTION_KEY` | API key storage | Random 32 chars |

### cURL with Session (Template)

```bash
# Set your token once
export TOKEN="your-session-token-here"

# Then use in all requests
curl -X GET http://localhost:3000/api/agents \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

---

## 🎉 You're Ready!

With this guide, you can:
- ✅ Set up your environment
- ✅ Configure API keys
- ✅ Test all three agents via API
- ✅ Debug common issues

**Next Steps:**
1. Create login/signup pages for browser-based auth
2. Wire Ghostwriter to real AI (like Scout)
3. Integrate real ASR for Secretary voice features
4. Build out the dashboard with live data

Happy testing! 🚀
