import { useState, useCallback } from 'react'
import type { ScoutAgentConfig } from '@/types/agent'
import { apiClient } from '@/lib/api-client'

interface UseScoutAgentOptions {
  agentId?: string
  onError?: (error: string) => void
  onSuccess?: (config: ScoutAgentConfig) => void
}

export function useScoutAgent({
  agentId = 'scout',
  onError,
  onSuccess,
}: UseScoutAgentOptions = {}) {
  const [config, setConfig] = useState<ScoutAgentConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load Scout Agent configuration from API
   */
  const loadConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.get<ScoutAgentConfig>(
        `/api/agents/${agentId}/config`
      )
      if (result.success && result.data) {
        setConfig(result.data as ScoutAgentConfig)
        onSuccess?.(result.data as ScoutAgentConfig)
      } else {
        const errorMsg = result.error || 'Failed to load configuration'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [agentId, onError, onSuccess])

  /**
   * Save Scout Agent configuration to API
   */
  const saveConfig = useCallback(
    async (updatedConfig: Partial<ScoutAgentConfig>) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiClient.put<ScoutAgentConfig>(
          `/api/agents/${agentId}/config`,
          updatedConfig
        )
        if (result.success && result.data) {
          setConfig(result.data as ScoutAgentConfig)
          onSuccess?.(result.data as ScoutAgentConfig)
          return result.data
        } else {
          const errorMsg = result.error || 'Failed to save configuration'
          setError(errorMsg)
          onError?.(errorMsg)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMsg)
        onError?.(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [agentId, onError, onSuccess]
  )

  /**
   * Update API key for Scout Agent
   */
  const updateApiKey = useCallback(
    async (service: string, apiKey: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiClient.post(
          `/api/agents/${agentId}/api-keys`,
          { service, apiKey }
        )
        if (result.success) {
          setError(null)
          return true
        } else {
          const errorMsg = result.error || 'Failed to update API key'
          setError(errorMsg)
          onError?.(errorMsg)
          return false
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMsg)
        onError?.(errorMsg)
        return false
      } finally {
        setLoading(false)
      }
    },
    [agentId, onError]
  )

  /**
   * Test Scout Agent with sample lead data
   */
  const testAgent = useCallback(async (testData: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.post(`/api/agents/scout/analyze`, testData)
      if (result.success) {
        return result.data
      } else {
        const errorMsg = result.error || 'Test failed'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [onError])

  /**
   * Activate Scout Agent
   */
  const activate = useCallback(async () => {
    return saveConfig({ isActive: true })
  }, [saveConfig])

  /**
   * Deactivate Scout Agent
   */
  const deactivate = useCallback(async () => {
    return saveConfig({ isActive: false })
  }, [saveConfig])

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateApiKey,
    testAgent,
    activate,
    deactivate,
  }
}
