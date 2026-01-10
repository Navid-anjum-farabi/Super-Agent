# 🤖 Agent Management System Documentation

## 📋 Overview

The Agent Management system provides a comprehensive interface for configuring, monitoring, and managing AI agents in the Super-Agent Sales OS platform. Users can easily switch between agents, customize their behavior, manage API keys, and monitor performance.

## 🎯 Key Features

### 1. **Agent Selection & Overview**
- Visual agent cards with status indicators
- One-click agent switching
- Real-time activity monitoring
- Performance metrics display

### 2. **Agent Configuration**
- **General Settings**: Name, role, description
- **Behavior Controls**: Temperature slider (0.0-1.0)
- **Capability Toggles**: Enable/disable specific features
- **Status Management**: Activate/deactivate agents

### 3. **API Key Management**
- Secure storage of API credentials
- Service-specific key management
- Password-protected input fields
- Key validation and status indicators

### 4. **Prompt Templates**
- Customizable prompt templates
- Role-specific template types
- Quick copy and import functionality
- Template versioning

### 5. **Performance Monitoring**
- Real-time task completion tracking
- Average processing time metrics
- Success rate analytics
- Last activity timestamps

## 🏗️ Architecture

### Component Structure
```
AgentManagement/
├── Agent Selection Sidebar
├── Configuration Panel
│   ├── General Tab
│   ├── Capabilities Tab
│   └── Performance Tab
├── API Management
│   ├── API Keys Tab
│   └── Prompt Templates Tab
└── Action Buttons
    ├── Export Config
    ├── Import Config
    └── Save Changes
```

### Data Flow
```
User Interface → Agent Config State → LocalStorage → API Endpoints → Agent Behavior
        ↓                    ↓                    ↓
    WebSocket Updates ←→ Real-time UI Updates ←→ Performance Metrics
```

## 🎨 UI Components

### Agent Cards
```typescript
interface AgentCardProps {
  agent: AgentConfig
  isSelected: boolean
  onClick: () => void
}

// Visual indicators:
// - Color-coded agent types (Yellow=Scout, Blue=Ghostwriter, Green=Secretary)
// - Status badges (Active/Inactive)
// - Last activity timestamp
// - Performance metrics preview
```

### Configuration Tabs
```typescript
// General Tab
- Agent name (editable)
- Role selection dropdown
- Temperature slider (0.0 = Factual, 1.0 = Creative)
- Description textarea

// Capabilities Tab
- Toggle switches for each capability
- Visual indicators for enabled/disabled
- Capability-specific icons

// Performance Tab
- Tasks completed counter
- Average processing time
- Success rate percentage
- Visual performance charts
```

### API Management
```typescript
// API Keys Section
- Service-specific key inputs
- Password masking by default
- Validation status indicators
- Key strength indicators

// Prompt Templates
- Template type categories
- Custom prompt editor
- Quick action buttons (Copy, Edit, Delete)
- Template preview functionality
```

## 🔧 Technical Implementation

### State Management
```typescript
interface AgentConfig {
  id: string
  name: string
  role: string
  temperature: number
  description: string
  isActive: boolean
  apiKeys: {
    openai?: string
    anthropic?: string
    tavily?: string
    custom?: string[]
  }
  promptTemplates: {
    research: string
    generate: string
    update: string
  }
  capabilities: {
    webSearch: boolean
    contentGeneration: boolean
    dataAnalysis: boolean
    voiceProcessing: boolean
    crmIntegration: boolean
  }
  lastActivity: string
  performance: {
    tasksCompleted: number
    averageTime: number
    successRate: number
  }
}
```

### Configuration Persistence
```typescript
// LocalStorage for user preferences
localStorage.setItem('agent-configs', JSON.stringify(agentConfigs))
localStorage.setItem('selected-agent', selectedAgentId)

// API for saving to backend
const saveAgentConfig = async (config: AgentConfig) => {
  const response = await fetch('/api/agents/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
  return response.json()
}
```

### Real-time Updates
```typescript
// WebSocket integration for live updates
const { agentStatus, sendAgentUpdate } = useWebSocket()

// Listen for agent status changes
useEffect(() => {
  if (agentStatus[selectedAgent]) {
    updateLocalConfig(agentStatus[selectedAgent])
  }
}, [agentStatus])

// Send configuration updates
const updateAgentStatus = (agentId: string, status: string) => {
  sendAgentUpdate(agentId, status)
}
```

## 🎯 User Experience

### Navigation Flow
1. **Agent Selection**: Click agent card → Load configuration
2. **Configuration**: Modify settings → See real-time preview
3. **API Setup**: Add keys → Validate connections
4. **Templates**: Customize prompts → Test with examples
5. **Save**: Export/import → Share configurations

### Responsive Design
- **Desktop**: 3-column layout (sidebar + config + details)
- **Tablet**: 2-column layout (collapsible sidebar)
- **Mobile**: Single column with tabbed interface

### Accessibility Features
- **Keyboard Navigation**: Tab through all controls
- **Screen Reader**: ARIA labels on all interactive elements
- **High Contrast**: Theme compatibility with color blind users
- **Touch Targets**: 44px minimum touch targets

## 🔌 API Integration

### Agent Configuration API
```typescript
// Update agent configuration
PUT /api/agents/:id/config
{
  "name": "Custom Agent Name",
  "role": "Custom Role",
  "temperature": 0.7,
  "capabilities": {
    "webSearch": true,
    "contentGeneration": false
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "agent-id",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### API Key Validation
```typescript
// Validate API key
POST /api/agents/validate-key
{
  "service": "openai",
  "apiKey": "sk-..."
}

// Response
{
  "success": true,
  "data": {
    "valid": true,
    "service": "OpenAI",
    "quota": {
      "used": 150,
      "limit": 1000
    }
  }
}
```

### Performance Metrics API
```typescript
// Get agent performance
GET /api/agents/:id/performance

// Response
{
  "success": true,
  "data": {
    "tasksCompleted": 147,
    "averageTime": 45.2,
    "successRate": 94.5,
    "lastActivity": "2024-01-15T09:45:00Z",
    "trends": {
      "daily": [45, 52, 48, 47],
      "weekly": [320, 345, 378]
    }
  }
}
```

## 🎨 Customization Guide

### Creating New Agent Types
```typescript
// Add new agent type to sidebar
const newAgentType: SidebarItem = {
  id: 'custom-agent',
  label: 'Custom Agent',
  icon: <CustomIcon className="h-4 w-4" />,
  children: [
    { id: 'data-analyst', label: 'Data Analyst', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'content-creator', label: 'Content Creator', icon: <FileText className="h-4 w-4" /> }
  ]
}

// Add to sidebarItems array
```

### Extending Capabilities
```typescript
// Define new capability
interface ExtendedCapabilities extends AgentCapabilities {
  emailIntegration: boolean
  socialMediaManagement: boolean
  analyticsReporting: boolean
}

// Update agent config interface
interface ExtendedAgentConfig extends AgentConfig {
  capabilities: ExtendedCapabilities
}
```

### Custom Prompt Templates
```typescript
// Create custom template categories
interface CustomPromptTemplates {
  onboarding: string
  followup: string
  escalation: string
  reporting: string
}

// Add to prompt templates interface
interface ExtendedAgentConfig extends AgentConfig {
  promptTemplates: CustomPromptTemplates
}
```

## 📱 Mobile Optimization

### Touch-Friendly Interface
```typescript
// Mobile-specific adjustments
const MobileAgentCard = ({ agent, isSelected, onClick }: AgentCardProps) => (
  <div 
    className={`p-4 border rounded-lg cursor-pointer touch-manipulation ${
      isSelected ? 'border-primary' : 'border-border'
    }`}
    onClick={onClick}
    style={{ minHeight: '80px' }} // 44px minimum touch target
  >
    {/* Agent content */}
  </div>
)

// Swipe gestures for agent switching
const useSwipeGestures = () => {
  // Implement swipe left/right for agent navigation
}
```

### Progressive Enhancement
```typescript
// Load basic functionality first
const AgentManagementBasic = () => {
  // Core agent management without advanced features
}

// Enhanced version with animations and advanced features
const AgentManagementEnhanced = () => {
  // Full-featured version with transitions, charts, etc.
}

// Feature detection
const AgentManagementAdaptive = () => {
  const hasAdvancedFeatures = useFeatureDetection()
  return hasAdvancedFeatures ? AgentManagementEnhanced : AgentManagementBasic
}
```

## 🔒 Security Considerations

### API Key Protection
```typescript
// Encrypt API keys in localStorage
const encryptApiKey = (key: string): string => {
  // Use browser's crypto API or external encryption
  return btoa(key) // Basic encoding, use proper encryption in production
}

// Rate limiting for API calls
const rateLimitedApiCall = async (url: string, options: RequestInit) => {
  const lastCall = localStorage.getItem(`last-call-${url}`)
  const now = Date.now()
  
  if (lastCall && now - parseInt(lastCall) < 1000) {
    throw new Error('Rate limit exceeded')
  }
  
  localStorage.setItem(`last-call-${url}`, now.toString())
  return fetch(url, options)
}
```

### Input Validation
```typescript
// Sanitize agent configuration
const validateAgentConfig = (config: Partial<AgentConfig>): AgentConfig => {
  return {
    id: config.id || '',
    name: sanitizeInput(config.name || ''),
    role: sanitizeInput(config.role || ''),
    temperature: Math.max(0, Math.min(1, config.temperature || 0.5)),
    description: sanitizeInput(config.description || ''),
    isActive: Boolean(config.isActive),
    // ... other fields with validation
  }
}

const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .substring(0, 500) // Limit length
}
```

## 📊 Analytics & Monitoring

### Usage Tracking
```typescript
// Track agent usage patterns
interface AgentAnalytics {
  agentId: string
  usage: {
    daily: number
    weekly: number
    monthly: number
  }
  performance: {
    averageResponseTime: number
    errorRate: number
    userSatisfaction: number
  }
  features: {
    mostUsedCapabilities: string[]
    underutilizedFeatures: string[]
  }
}

// Send analytics to monitoring service
const trackAgentUsage = (analytics: AgentAnalytics) => {
  // Send to analytics service
  if (process.env.ANALYTICS_ENDPOINT) {
    fetch(process.env.ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics)
    })
  }
}
```

### Performance Optimization
```typescript
// Lazy load agent configurations
const useLazyAgentConfig = (agentId: string) => {
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/config`)
        const data = await response.json()
        setConfig(data.data)
      } catch (error) {
        console.error('Failed to load agent config:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [agentId])

  return { config, loading }
}
```

---

This Agent Management system provides a powerful, user-friendly interface for configuring and monitoring AI agents, with comprehensive customization options, real-time updates, and robust security measures.