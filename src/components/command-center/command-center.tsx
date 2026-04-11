'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { 
  Key, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Upload,
  FileText,
  Globe,
  Brain,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { 
  useAgents, 
  useUpdateAgent,
  useUpdateAgentConfig,
  useAgentApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  type Agent
} from '@/hooks/use-agents'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

// Status styling
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  invalid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="h-4 w-4" />,
  expired: <XCircle className="h-4 w-4" />,
  invalid: <XCircle className="h-4 w-4" />,
  processing: <Brain className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />
}

// Mock knowledge items (will be replaced with API when KnowledgeItem model is added)
const mockKnowledgeItems = [
  {
    id: '1',
    title: 'Competitive Analysis 2024',
    type: 'pdf' as const,
    status: 'completed' as const,
    uploadDate: '2 days ago',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Sales Playbook Q3',
    type: 'docx' as const,
    status: 'processing' as const,
    uploadDate: '1 hour ago',
    size: '1.1 MB'
  },
  {
    id: '3',
    title: 'Industry News Feed',
    type: 'url' as const,
    status: 'completed' as const,
    uploadDate: '3 days ago',
    url: 'https://techcrunch.com/tag/sales'
  }
]

// API Vault Tab Component
function APIVaultTab({ 
  agents, 
  selectedAgentId, 
  onSelectAgent 
}: { 
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (id: string) => void
}) {
  const { toast } = useToast()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newService, setNewService] = useState('')
  const [newKey, setNewKey] = useState('')
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const { data: apiKeys, isLoading: apiKeysLoading, refetch } = useAgentApiKeys(selectedAgentId || '')
  const createApiKey = useCreateApiKey(selectedAgentId || '')
  const deleteApiKey = useDeleteApiKey(selectedAgentId || '')

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const handleAddKey = async () => {
    if (!newService.trim() || !newKey.trim()) {
      toast({ title: 'Error', description: 'Please enter service name and API key', variant: 'destructive' })
      return
    }
    
    try {
      await createApiKey.mutateAsync({ service: newService, key: newKey })
      toast({ title: 'API key added', description: `${newService} API key has been configured.` })
      setNewService('')
      setNewKey('')
    } catch (error) {
      toast({ 
        title: 'Error adding API key', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteKey = async (keyId: string, service: string) => {
    try {
      await deleteApiKey.mutateAsync(keyId)
      toast({ title: 'API key deleted', description: `${service} API key has been removed.` })
    } catch (error) {
      toast({ 
        title: 'Error deleting API key', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedAgentId || ''} onValueChange={onSelectAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedAgentId ? (
          <div className="text-center py-8 text-muted-foreground">
            Select an agent to manage its API keys
          </div>
        ) : apiKeysLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys?.map((apiKey) => (
              <div key={apiKey.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apiKey.service}</h3>
                      <p className="text-sm text-muted-foreground">
                        Added {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[apiKey.status]}>
                      <div className="flex items-center gap-1">
                        {statusIcons[apiKey.status]}
                        {apiKey.status}
                      </div>
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteKey(apiKey.id, apiKey.service)}
                      disabled={deleteApiKey.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm">API Key:</Label>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type={showKeys[apiKey.id] ? 'text' : 'password'}
                      value="••••••••••••••••••••••••"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new key form */}
            <div className="p-4 border rounded-lg border-dashed bg-muted/30">
              <h4 className="font-medium mb-3">Add New API Key</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input
                    id="service-name"
                    placeholder="e.g., OpenAI, Anthropic, Tavily"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="mt-4" 
                onClick={handleAddKey}
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

            {apiKeys?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No API keys configured for this agent. Add one above.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Agent Personas Tab Component  
function AgentPersonasTab({ agents, refetch }: { agents: Agent[]; refetch: () => void }) {
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, any>>({})

  const handleEdit = (agent: Agent) => {
    setEditingId(agent.id)
    setEditedValues({
      role: agent.role || '',
      description: agent.description || '',
      temperature: agent.config?.temperature ?? 0.7
    })
  }

  const updateAgent = useUpdateAgent(editingId || '')
  const updateConfig = useUpdateAgentConfig(editingId || '')

  const handleSave = async (agentId: string) => {
    try {
      await updateAgent.mutateAsync({
        description: editedValues.description,
      })
      await updateConfig.mutateAsync({
        temperature: editedValues.temperature,
      })
      toast({ title: 'Persona updated', description: 'Agent persona has been saved.' })
      setEditingId(null)
      refetch()
    } catch (error) {
      toast({ 
        title: 'Error saving persona', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  // Status toggle is handled via the Edit flow for now
  // TODO: Add inline status toggle with proper hook usage

  return (
    <div className="space-y-6">
      {agents.map((agent) => {
        const isEditing = editingId === agent.id
        return (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {agent.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleSave(agent.id)}
                        disabled={updateAgent.isPending || updateConfig.isPending}
                      >
                        {(updateAgent.isPending || updateConfig.isPending) ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(agent)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`role-${agent.id}`}>Role</Label>
                    <Select
                      value={isEditing ? editedValues.role : (agent.role || '')}
                      onValueChange={(value) => setEditedValues(prev => ({ ...prev, role: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aggressive Lead Hunter">Aggressive Lead Hunter</SelectItem>
                        <SelectItem value="Conservative Researcher">Conservative Researcher</SelectItem>
                        <SelectItem value="Creative Copywriter">Creative Copywriter</SelectItem>
                        <SelectItem value="Professional Communicator">Professional Communicator</SelectItem>
                        <SelectItem value="Detail-Oriented Administrator">Detail-Oriented Administrator</SelectItem>
                        <SelectItem value="Strategic Planner">Strategic Planner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`temp-${agent.id}`}>
                      Temperature: {isEditing ? editedValues.temperature?.toFixed(1) : (agent.config?.temperature ?? 0.7).toFixed(1)}
                    </Label>
                    <Slider
                      value={[isEditing ? editedValues.temperature : (agent.config?.temperature ?? 0.7)]}
                      onValueChange={(value) => setEditedValues(prev => ({ ...prev, temperature: value[0] }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-2"
                      disabled={!isEditing}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Factual</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`description-${agent.id}`}>Description</Label>
                    <Textarea
                      id={`description-${agent.id}`}
                      value={isEditing ? editedValues.description : (agent.description || '')}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Knowledge Center Tab Component (still using mock data)
function KnowledgeCenterTab() {
  const { toast } = useToast()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Knowledge Base
          </CardTitle>
          <Button onClick={() => toast({ title: 'Coming soon', description: 'File upload will be available soon.' })}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Knowledge
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Knowledge Center is in development</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
            Full persistence and file upload will be available in a future update.
          </p>
        </div>
        
        <div className="space-y-4">
          {mockKnowledgeItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {item.type === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                    {item.type === 'docx' && <FileText className="h-5 w-5 text-blue-500" />}
                    {item.type === 'url' && <Globe className="h-5 w-5 text-green-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type.toUpperCase()} {item.size && `• ${item.size}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[item.status]}>
                    <div className="flex items-center gap-1">
                      {statusIcons[item.status]}
                      {item.status}
                    </div>
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {item.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Embedding Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
                <span>Uploaded: {item.uploadDate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Command Center Component
export function CommandCenter() {
  const { toast } = useToast()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  
  // Fetch all agents
  const { data: agents, isLoading, error, refetch } = useAgents()

  // Auto-select first agent
  useMemo(() => {
    if (agents?.length && !selectedAgentId) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">Configure your AI agents and system settings</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">Configure your AI agents and system settings</p>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Unable to load agents'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-muted-foreground">Configure your AI agents and system settings</p>
      </div>

      <Tabs defaultValue="api-vault" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-vault" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Vault
          </TabsTrigger>
          <TabsTrigger value="agent-personas" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Agent Personas
          </TabsTrigger>
          <TabsTrigger value="knowledge-center" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Knowledge Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-vault">
          <APIVaultTab 
            agents={agents || []} 
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
          />
        </TabsContent>

        <TabsContent value="agent-personas">
          <AgentPersonasTab agents={agents || []} refetch={refetch} />
        </TabsContent>

        <TabsContent value="knowledge-center">
          <KnowledgeCenterTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
