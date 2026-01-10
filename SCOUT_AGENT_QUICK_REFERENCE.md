# Scout Agent - Quick Reference

## 📦 Components

### 1. ScoutAgentConfigPanel
Full-featured configuration panel with all tabs (Identity, API Keys, Prompts, Capabilities)

```tsx
import { ScoutAgentConfigPanel } from '@/components/agent-management/scout-agent-config'

<ScoutAgentConfigPanel
  agentId="scout"
  onSave={(config) => handleSave(config)}
  onClose={() => handleClose()}
/>
```

### 2. AgentIdentityPanel
Display agent identity and configuration overview (read-only or editable)

```tsx
import { AgentIdentityPanel } from '@/components/agent-management/agent-identity-panel'

<AgentIdentityPanel
  identity={agentIdentity}
  config={agentConfig}
  isEditing={false}
  onUpdate={(updates) => handleUpdate(updates)}
  onEdit={(enable) => setEditing(enable)}
/>
```

---

## 🪝 Hooks

### useScoutAgent
React hook for managing Scout Agent configuration and state

```tsx
import { useScoutAgent } from '@/hooks/use-scout-agent'

const {
  config,              // Current configuration
  loading,             // Loading state
  error,               // Error message
  loadConfig,          // Load config from API
  saveConfig,          // Save config to API
  updateApiKey,        // Update specific API key
  testAgent,           // Test agent with data
  activate,            // Activate agent
  deactivate,          // Deactivate agent
} = useScoutAgent({
  agentId: 'scout',
  onError: (error) => console.error(error),
  onSuccess: (config) => console.log('Success:', config),
})
```

---

## 🧬 Types

### AgentConfig
Base interface for any agent

```typescript
interface AgentConfig {
  id: string
  name: string
  role: string
  temperature: number
  description: string
  isActive: boolean
  apiKeys: ApiKeys
  promptTemplates: PromptTemplates
  capabilities: Capabilities
  lastActivity: string
  performance: Performance
}
```

### ScoutAgentConfig
Scout-specific configuration (extends AgentConfig)

```typescript
interface ScoutAgentConfig extends AgentConfig {
  id: 'scout'
  name: 'Scout Agent'
  role: 'Lead Research & Discovery'
}
```

---

## 🌐 API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/agents/scout/config` | Get current configuration |
| `PUT` | `/api/agents/scout/config` | Update configuration |
| `POST` | `/api/agents/scout/api-keys` | Update API key |
| `POST` | `/api/agents/scout/analyze` | Analyze a lead |
| `POST` | `/api/agents/scout/research` | Research a company |
| `POST` | `/api/agents/scout/qualify` | Qualify a lead |

---

## 💡 Common Patterns

### Load and Display Configuration
```tsx
'use client'
import { useEffect } from 'react'
import { useScoutAgent } from '@/hooks/use-scout-agent'
import { ScoutAgentConfigPanel } from '@/components/agent-management/scout-agent-config'

export function ConfigView() {
  const { config, loadConfig } = useScoutAgent()

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  if (!config) return <div>Loading...</div>

  return <ScoutAgentConfigPanel config={config} />
}
```

### Update Configuration
```tsx
const { saveConfig, error } = useScoutAgent()

const handleUpdate = async () => {
  const result = await saveConfig({
    temperature: 0.4,
    isActive: true,
  })
  
  if (result) {
    console.log('Updated successfully')
  } else {
    console.error('Update failed:', error)
  }
}
```

### Test Scout Agent
```tsx
const { testAgent, loading } = useScoutAgent()

const handleTest = async () => {
  const result = await testAgent({
    leadId: 'lead-123',
    action: 'analyze',
  })
  
  if (result) {
    console.log('Analysis:', result)
  }
}
```

### Update API Key
```tsx
const { updateApiKey, loading } = useScoutAgent()

const handleApiKeyUpdate = async () => {
  const success = await updateApiKey('tavily', 'tvly-new-key')
  
  if (success) {
    console.log('API key updated')
  }
}
```

---

## 🎯 Configuration Defaults

```typescript
// Scout Agent Defaults
{
  temperature: 0.3,                    // Factual & accurate
  maxTokens: 3000,                     // Detailed responses
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
}

// Capabilities Enabled
{
  webSearch: true,                     // Search for company info
  contentGeneration: false,            // Not needed for Scout
  dataAnalysis: true,                  // Analyze lead data
  voiceProcessing: false,              // Not needed for Scout
  crmIntegration: true,                // Integrate with CRM
}

// Required API Keys
{
  openai: string                       // REQUIRED
  tavily: string                       // REQUIRED
  anthropic: string                    // OPTIONAL
}
```

---

## 📊 Performance Monitoring

```typescript
// Access performance metrics
const { config } = useScoutAgent()

const metrics = config?.performance
console.log(`Tasks Completed: ${metrics?.tasksCompleted}`)
console.log(`Average Time: ${metrics?.averageTime}s`)
console.log(`Success Rate: ${(metrics?.successRate * 100).toFixed(0)}%`)
```

---

## 🚨 Error Handling

```typescript
const { error } = useScoutAgent({
  onError: (errorMsg) => {
    // Handle error
    toast.error(errorMsg)
    logError(errorMsg)
  },
})

// Check error state
if (error) {
  return <div className="error">{error}</div>
}
```

---

## 📝 Prompt Template Variables

Available placeholders in prompt templates:

| Placeholder | Example | Usage |
|-------------|---------|-------|
| `{company}` | "Acme Corp" | Company name |
| `{industry}` | "SaaS" | Industry sector |
| `{leadData}` | "Company: X, Revenue: Y" | Lead information |
| `{metric}` | "growth rate" | Specific metric |
| `{timeframe}` | "Q4 2024" | Time period |

---

## 🔐 Security Best Practices

✅ **DO:**
- Store API keys in environment variables
- Rotate keys every 90 days
- Use separate keys for dev/prod
- Validate API keys before saving
- Log API usage

❌ **DON'T:**
- Commit API keys to git
- Share keys in Slack/Email
- Use same key for multiple services
- Hardcode keys in components
- Leave keys in browser console

---

## 📚 Related Files

- Type definitions: [`src/types/agent.ts`](../types/agent.ts)
- API client: [`src/lib/api-client.ts`](../lib/api-client.ts)
- Validators: [`src/lib/validators.ts`](../lib/validators.ts)
- Scout API routes: `src/app/api/agents/scout/`
- Full setup guide: [`SCOUT_AGENT_SETUP.md`](../SCOUT_AGENT_SETUP.md)

---

## 🎓 Examples

### Complete Setup
See [`SCOUT_AGENT_SETUP.md`](../SCOUT_AGENT_SETUP.md) for comprehensive examples

### Live Demo
View the Agent Management component to see Scout Agent in action:
`src/components/agent-management/agent-management.tsx`

---

## ✅ Checklist

- [ ] Import types from `@/types/agent`
- [ ] Import components from `@/components/agent-management`
- [ ] Import hook from `@/hooks/use-scout-agent`
- [ ] Set up environment variables (API keys)
- [ ] Test with sample data
- [ ] Configure temperature for your use case
- [ ] Enable/disable capabilities as needed
- [ ] Monitor performance metrics

**Ready to use!** 🚀
