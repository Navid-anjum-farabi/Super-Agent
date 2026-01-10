# Scout Agent - Complete Setup & Implementation Guide

## 🎯 Overview

The Scout Agent is your **Lead Research & Discovery** specialist. It proactively identifies and qualifies high-potential leads using advanced search and analysis capabilities, specializing in company research, market intelligence, and opportunity identification.

---

## 🧬 The DNA of an Agent

At the core of every agent is the **`AgentConfig`** interface - a strictly-typed data structure that defines every configurable attribute:

```typescript
interface AgentConfig {
  // Identity
  id: string                          // Unique identifier
  name: string                        // "Scout Agent"
  role: string                        // "Lead Research & Discovery"
  description: string                 // What the agent does
  
  // Behavior
  temperature: number                 // 0.0 (Factual) to 1.0 (Creative)
  isActive: boolean                   // Enable/disable the agent
  
  // Integration
  apiKeys: {
    openai?: string                   // OpenAI for analysis
    tavily?: string                   // Tavily for web search
    anthropic?: string                // Anthropic Claude for reasoning
    custom?: string[]                 // Custom API keys
  }
  
  // Prompts
  promptTemplates: {
    research: string                  // Company research template
    generate: string                  // Content generation template
    update: string                    // Lead update template
    analyze: string                   // Lead analysis template
    qualify: string                   // Lead qualification template
  }
  
  // Capabilities
  capabilities: {
    webSearch: boolean                // Search for company info
    contentGeneration: boolean        // Generate content
    dataAnalysis: boolean             // Analyze data
    voiceProcessing: boolean          // Process voice
    crmIntegration: boolean           // CRM integration
  }
  
  // Tracking
  lastActivity: string                // ISO timestamp
  performance: {
    tasksCompleted: number            // Total tasks
    averageTime: number               // Avg response time (seconds)
    successRate: number               // Success percentage (0-1)
  }
}
```

This architecture ensures **reliability, predictability, and scalability** across your entire agent workforce.

---

## 📋 Configuration Sections

### 1. Identity Tab - Agent's Core Identity

Define who your Scout Agent is:

| Property | Value | Purpose |
|----------|-------|---------|
| **Agent Name** | Scout Agent | Display name in UI |
| **Role** | Lead Research & Discovery | Agent's primary function |
| **Description** | "Proactively identifies..." | What it specializes in |
| **Temperature** | 0.3 (Factual) | Lower = more factual, Higher = more creative |
| **Status** | Active/Inactive | Enable or disable the agent |

**Temperature Guide:**
- **0.0-0.4** (Factual) → Best for research, analysis, factual tasks
- **0.4-0.7** (Balanced) → Good for mixed tasks
- **0.7-1.0** (Creative) → Best for creative writing, ideation

Scout uses **0.3** for highly accurate, fact-based lead research.

---

### 2. API Keys Tab - External Service Integration

Connect your Scout Agent to powerful services:

```typescript
// API Keys Required
{
  openai: "sk-...",           // Required for analysis & reasoning
  tavily: "tvly-...",         // Required for web search capabilities
  anthropic: "sk-ant-..."     // Optional, alternative AI model
}
```

**Best Practices:**
✅ Keep API keys secure - they're encrypted in the database
✅ Use rate-limiting tiers appropriate for your usage
✅ Monitor quota usage regularly
✅ Rotate keys periodically for security

---

### 3. Prompts Tab - Agent Behavior Templates

Define how your Scout Agent thinks and responds:

```typescript
// Prompt Templates with Dynamic Placeholders
{
  research: "Analyze {company} for recent funding, hiring trends, and market opportunities.",
  generate: "Create detailed profile for {company} including key contacts, recent news.",
  update: "Update research on {company} with latest developments.",
  analyze: "Provide comprehensive lead analysis for {leadData} with qualification score.",
  qualify: "Evaluate lead potential using BANT criteria and provide recommendations."
}
```

**Dynamic Placeholders:**
- `{company}` → Company name to research
- `{leadData}` → Lead information to analyze
- `{industry}` → Industry context
- `{metric}` → Specific metric to analyze

---

### 4. Capabilities Tab - Agent Abilities

Toggle the powers your Scout Agent has access to:

| Capability | Scout | Description |
|-----------|-------|-------------|
| 🔍 **Web Search** | ✅ Enabled | Search the web for company info |
| ✍️ **Content Generation** | ❌ Disabled | Generate personalized content |
| 📊 **Data Analysis** | ✅ Enabled | Analyze data and provide insights |
| 🎤 **Voice Processing** | ❌ Disabled | Process and transcribe voice |
| 🔗 **CRM Integration** | ✅ Enabled | Integrate with CRM systems |

---

## 🚀 Using Scout Agent in Components

### Basic Usage

```typescript
import { ScoutAgentConfigPanel } from '@/components/agent-management/scout-agent-config'

export function MyComponent() {
  return (
    <ScoutAgentConfigPanel
      agentId="scout"
      onSave={(config) => console.log('Saved:', config)}
      onClose={() => console.log('Closed')}
    />
  )
}
```

### Using the Hook

```typescript
'use client'

import { useScoutAgent } from '@/hooks/use-scout-agent'

export function ConfigManager() {
  const {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateApiKey,
    testAgent,
  } = useScoutAgent({
    onError: (error) => console.error(error),
    onSuccess: (config) => console.log('Updated:', config),
  })

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Save configuration
  const handleSave = async () => {
    await saveConfig({
      temperature: 0.3,
      isActive: true,
    })
  }

  // Update API key
  const handleApiKeyUpdate = async () => {
    const success = await updateApiKey('tavily', 'tvly-...')
    if (success) console.log('API key updated')
  }

  // Test the agent
  const handleTest = async () => {
    const result = await testAgent({
      leadId: 'lead-123',
      action: 'analyze',
    })
    console.log('Test result:', result)
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {config && (
        <div>
          <p>Agent: {config.name}</p>
          <p>Temperature: {config.temperature}</p>
          <button onClick={handleSave}>Save Config</button>
          <button onClick={handleApiKeyUpdate}>Update API Key</button>
          <button onClick={handleTest}>Test Agent</button>
        </div>
      )}
    </div>
  )
}
```

### Agent Identity Panel

```typescript
import { AgentIdentityPanel } from '@/components/agent-management/agent-identity-panel'

export function IdentityDisplay() {
  const identity = {
    name: 'Scout Agent',
    role: 'Lead Research & Discovery',
    description: 'Proactively identifies and qualifies high-potential leads...',
  }

  return (
    <AgentIdentityPanel
      identity={identity}
      config={scoutConfig}
      isEditing={false}
      onUpdate={(updates) => console.log('Updated:', updates)}
      onEdit={(enabled) => console.log('Editing:', enabled)}
    />
  )
}
```

---

## 🔌 API Endpoints

### Get Scout Agent Config

```bash
GET /api/agents/scout/config
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "scout",
    "name": "Scout Agent",
    "temperature": 0.3,
    "apiKeys": {...},
    "capabilities": {...},
    ...
  }
}
```

### Update Scout Agent Config

```bash
PUT /api/agents/scout/config
Authorization: Bearer <token>

Body:
{
  "temperature": 0.4,
  "isActive": true,
  "description": "New description..."
}

Response:
{
  "success": true,
  "data": { updated config }
}
```

### Test Scout Agent

```bash
POST /api/agents/scout/analyze
Authorization: Bearer <token>

Body:
{
  "leadId": "lead-123",
  "action": "analyze" | "research" | "qualify"
}

Response:
{
  "success": true,
  "data": {
    "id": "lead-123",
    "status": "analyzed",
    "confidence": 94,
    "insights": {...},
    "recommendations": [...]
  }
}
```

---

## 📊 Performance Metrics

Your Scout Agent tracks three key metrics:

```typescript
performance: {
  // Total number of tasks completed
  tasksCompleted: number
  
  // Average response time in seconds
  averageTime: number
  
  // Success rate as percentage (0-1)
  successRate: number
}
```

**Optimization Tips:**
- Monitor success rate - aim for >85%
- Average time should be <30s for most tasks
- Scale up if tasksCompleted >1000/day

---

## 🎓 Best Practices

### 1. Temperature Configuration
- Use **0.3** for Scout (factual research)
- Adjust higher (0.5+) if you want more diverse outputs
- Never use >0.8 for analysis tasks

### 2. API Key Management
- ✅ Rotate API keys every 90 days
- ✅ Use separate keys for dev/prod environments
- ✅ Monitor API usage quotas
- ❌ Never commit API keys to version control

### 3. Prompt Templates
- Use clear, structured templates
- Include dynamic placeholders for flexibility
- Test each template with sample data
- Document what each placeholder expects

### 4. Capabilities
- Enable only what Scout needs
- Disable unused capabilities to reduce latency
- Review and optimize based on actual usage

### 5. Error Handling
```typescript
const result = await apiClient.post('/api/agents/scout/analyze', data)

if (!result.success) {
  console.error('Scout Agent Error:', result.error)
  // Handle error gracefully
} else {
  console.log('Analysis Result:', result.data)
}
```

---

## 🔄 Complete Configuration Example

```typescript
const scoutAgentConfig: ScoutAgentConfig = {
  id: 'scout',
  name: 'Scout Agent',
  role: 'Lead Research & Discovery',
  temperature: 0.3,
  description: 'Proactively identifies and qualifies high-potential leads using advanced search and analysis.',
  isActive: true,
  
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    tavily: process.env.TAVILY_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  },
  
  promptTemplates: {
    research: `Analyze the company {company} for recent funding, hiring trends, and market opportunities. 
               Focus on {industry} sector. Provide insights on their growth trajectory.`,
    generate: `Create detailed company profile for {company} including:
              - Key executives and decision makers
              - Recent news and announcements
              - Competitive positioning
              - Industry standing`,
    analyze: `Evaluate lead {leadData} for potential. 
             Rate on scale 1-100 with specific reasons.
             Include 3 actionable next steps.`,
    qualify: `Apply BANT criteria to qualify lead {leadData}:
             - Budget authority
             - Need assessment
             - Timeline fit
             - Implementation capability`,
  },
  
  capabilities: {
    webSearch: true,
    contentGeneration: false,
    dataAnalysis: true,
    voiceProcessing: false,
    crmIntegration: true,
  },
  
  lastActivity: new Date().toISOString(),
  
  performance: {
    tasksCompleted: 0,
    averageTime: 0,
    successRate: 0,
  },
}
```

---

## 🛠️ Files Created

- 📄 [`src/types/agent.ts`](../../../types/agent.ts) - Type definitions
- 📄 [`src/components/agent-management/scout-agent-config.tsx`](../scout-agent-config.tsx) - Configuration panel
- 📄 [`src/components/agent-management/agent-identity-panel.tsx`](../agent-identity-panel.tsx) - Identity display
- 📄 [`src/hooks/use-scout-agent.ts`](../../../hooks/use-scout-agent.ts) - React hook for Scout Agent
- 📄 [`src/lib/api-client.ts`](../../../lib/api-client.ts) - API client utilities

---

## ✅ Setup Checklist

- [ ] Configure `OPENAI_API_KEY` environment variable
- [ ] Configure `TAVILY_API_KEY` environment variable
- [ ] Set Scout Agent temperature to 0.3
- [ ] Enable required capabilities (webSearch, dataAnalysis)
- [ ] Test Scout Agent with sample leads
- [ ] Monitor performance metrics
- [ ] Set up error alerting for failed tasks
- [ ] Document custom prompt templates used
- [ ] Backup API keys securely

---

## 🎉 You're All Set!

Your Scout Agent is now fully configured with:
- ✅ Type-safe configuration interface
- ✅ Comprehensive configuration panel
- ✅ React hooks for easy integration
- ✅ Full API integration
- ✅ Performance tracking

**Ready to find some leads!** 🚀
