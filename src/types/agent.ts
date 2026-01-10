/**
 * Agent Configuration Types
 * Defines the complete structure of an Agent's configuration
 */

// API Keys configuration for external services
export interface ApiKeys {
  openai?: string
  anthropic?: string
  tavily?: string
  custom?: string[]
}

// Prompt templates for different agent tasks
export interface PromptTemplates {
  research?: string
  generate?: string
  update?: string
  analyze?: string
  qualify?: string
  [key: string]: string | undefined
}

// Agent capabilities
export interface Capabilities {
  webSearch: boolean
  contentGeneration: boolean
  dataAnalysis: boolean
  voiceProcessing: boolean
  crmIntegration: boolean
  [key: string]: boolean
}

// Performance metrics
export interface Performance {
  tasksCompleted: number
  averageTime: number
  successRate: number
  lastUpdated?: string
}

// Core Agent Configuration
export interface AgentConfig {
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

// Scout Agent specific configuration
export interface ScoutAgentConfig extends AgentConfig {
  id: 'scout'
  name: 'Scout Agent'
  role: 'Lead Research & Discovery'
}

// Agent Persona (display representation)
export interface AgentPersona {
  id: string
  name: string
  role: string
  temperature: number
  description: string
  isActive: boolean
}

// Agent creation input
export interface CreateAgentInput {
  name: string
  type: 'scout' | 'ghostwriter' | 'secretary'
  description?: string
  role?: string
  temperature?: number
}

// Agent update input
export interface UpdateAgentInput {
  name?: string
  description?: string
  role?: string
  temperature?: number
  isActive?: boolean
}

// Agent identity (core attributes)
export interface AgentIdentity {
  name: string
  role: string
  description: string
  icon?: string
  color?: string
}
