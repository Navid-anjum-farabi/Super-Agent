'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Zap, Save, X, Edit2 } from 'lucide-react'
import type { ScoutAgentConfig, Capabilities, PromptTemplates } from '@/types/agent'
import { apiClient } from '@/lib/api-client'

interface ScoutAgentConfigPanelProps {
  agentId?: string
  onSave?: (config: Partial<ScoutAgentConfig>) => void
  onClose?: () => void
}

const defaultConfig = {
  id: 'scout' as const,
  name: 'Scout Agent' as const,
  role: 'Lead Research & Discovery' as const,
  temperature: 0.3,
  description:
    'Proactively identifies and qualifies high-potential leads using advanced search and analysis. Specializes in company research, market intelligence, and opportunity identification.',
  isActive: true,
  apiKeys: {
    openai: '',
    tavily: '',
    anthropic: '',
  },
  promptTemplates: {
    research:
      'Analyze {company} for recent funding, hiring trends, and market opportunities. Focus on {industry} sector.',
    generate:
      'Create detailed profile for {company} including key contacts, recent news, and competitive positioning.',
    update:
      'Update research on {company} with latest developments and identify new opportunities.',
    analyze:
      'Provide comprehensive lead analysis for {leadData} with qualification score.',
    qualify:
      'Evaluate lead potential using BANT criteria and provide actionable recommendations.',
  } as PromptTemplates,
  capabilities: {
    webSearch: true,
    contentGeneration: false,
    dataAnalysis: true,
    voiceProcessing: false,
    crmIntegration: true,
  } as Capabilities,
  lastActivity: new Date().toISOString(),
  performance: {
    tasksCompleted: 0,
    averageTime: 0,
    successRate: 0,
  },
}

export function ScoutAgentConfigPanel({
  agentId = 'scout',
  onSave,
  onClose,
}: ScoutAgentConfigPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState(defaultConfig)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await apiClient.put(`/api/agents/${agentId}/config`, {
        name: config.name,
        role: config.role,
        temperature: config.temperature,
        description: config.description,
        isActive: config.isActive,
      })

      if (result.success) {
        setIsEditing(false)
        onSave?.(config)
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const updateCapability = (key: string, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [key]: value,
      } as Capabilities,
    }))
  }

  const updateApiKey = (service: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [service]: value,
      },
    }))
  }

  const updatePromptTemplate = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      promptTemplates: {
        ...prev.promptTemplates,
        [key]: value,
      } as PromptTemplates,
    }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {config.name}
            </CardTitle>
            <CardDescription>{config.role}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={config.isActive ? 'default' : 'secondary'}
              className="capitalize"
            >
              {config.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            </TabsList>

            {/* Identity Tab - Agent's Core Identity */}
            <TabsContent value="identity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value as typeof config.name })}
                    disabled={!isEditing}
                    placeholder="Scout Agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={config.role}
                    onValueChange={(value) => updateConfig({ role: value as typeof config.role })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Research & Discovery">
                        Lead Research & Discovery
                      </SelectItem>
                      <SelectItem value="Aggressive Lead Hunter">
                        Aggressive Lead Hunter
                      </SelectItem>
                      <SelectItem value="Market Research Specialist">
                        Market Research Specialist
                      </SelectItem>
                      <SelectItem value="Lead Qualification Expert">
                        Lead Qualification Expert
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) =>
                      updateConfig({ description: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Describe this agent's primary function and capabilities..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">
                      Temperature (Creativity): {config.temperature.toFixed(1)}
                    </Label>
                    {isEditing && (
                      <span className="text-sm text-muted-foreground">
                        {config.temperature < 0.4
                          ? 'Factual'
                          : config.temperature < 0.7
                            ? 'Balanced'
                            : 'Creative'}
                      </span>
                    )}
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[config.temperature]}
                    onValueChange={(value) =>
                      updateConfig({ temperature: value[0] })
                    }
                    disabled={!isEditing}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Factual</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Agent Status</Label>
                    <Switch
                      id="active"
                      checked={config.isActive}
                      onCheckedChange={(checked) =>
                        updateConfig({ isActive: checked })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ℹ️ Keep your API keys secure. They are encrypted and never
                  shared.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={config.apiKeys.openai || ''}
                    onChange={(e) => updateApiKey('openai', e.target.value)}
                    disabled={!isEditing}
                    placeholder="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tavily-key">Tavily Search API Key</Label>
                  <Input
                    id="tavily-key"
                    type="password"
                    value={config.apiKeys.tavily || ''}
                    onChange={(e) => updateApiKey('tavily', e.target.value)}
                    disabled={!isEditing}
                    placeholder="tvly-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    value={config.apiKeys.anthropic || ''}
                    onChange={(e) => updateApiKey('anthropic', e.target.value)}
                    disabled={!isEditing}
                    placeholder="sk-ant-..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Prompt Templates Tab */}
            <TabsContent value="prompts" className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg mb-4">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  💡 Use {'{'}field{'}'} placeholders for dynamic content
                  injection.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(config.promptTemplates).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`prompt-${key}`} className="capitalize">
                      {key} Prompt Template
                    </Label>
                    <Textarea
                      id={`prompt-${key}`}
                      value={value || ''}
                      onChange={(e) =>
                        updatePromptTemplate(key, e.target.value)
                      }
                      disabled={!isEditing}
                      rows={4}
                      placeholder={`Enter ${key} prompt template...`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Capabilities Tab */}
            <TabsContent value="capabilities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.capabilities).map(([key, value]) => (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getCapabilityDescription(key)}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          updateCapability(key, checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold">
                {config.performance.tasksCompleted}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Time</p>
              <p className="text-2xl font-bold">
                {config.performance.averageTime.toFixed(1)}s
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {(config.performance.successRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getCapabilityDescription(capability: string): string {
  const descriptions: Record<string, string> = {
    webSearch: 'Search the web for company information and leads',
    contentGeneration: 'Generate personalized content and templates',
    dataAnalysis: 'Analyze data and provide insights',
    voiceProcessing: 'Process and transcribe voice data',
    crmIntegration: 'Integrate with CRM systems',
  }
  return descriptions[capability] || 'Agent capability'
}

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save via API
      const result = await apiClient.put(`/api/agents/${agentId}/config`, {
        name: config.name,
        role: config.role,
        temperature: config.temperature,
        description: config.description,
        isActive: config.isActive,
      })

      if (result.success) {
        setIsEditing(false)
        onSave?.(config)
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (updates: Partial<Partial<ScoutAgentConfig>>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const updateCapability = (key: string, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [key]: value,
      },
    }))
  }

  const updateApiKey = (service: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [service]: value,
      },
    }))
  }

  const updatePromptTemplate = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      promptTemplates: {
        ...prev.promptTemplates,
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {config.name}
            </CardTitle>
            <CardDescription>{config.role}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={config.isActive ? 'default' : 'secondary'}
              className="capitalize"
            >
              {config.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            </TabsList>

            {/* Identity Tab - Agent's Core Identity */}
            <TabsContent value="identity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Scout Agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={config.role}
                    onValueChange={(value) => updateConfig({ role: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Research & Discovery">
                        Lead Research & Discovery
                      </SelectItem>
                      <SelectItem value="Aggressive Lead Hunter">
                        Aggressive Lead Hunter
                      </SelectItem>
                      <SelectItem value="Market Research Specialist">
                        Market Research Specialist
                      </SelectItem>
                      <SelectItem value="Lead Qualification Expert">
                        Lead Qualification Expert
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) =>
                      updateConfig({ description: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Describe this agent's primary function and capabilities..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">
                      Temperature (Creativity): {config.temperature.toFixed(1)}
                    </Label>
                    {isEditing && (
                      <span className="text-sm text-muted-foreground">
                        {config.temperature < 0.4
                          ? 'Factual'
                          : config.temperature < 0.7
                            ? 'Balanced'
                            : 'Creative'}
                      </span>
                    )}
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[config.temperature]}
                    onValueChange={(value) =>
                      updateConfig({ temperature: value[0] })
                    }
                    disabled={!isEditing}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Factual</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Agent Status</Label>
                    <Switch
                      id="active"
                      checked={config.isActive}
                      onCheckedChange={(checked) =>
                        updateConfig({ isActive: checked })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ℹ️ Keep your API keys secure. They are encrypted and never
                  shared.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={config.apiKeys.openai || ''}
                    onChange={(e) => updateApiKey('openai', e.target.value)}
                    disabled={!isEditing}
                    placeholder="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tavily-key">Tavily Search API Key</Label>
                  <Input
                    id="tavily-key"
                    type="password"
                    value={config.apiKeys.tavily || ''}
                    onChange={(e) => updateApiKey('tavily', e.target.value)}
                    disabled={!isEditing}
                    placeholder="tvly-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    value={config.apiKeys.anthropic || ''}
                    onChange={(e) => updateApiKey('anthropic', e.target.value)}
                    disabled={!isEditing}
                    placeholder="sk-ant-..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Prompt Templates Tab */}
            <TabsContent value="prompts" className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg mb-4">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  💡 Use {'{'}field{'}'} placeholders for dynamic content
                  injection.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(config.promptTemplates).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`prompt-${key}`} className="capitalize">
                      {key} Prompt Template
                    </Label>
                    <Textarea
                      id={`prompt-${key}`}
                      value={value || ''}
                      onChange={(e) =>
                        updatePromptTemplate(key, e.target.value)
                      }
                      disabled={!isEditing}
                      rows={4}
                      placeholder={`Enter ${key} prompt template...`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Capabilities Tab */}
            <TabsContent value="capabilities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.capabilities).map(([key, value]) => (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getCapabilityDescription(key)}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          updateCapability(key, checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold">
                {config.performance.tasksCompleted}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Time</p>
              <p className="text-2xl font-bold">
                {config.performance.averageTime.toFixed(1)}s
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {(config.performance.successRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getCapabilityDescription(capability: string): string {
  const descriptions: Record<string, string> = {
    webSearch: 'Search the web for company information and leads',
    contentGeneration: 'Generate personalized content and templates',
    dataAnalysis: 'Analyze data and provide insights',
    voiceProcessing: 'Process and transcribe voice data',
    crmIntegration: 'Integrate with CRM systems',
  }
  return descriptions[capability] || 'Agent capability'
}
