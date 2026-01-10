# 🚀 Quick Reference Guide

## Getting Started in 5 Steps

### Step 1: Update Database Schema
```bash
# Option A: Apply schema changes (needs confirmation if data loss)
bun run db:push

# Option B: Reset development database (careful with production!)
bun run db:reset
```

### Step 2: Generate Prisma Client
```bash
bun run db:generate
```

### Step 3: Start Development Server
```bash
bun run dev
# Server at: http://localhost:3000
```

### Step 4: Test Authentication
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Step 5: Create Your First Agent
```bash
# Replace with your session token from sign up
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "Scout Agent",
    "type": "scout",
    "description": "Lead qualification bot",
    "status": "active"
  }'
```

---

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| **API_DOCUMENTATION.md** | Complete API reference | Developers, API users |
| **ARCHITECTURE.md** | System design & flows | Architects, senior devs |
| **BACKEND_API_SETUP.md** | Setup & deployment guide | DevOps, setup engineers |
| **IMPLEMENTATION_COMPLETE.md** | What was built | Project managers |
| **COMPLETION_REPORT.md** | Summary of work | Stakeholders |
| **This file** | Quick commands & reference | Everyone |

---

## 🔑 Key Concepts

### Authentication Flow
User → Sign Up → Hash Password → JWT Token → Protected Routes

### Authorization
- **User Role**: Can only access own agents
- **Admin Role**: Can access any user's agents
- Checked on every endpoint

### Data Security
- API keys encrypted before storage
- Passwords hashed with bcryptjs
- JWT tokens in secure cookies
- HTTPS enforced in production

### Request Validation
Every request goes through:
1. Parse input
2. Validate with Zod
3. Check authentication
4. Check authorization
5. Execute operation
6. Return standardized response

---

## 🛠️ Most Used Commands

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build for production
bun run lint         # Run linter

# Database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Create migration
bun run db:push      # Apply schema to database
bun run db:reset     # Reset database (dev only)

# Setup
bash setup-api.sh    # Run full setup
```

---

## 🎯 Common API Patterns

### Create Resource
```bash
POST /api/resource
{
  "field1": "value1",
  "field2": "value2"
}
# Returns 201 with created resource
```

### Get List
```bash
GET /api/resources
# Returns 200 with array of resources
```

### Get Single
```bash
GET /api/resource/{id}
# Returns 200 with resource
```

### Update
```bash
PUT /api/resource/{id}
{
  "field1": "updated_value"
}
# Returns 200 with updated resource
```

### Delete
```bash
DELETE /api/resource/{id}
# Returns 200 with success message
```

---

## 📋 Response Format Reference

### Success (200, 201)
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful",
  "statusCode": 200
}
```

### Validation Error (422)
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 422,
  "data": {
    "email": "Invalid email address",
    "password": "Too short"
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Agent not found",
  "statusCode": 404
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized: No session",
  "statusCode": 401
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "Forbidden: Insufficient permissions",
  "statusCode": 403
}
```

---

## 🔍 Finding Things

### API Handlers
All in `src/app/api/`

```
agents/
├── route.ts                # GET all, POST create
├── [id]/
│   ├── route.ts           # GET one, PUT, DELETE
│   ├── config/
│   │   └── route.ts       # GET, PUT config
│   ├── api-keys/
│   │   ├── route.ts       # GET, POST keys
│   │   └── [keyId]/
│   │       └── route.ts   # DELETE key
│   └── prompts/
│       ├── route.ts       # GET, POST prompts
│       └── [promptId]/
│           └── route.ts   # PUT, DELETE prompt
```

### Utilities
All in `src/lib/`

```
auth.ts                     # NextAuth configuration
auth-middleware.ts          # Route protection
api-response.ts             # Response formatting
validators.ts               # Zod schemas
db.ts                       # Prisma client
utils.ts                    # Helper functions
```

### Database
```
prisma/
├── schema.prisma           # All models & relationships
└── migrations/             # Database change history
```

---

## 🐛 Debugging Tips

### Check Authentication
```bash
# Get current session
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Test Endpoint
```bash
# Use -v flag for verbose output
curl -v -X GET http://localhost:3000/api/agents \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### View Logs
```bash
# Dev server logs show request details
# Check terminal output for errors and timing

# Check database logs (if enabled)
tail -f logs/database.log
```

### Test Validation
```bash
# Send invalid data to see validation errors
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name": ""}' # Empty name
# Returns 422 with field errors
```

---

## 🎓 Learning Path

1. **Start Here**: Read this file (Quick Reference)
2. **Then**: Read API_DOCUMENTATION.md (understand endpoints)
3. **Then**: Read ARCHITECTURE.md (understand design)
4. **Then**: Explore code in src/app/api/ (see implementation)
5. **Then**: Read BACKEND_API_SETUP.md (advanced topics)

---

## 🔐 Security Checklist

Before deployment:
- [ ] Change NEXTAUTH_SECRET (currently in .env)
- [ ] Change ENCRYPTION_KEY (currently in .env)
- [ ] Enable HTTPS in production
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Use environment-specific secrets
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Set up monitoring and alerts

---

## 📊 Files by Purpose

### API Endpoints
- `src/app/api/agents/route.ts` - Agent list & create
- `src/app/api/agents/[id]/route.ts` - Agent CRUD
- `src/app/api/agents/[id]/config/route.ts` - Settings
- `src/app/api/agents/[id]/api-keys/route.ts` - Keys
- `src/app/api/agents/[id]/prompts/route.ts` - Templates
- `src/app/api/auth/**` - Authentication routes

### Core Logic
- `src/lib/auth.ts` - Authentication setup
- `src/lib/validators.ts` - Input validation
- `src/lib/api-response.ts` - Response formatting
- `src/lib/auth-middleware.ts` - Access control

### Database
- `prisma/schema.prisma` - Data models
- `src/lib/db.ts` - Database connection

---

## ⏱️ Expected Timelines

### Setup
- Fresh database: ~2 minutes
- With existing data: ~5 minutes

### Testing Single Endpoint
- Success case: ~10 seconds
- With validation: ~20 seconds

### Full Integration Testing
- 17 endpoints: ~5 minutes
- With edge cases: ~15 minutes

---

## 🆘 Troubleshooting

### "NEXTAUTH_SECRET is not set"
Solution: Add to .env:
```env
NEXTAUTH_SECRET="your-secret-min-32-chars"
```

### "Cannot find module '@prisma/client'"
Solution:
```bash
bun run db:generate
```

### "Database connection failed"
Solution: Check .env DATABASE_URL and ensure PostgreSQL is running

### "401 Unauthorized on /api/agents"
Solution: Ensure you're sending the session cookie in request headers

### "422 Validation failed"
Solution: Check API_DOCUMENTATION.md for required fields

---

## 📞 Quick Help

### Check what files exist
```bash
find src -name "*.ts" | grep -E "(api|lib)"
```

### See all routes
```bash
find src/app/api -name "route.ts"
```

### List database models
```bash
grep "^model " prisma/schema.prisma
```

### View validation schemas
```bash
grep "Schema" src/lib/validators.ts
```

---

## 🚀 Next Steps

1. **Today**: Get database working
2. **Tomorrow**: Test all endpoints
3. **This Week**: Integrate with frontend
4. **Next Week**: Implement leads & tasks
5. **Following**: Real-time features

---

**Last Updated**: January 6, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0
