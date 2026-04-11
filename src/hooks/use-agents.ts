'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateAgentInput, UpdateAgentInput } from '@/lib/validators'

// Types matching Prisma schema + relations
export interface AgentConfig {
  id: string
  agentId: string
  temperature: number
  maxTokens: number | null
  topP: number | null
  frequencyPenalty: number | null
  presencePenalty: number | null
}

export interface ApiKey {
  id: string
  agentId: string
  service: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PromptTemplate {
  id: string
  agentId: string
  name: string
  type: string
  template: string
  description: string | null
}

export interface AgentCapability {
  id: string
  agentId: string
  name: string
  description: string | null
  isActive: boolean
}

export interface AgentPerformance {
  id: string
  agentId: string
  tasksCompleted: number
  successRate: number
  avgResponseTime: number
  lastUpdated: string
}

export interface Agent {
  id: string
  userId: string
  name: string
  type: 'scout' | 'ghostwriter' | 'secretary'
  role: string | null
  description: string | null
  status: 'active' | 'inactive'
  isActive: boolean
  lastActivity: string | null
  createdAt: string
  updatedAt: string
  config: AgentConfig | null
  apiKeys: ApiKey[]
  promptTemplates: PromptTemplate[]
  capabilities?: AgentCapability[]
  performance?: AgentPerformance | null
}

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  config: (id: string) => [...agentKeys.detail(id), 'config'] as const,
  apiKeys: (id: string) => [...agentKeys.detail(id), 'apiKeys'] as const,
  capabilities: (id: string) => [...agentKeys.detail(id), 'capabilities'] as const,
  performance: (id: string) => [...agentKeys.detail(id), 'performance'] as const,
}

/**
 * Hook for fetching all agents for the current user
 */
export function useAgents() {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      const result = await apiClient.get<Agent[]>('/api/agents')
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agents')
      }
      return result.data as Agent[]
    },
  })
}

/**
 * Hook for fetching a single agent by ID
 */
export function useAgent(agentId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.detail(agentId || ''),
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required')
      const result = await apiClient.get<Agent>(`/api/agents/${agentId}`)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch agent')
      }
      return result.data as Agent
    },
    enabled: !!agentId,
  })
}

/**
 * Hook for creating a new agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAgentInput) => {
      const result = await apiClient.post<Agent>('/api/agents', data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create agent')
      }
      return result.data as Agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}

/**
 * Hook for updating an agent
 */
export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateAgentInput) => {
      const result = await apiClient.put<Agent>(`/api/agents/${agentId}`, data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update agent')
      }
      return result.data as Agent
    },
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.setQueryData(agentKeys.detail(agentId), updatedAgent)
    },
  })
}

/**
 * Hook for deleting an agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (agentId: string) => {
      const result = await apiClient.delete(`/api/agents/${agentId}`)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete agent')
      }
      return agentId
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.removeQueries({ queryKey: agentKeys.detail(deletedId) })
    },
  })
}

/**
 * Hook for updating agent config
 */
export function useUpdateAgentConfig(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<AgentConfig>) => {
      const result = await apiClient.put<AgentConfig>(
        `/api/agents/${agentId}/config`,
        data
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to update config')
      }
      return result.data as AgentConfig
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) })
      queryClient.invalidateQueries({ queryKey: agentKeys.config(agentId) })
    },
  })
}

/**
 * Hook for managing API keys
 */
export function useAgentApiKeys(agentId: string) {
  return useQuery({
    queryKey: agentKeys.apiKeys(agentId),
    queryFn: async () => {
      const result = await apiClient.get<ApiKey[]>(`/api/agents/${agentId}/api-keys`)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch API keys')
      }
      return result.data as ApiKey[]
    },
    enabled: !!agentId,
  })
}

export function useCreateApiKey(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { service: string; key: string }) => {
      const result = await apiClient.post<ApiKey>(
        `/api/agents/${agentId}/api-keys`,
        data
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to create API key')
      }
      return result.data as ApiKey
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.apiKeys(agentId) })
    },
  })
}

export function useDeleteApiKey(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (keyId: string) => {
      const result = await apiClient.delete(`/api/agents/${agentId}/api-keys/${keyId}`)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete API key')
      }
      return keyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.apiKeys(agentId) })
    },
  })
}

/**
 * Hook for managing agent capabilities
 */
export function useAgentCapabilities(agentId: string) {
  return useQuery({
    queryKey: agentKeys.capabilities(agentId),
    queryFn: async () => {
      const result = await apiClient.get<AgentCapability[]>(
        `/api/agents/${agentId}/capabilities`
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch capabilities')
      }
      return result.data as AgentCapability[]
    },
    enabled: !!agentId,
  })
}

export function useUpdateCapability(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; isActive: boolean }) => {
      const result = await apiClient.put<AgentCapability>(
        `/api/agents/${agentId}/capabilities`,
        data
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to update capability')
      }
      return result.data as AgentCapability
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.capabilities(agentId) })
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) })
    },
  })
}

/**
 * Hook for fetching agent performance
 */
export function useAgentPerformance(agentId: string) {
  return useQuery({
    queryKey: agentKeys.performance(agentId),
    queryFn: async () => {
      const result = await apiClient.get<AgentPerformance>(
        `/api/agents/${agentId}/performance`
      )
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch performance')
      }
      return result.data as AgentPerformance
    },
    enabled: !!agentId,
  })
}
