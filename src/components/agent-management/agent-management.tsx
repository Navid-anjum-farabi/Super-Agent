'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Bot, 
  Brain, 
  FileText, 
  Shield, 
  Edit3, 
  Save, 
  Plus, 
  Key,
  Zap,
  Target,
  AlertCircle,
  RefreshCw,
  Loader2,
  Settings
} from 'lucide-react'
import { 
  useAgents, 
  useUpdateAgent, 
  useUpdateAgentConfig,
  useAgentApiKeys,
  useCreateApiKey,
  useAgentCapabilities,
  useUpdateCapability,
  useAgentPerformance,
  type Agent,
  type AgentCapability
} from '@/hooks/use-agents'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

// Capability display config
const capabilityConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  webSearch: { label: 'Web Search', icon: <Target className="h-4 w-4" /> },
  contentGeneration: { label: 'Content Generation', icon: <FileText className="h-4 w-4" /> },
  dataAnalysis: { label: 'Data Analysis', icon: <Brain className="h-4 w-4" /> },
  voiceProcessing: { label: 'Voice Processing', icon: <Shield className="h-4 w-4" /> },
  crmIntegration: { label: 'CRM Integration', icon: <Settings className="h-4 w-4" /> },
}

// Agent type config for icons/colors
const agentTypeConfig: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  scout: { icon: <Zap className="h-4 w-4 text-white" />, bgColor: 'bg-yellow-500' },
  ghostwriter: { icon: <FileText className="h-4 w-4 text-white" />, bgColor: 'bg-blue-500' },
  secretary: { icon: <Shield className="h-4 w-4 text-white" />, bgColor: 'bg-green-500' },
}

// Loading skeleton for agent list
function AgentListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading skeleton for config panel
function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

// Empty state when no agents exist
function EmptyAgentsState({ onCreateAgent }: { onCreateAgent: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        You haven&apos;t created any agents yet. Create your first agent to get started with AI-powered sales automation.
      </p>
      <Button onClick={onCreateAgent}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Agent
      </Button>
    </div>
  )
}

// Error state
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to Load Agents</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{error}</p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

export function AgentManagement() {
  const { toast } = useToast()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Local state for pending edits
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedRole, setEditedRole] = useState('')
  const [editedTemperature, setEditedTemperature] = useState(0.7)

  // Fetch all agents
  const { 
    data: agents, 
    isLoading: agentsLoading, 
    error: agentsError, 
    refetch: refetchAgents 
  } = useAgents()

  // Determine selected agent
  const selectedAgent = useMemo(() => {
    if (!agents?.length) return null
    if (selectedAgentId) {
      return agents.find(a => a.id === selectedAgentId) || agents[0]
    }
    return agents[0]
  }, [agents, selectedAgentId])

  // Auto-select first agent and sync local state
  useEffect(() => {
    if (agents?.length && !selectedAgentId) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  // Sync local edit state when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      setEditedName(selectedAgent.name)
      setEditedDescription(selectedAgent.description || '')
      setEditedRole(selectedAgent.role || '')
      setEditedTemperature(selectedAgent.config?.temperature ?? 0.7)
    }
  }, [selectedAgent])

  // Mutation hooks for selected agent
  const updateAgent = useUpdateAgent(selectedAgent?.id || '')
  const updateConfig = useUpdateAgentConfig(selectedAgent?.id || '')
  
  // Data fetching hooks for selected agent
  const { data: apiKeys, isLoading: apiKeysLoading } = useAgentApiKeys(selectedAgent?.id || '')
  const createApiKey = useCreateApiKey(selectedAgent?.id || '')
  const { data: capabilities, isLoading: capabilitiesLoading } = useAgentCapabilities(selectedAgent?.id || '')
  const updateCapability = useUpdateCapability(selectedAgent?.id || '')
  const { data: performance, isLoading: performanceLoading } = useAgentPerformance(selectedAgent?.id || '')

  // Handle saving changes
  const handleSaveChanges = async () => {
    if (!selectedAgent) return
    
    setIsSaving(true)
    try {
      // Update agent basic info
      await updateAgent.mutateAsync({
        name: editedName,
        description: editedDescription,
      })
      
      // Update config (temperature)
      await updateConfig.mutateAsync({
        temperature: editedTemperature,
      })
      
      toast({
        title: 'Changes saved',
        description: 'Agent configuration has been updated.',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error saving changes',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle capability toggle
  const handleCapabilityToggle = async (capabilityName: string, isActive: boolean) => {
    try {
      await updateCapability.mutateAsync({ name: capabilityName, isActive })
      toast({
        title: 'Capability updated',
        description: `${capabilityConfig[capabilityName]?.label || capabilityName} has been ${isActive ? 'enabled' : 'disabled'}.`,
      })
    } catch (error) {
      toast({
        title: 'Error updating capability',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (isActive: boolean) => {
    if (!selectedAgent) return
    try {
      await updateAgent.mutateAsync({ status: isActive ? 'active' : 'inactive' })
      toast({
        title: isActive ? 'Agent activated' : 'Agent deactivated',
        description: `${selectedAgent.name} is now ${isActive ? 'active' : 'inactive'}.`,
      })
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  // Handle API key save
  const handleApiKeySave = async (service: string, key: string) => {
    if (!key.trim()) return
    try {
      await createApiKey.mutateAsync({ service, key })
      toast({
        title: 'API key saved',
        description: `${service} API key has been configured.`,
      })
    } catch (error) {
      toast({
        title: 'Error saving API key',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  // Format last activity time
  const formatLastActivity = (date: string | null) => {
    if (!date) return 'Never'
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  // Loading state
  if (agentsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Agent Management</h1>
            <p className="text-muted-foreground">Configure and manage your AI agents</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgentListSkeleton />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <ConfigSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (agentsError) {
    return (
      <div className="p-6">
        <ErrorState 
          error={agentsError instanceof Error ? agentsError.message : 'Failed to load agents'} 
          onRetry={() => refetchAgents()} 
        />
      </div>
    )
  }

  // Empty state
  if (!agents?.length) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">Configure and manage your AI agents</p>
        </div>
        <EmptyAgentsState onCreateAgent={() => {
          toast({ title: 'Coming soon', description: 'Agent creation will be available soon.' })
        }} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">Configure and manage your AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchAgents()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isEditing ? (
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Mode
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agents.map((agent) => {
                const typeConfig = agentTypeConfig[agent.type] || agentTypeConfig.scout
                return (
                  <Button
                    key={agent.id}
                    variant={selectedAgent?.id === agent.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-auto p-3 ${selectedAgent?.id === agent.id ? 'border-2' : ''}`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeConfig.bgColor}`}>
                        {typeConfig.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role || agent.type}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatLastActivity(agent.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration */}
        {selectedAgent && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {agentTypeConfig[selectedAgent.type]?.icon}
                  {selectedAgent.name}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedAgent.status === 'active'}
                    onCheckedChange={handleStatusToggle}
                    disabled={updateAgent.isPending}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedAgent.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="agent-name">Agent Name</Label>
                        <Input
                          id="agent-name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="agent-role">Role</Label>
                        <Select
                          value={editedRole}
                          onValueChange={setEditedRole}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lead Research & Discovery">Lead Research & Discovery</SelectItem>
                            <SelectItem value="Content Generation & Personalization">Content Generation & Personalization</SelectItem>
                            <SelectItem value="Administrative & CRM Management">Administrative & CRM Management</SelectItem>
                            <SelectItem value="Data Analysis & Insights">Data Analysis & Insights</SelectItem>
                            <SelectItem value="Customer Support & Engagement">Customer Support & Engagement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="temperature">
                          Temperature: {editedTemperature.toFixed(1)}
                        </Label>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[editedTemperature]}
                          onValueChange={(value) => setEditedTemperature(value[0])}
                          disabled={!isEditing}
                          className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Factual</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Describe what this agent does..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="capabilities" className="space-y-6 mt-4">
                  {capabilitiesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {capabilities?.map((cap) => {
                        const config = capabilityConfig[cap.name] || { 
                          label: cap.name, 
                          icon: <Settings className="h-4 w-4" /> 
                        }
                        return (
                          <div 
                            key={cap.id} 
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className={`flex items-center gap-2 ${cap.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              {config.icon}
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <Switch
                              checked={cap.isActive}
                              onCheckedChange={(checked) => handleCapabilityToggle(cap.name, checked)}
                              disabled={updateCapability.isPending}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 mt-4">
                  {performanceLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {performance?.tasksCompleted || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Tasks Completed</div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(performance?.avgResponseTime || 0).toFixed(1)}s
                          </div>
                          <div className="text-sm text-muted-foreground">Avg. Response Time</div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {(performance?.successRate || 0).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* API Configuration Section */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configure API keys for external services. Keys are encrypted and stored securely.
              </p>
              
              {apiKeysLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show configured keys */}
                  {apiKeys?.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{key.service}</span>
                      </div>
                      <Badge variant="secondary">Configured</Badge>
                    </div>
                  ))}
                  
                  {/* Add new key form - simplified for now */}
                  {isEditing && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Add new API keys by entering the service name and key value below.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <Input placeholder="Service name (e.g., openai)" id="new-service" />
                        <Input placeholder="API key" type="password" id="new-key" />
                      </div>
                      <Button 
                        className="mt-3" 
                        size="sm"
                        onClick={() => {
                          const service = (document.getElementById('new-service') as HTMLInputElement)?.value
                          const key = (document.getElementById('new-key') as HTMLInputElement)?.value
                          if (service && key) {
                            handleApiKeySave(service, key)
                          }
                        }}
                        disabled={createApiKey.isPending}
                      >
                        {createApiKey.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add API Key
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
