# Architecture & Request Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Application                      │
│                     (Next.js React Components)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NextAuth.js Middleware                        │
│           (JWT Authentication & Session Management)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Protected Routes
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Route Handlers                          │
│  ├─ /api/auth/* (Authentication)                               │
│  ├─ /api/agents (Agent Management)                             │
│  ├─ /api/agents/[id]/config (Configuration)                    │
│  ├─ /api/agents/[id]/api-keys (API Keys)                       │
│  └─ /api/agents/[id]/prompts (Prompt Templates)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Queries & Mutations
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Prisma ORM Client                             │
│         (Type-safe database query builder)                       │
│  ├─ User Management                                             │
│  ├─ Agent Configuration                                         │
│  ├─ API Key Storage (Encrypted)                                │
│  └─ Prompt Templates                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                              │
│  ├─ users table                                                 │
│  ├─ agents table                                                │
│  ├─ agent_configs table                                         │
│  ├─ api_keys table (encrypted)                                 │
│  └─ prompt_templates table                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/signup
       │    {email, password, name}
       ▼
┌────────────────────┐
│ Sign Up Handler    │
├────────────────────┤
│ - Validate input   │
│ - Hash password    │
│ - Create user      │
└────────┬───────────┘
         │
         │ 2. Return user (success)
         │
       ┌─┴─────────────────────┐
       │                       │
       │ 3. POST /api/auth/    │ 3. Continue as guest
       │    callback/          │    (limited features)
       │    credentials        │
       │    {email, password}  │
       ▼                       │
┌────────────────────┐         │
│ Credentials Auth   │         │
├────────────────────┤         │
│ - Find user        │         │
│ - Verify password  │         │
│ - Create JWT token │         │
│ - Set session      │         │
└────────┬───────────┘         │
         │                     │
         │ 4. JWT Token        │
         │    (in cookie)      │
         │                     │
       ┌─┴─────────┬───────────┘
       ▼           ▼
    Authenticated  Public API
       API         (limited)
```

## Agent Creation & Configuration Flow

```
┌──────────────────┐
│    Authenticated │
│      User        │
└────────┬─────────┘
         │
         │ POST /api/agents
         │ {name, type, description, status}
         ▼
┌──────────────────────────┐
│ Create Agent Handler     │
├──────────────────────────┤
│ 1. Validate JWT token    │
│ 2. Validate input        │
│ 3. Check authorization   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Prisma Agent.create()    │
├──────────────────────────┤
│ Creates:                 │
│ - Agent record           │
│ - AgentConfig (default)  │
│ - Returns full object    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Response (201)           │
├──────────────────────────┤
│ {                        │
│   id: "agent-123",       │
│   name: "Scout",         │
│   type: "scout",         │
│   config: {...}          │
│ }                        │
└──────────────────────────┘

          Subsequent Calls
          ┌──────────────────────────────────┐
          │                                  │
    PUT /api/agents/{id}/config        POST /api/agents/{id}/api-keys
    UPDATE temperature, tokens, etc.   ADD OpenAI/Claude/etc keys
    │                                  │
    ▼                                  ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Update Config        │      │ Create API Key       │
├──────────────────────┤      ├──────────────────────┤
│ - Verify ownership   │      │ - Encrypt key        │
│ - Validate values    │      │ - Store in database  │
│ - Update database    │      │ - Return metadata    │
└──────────────────────┘      └──────────────────────┘
```

## Request Validation Pipeline

```
┌─────────────────────────────┐
│   Raw HTTP Request          │
│   GET /api/agents/123       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 1. Parse Route Params       │
│    params.id = "123"        │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. Check Authentication     │
│    await getServerSession() │
│    if (!session) → 401      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 3. Verify Ownership         │
│    agent.userId === user.id │
│    if not → 403             │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 4. Fetch from Database      │
│    Prisma.agent.findUnique()│
│    if (!found) → 404        │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 5. Validate Response Data   │
│    (Implicit TypeScript)    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 6. Return Success Response  │
│    {success: true, data: ...}│
└─────────────────────────────┘
```

## Data Update Flow

```
┌──────────────────────────────────┐
│ Client Form Submit               │
│ PUT /api/agents/{id}/config      │
│ {temperature: 0.8}               │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ 1. Parse Request Body            │
│    body = await req.json()       │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ 2. Validate with Zod Schema      │
│    agentConfigSchema.safeParse() │
│    if (!valid) → return 422      │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ 3. Check Authorization           │
│    if (agent.userId !== user.id) │
│       → return 403               │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ 4. Update Database               │
│    db.agentConfig.update({       │
│      where: {agentId},           │
│      data: validated_data        │
│    })                            │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│ 5. Return Updated Record         │
│    {success: true, data: config} │
│    statusCode: 200               │
└──────────────────────────────────┘
```

## Error Handling Flow

```
                    API Request
                         │
                         ▼
                    ┌──────────┐
                    │ Try Block│
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌────────┐   ┌──────────┐   ┌──────────────┐
   │Auth    │   │Validation│   │Database      │
   │Error   │   │Error     │   │Error         │
   │(401)   │   │(422)     │   │(Various)     │
   └────┬───┘   └────┬─────┘   └────┬─────────┘
        │            │              │
        │            │              │
        └────────────┼──────────────┘
                     │
                     ▼
             ┌────────────────┐
             │ Catch Block    │
             ├────────────────┤
             │ Log error      │
             │ Generate       │
             │ error response │
             └────────┬───────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Return Error Response │
           ├──────────────────────┤
           │ {                    │
           │   success: false,    │
           │   error: "message",  │
           │   statusCode: xxx    │
           │ }                    │
           └──────────────────────┘
```

## API Key Encryption Flow

```
┌─────────────────────────────┐
│ Client: "sk-1234567890abc"  │
│ (Plain text API key)        │
└────────────┬────────────────┘
             │
             │ POST /api/agents/{id}/api-keys
             │ {service: "openai", key: "sk-..."}
             ▼
┌──────────────────────────────┐
│ Server receives key          │
│ (Must use HTTPS in prod)     │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Validation                   │
│ zod.apiKeySchema.safeParse() │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Encryption                   │
│ crypto.createCipher(         │
│   "aes192",                  │
│   process.env.ENCRYPTION_KEY │
│ )                            │
│ encryptedKey = "a1b2c3..."   │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Database Storage             │
│ db.apiKey.create({           │
│   service: "openai",         │
│   key: "a1b2c3..." (enc)     │
│ })                           │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Response to Client           │
│ (Returns metadata only)      │
│ {                            │
│   id: "key-123",             │
│   service: "openai",         │
│   status: "active"           │
│   (NO key returned!)         │
│ }                            │
└──────────────────────────────┘

When API key is needed:
1. Agent execution requests key
2. Retrieve encrypted key from DB
3. Decrypt using ENCRYPTION_KEY
4. Use in skill execution (in-memory only)
5. Never log or expose key
```

## Database Schema Relationships

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ password        │
│ role            │
│ createdAt       │
└────────┬────────┘
         │ 1:N
         │
         ▼
┌──────────────────────┐
│      Agent           │
├──────────────────────┤
│ id (PK)              │
│ userId (FK)          │
│ name                 │
│ type                 │
│ description          │
│ status               │
│ createdAt            │
└────┬─────────────────┘
     │
     ├─ 1:1 → AgentConfig
     │
     ├─ 1:N → ApiKey
     │
     └─ 1:N → PromptTemplate


┌──────────────────────┐
│   AgentConfig        │
├──────────────────────┤
│ id (PK)              │
│ agentId (FK, UNIQUE) │
│ temperature          │
│ maxTokens            │
│ topP                 │
│ frequencyPenalty     │
│ presencePenalty      │
└──────────────────────┘


┌──────────────────────┐
│      ApiKey          │
├──────────────────────┤
│ id (PK)              │
│ agentId (FK)         │
│ service              │
│ key (ENCRYPTED)      │
│ secret (ENCRYPTED)   │
│ status               │
│ createdAt            │
└──────────────────────┘

Indexes:
- (agentId, service) UNIQUE
- agentId


┌──────────────────────┐
│  PromptTemplate      │
├──────────────────────┤
│ id (PK)              │
│ agentId (FK)         │
│ name                 │
│ type                 │
│ template (TEXT)      │
│ description          │
│ createdAt            │
└──────────────────────┘

Index:
- agentId
```

## HTTP Status Code Usage

```
Success (2xx)
├─ 200 OK - Standard success
├─ 201 Created - Resource created
└─ 204 No Content - Success with no body

Client Error (4xx)
├─ 400 Bad Request - Malformed request
├─ 401 Unauthorized - No/invalid authentication
├─ 403 Forbidden - Authorized but no access
├─ 404 Not Found - Resource doesn't exist
├─ 409 Conflict - Resource already exists
└─ 422 Unprocessable Entity - Validation failed

Server Error (5xx)
└─ 500 Internal Server Error - Unexpected error
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Secure data flow
- ✅ Proper error handling
- ✅ Type safety throughout
- ✅ Scalable design
- ✅ Easy to test and debug
