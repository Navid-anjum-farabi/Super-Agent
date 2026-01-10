'use client'

import { useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Brain, 
  FileText, 
  Shield, 
  Settings, 
  Edit3, 
  Save, 
  Trash2, 
  Plus, 
  Key,
  Zap,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'

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

const defaultAgentConfigs: AgentConfig[] = [
  {
    id: 'scout',
    name: 'Scout Agent',
    role: 'Lead Research & Discovery',
    temperature: 0.3,
    description: 'Proactively identifies and qualifies high-potential leads using advanced search and analysis. Specializes in company research, market intelligence, and opportunity identification.',
    isActive: true,
    apiKeys: {
      tavily: 'tvly-...',
      openai: 'sk-...'
    },
    promptTemplates: {
      research: 'Analyze {company} for recent funding, hiring trends, and market opportunities. Focus on {industry} sector.',
      generate: 'Create detailed profile for {company} including key contacts, recent news, and competitive positioning.',
      update: 'Update research on {company} with latest developments and identify new opportunities.'
    },
    capabilities: {
      webSearch: true,
      contentGeneration: false,
      dataAnalysis: true,
      voiceProcessing: false,
      crmIntegration: true
    },
    lastActivity: '2 minutes ago',
    performance: {
      tasksCompleted: 147,
      averageTime: 45,
      successRate: 94
    }
  },
  {
    id: 'ghostwriter',
    name: 'Ghostwriter Agent',
    role: 'Content Generation & Personalization',
    temperature: 0.7,
    description: 'Crafts personalized outreach content with creative flair and persuasive language. Specializes in email generation, social media content, and personalized messaging.',
    isActive: true,
    apiKeys: {
      openai: 'sk-...',
      anthropic: 'sk-ant-...'
    },
    promptTemplates: {
      research: 'Generate personalized email for {prospect} at {company} focusing on {value_proposition}. Use {tone} tone.',
      generate: 'Create compelling outreach content for {campaign} targeting {audience}. Emphasize {key_points}.',
      update: 'Refine content to be more {tone} and focus on {specific_aspect}. Adjust length to {length}.'
    },
    capabilities: {
      webSearch: false,
      contentGeneration: true,
      dataAnalysis: true,
      voiceProcessing: false,
      crmIntegration: true
    },
    lastActivity: '5 minutes ago',
    performance: {
      tasksCompleted: 89,
      averageTime: 32,
      successRate: 87
    }
  },
  {
    id: 'secretary',
    name: 'Secretary Agent',
    role: 'Administrative & CRM Management',
    temperature: 0.1,
    description: 'Manages CRM updates, scheduling, and administrative tasks with precision and reliability. Specializes in data entry, calendar management, and workflow automation.',
    isActive: true,
    apiKeys: {
      openai: 'sk-...', // For transcription
      custom: ['webhook-key-...', 'api-key-...']
    },
    promptTemplates: {
      research: 'Transcribe and summarize meeting with {contact}. Extract action items and follow-up tasks.',
      generate: 'Process voice notes and create structured CRM entry with {contact} information.',
      update: 'Update CRM record for {lead} with {status} and schedule follow-up for {date}.'
    },
    capabilities: {
      webSearch: false,
      contentGeneration: false,
      dataAnalysis: true,
      voiceProcessing: true,
      crmIntegration: true
    },
    lastActivity: '1 minute ago',
    performance: {
      tasksCompleted: 234,
      averageTime: 15,
      successRate: 98
    }
  }
]

export function AgentManagement() {
  const [selectedAgent, setSelectedAgent] = useState<string>('scout')
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(defaultAgentConfigs)
  const [isEditing, setIsEditing] = useState(false)

  const selectedConfig = agentConfigs.find(config => config.id === selectedAgent)

  const updateAgentConfig = (agentId: string, updates: Partial<AgentConfig>) => {
    setAgentConfigs(prev => 
      prev.map(config => 
        config.id === agentId 
          ? { ...config, ...updates }
          : config
      )
    )
  }

  const addCustomPrompt = (agentId: string, type: string) => {
    const prompt = window.prompt('Enter custom prompt template:')
    if (prompt) {
      updateAgentConfig(agentId, {
        promptTemplates: {
          ...selectedConfig?.promptTemplates,
          [type]: prompt
        }
      })
    }
  }

  const getCapabilityIcon = (capability: string, enabled: boolean) => {
    const iconMap: Record<string, any> = {
      webSearch: <Target className="h-4 w-4" />,
      contentGeneration: <FileText className="h-4 w-4" />,
      dataAnalysis: <Brain className="h-4 w-4" />,
      voiceProcessing: <Shield className="h-4 w-4" />,
      crmIntegration: <Settings className="h-4 w-4" />
    }
    
    return (
      <div className={`flex items-center gap-2 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
        {iconMap[capability]}
        <span className="text-sm">{enabled ? 'Enabled' : 'Disabled'}</span>
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
        <Button onClick={() => setIsEditing(!isEditing)}>
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'View Mode' : 'Edit Mode'}
        </Button>
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
              {agentConfigs.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgent === agent.id ? 'default' : 'ghost'}
                  className={`w-full justify-start h-auto p-3 ${selectedAgent === agent.id ? 'border-2' : ''}`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      agent.id === 'scout' ? 'bg-yellow-500' :
                      agent.id === 'ghostwriter' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}>
                      {agent.id === 'scout' && <Zap className="h-4 w-4 text-white" />}
                      {agent.id === 'ghostwriter' && <FileText className="h-4 w-4 text-white" />}
                      {agent.id === 'secretary' && <Shield className="h-4 w-4 text-white" />}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.role}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{agent.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration */}
        {selectedConfig && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedConfig.id === 'scout' && <Zap className="h-5 w-5 text-yellow-500" />}
                  {selectedConfig.id === 'ghostwriter' && <FileText className="h-5 w-5 text-blue-500" />}
                  {selectedConfig.id === 'secretary' && <Shield className="h-5 w-5 text-green-500" />}
                  {selectedConfig.name}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedConfig.isActive}
                    onCheckedChange={(checked) => 
                      updateAgentConfig(selectedConfig.id, { isActive: checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedConfig.isActive ? 'Active' : 'Inactive'}
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

                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="agent-name">Agent Name</Label>
                        <Input
                          id="agent-name"
                          value={selectedConfig.name}
                          onChange={(e) => 
                            updateAgentConfig(selectedConfig.id, { name: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="agent-role">Role</Label>
                        <Select
                          value={selectedConfig.role}
                          onValueChange={(value) => 
                            updateAgentConfig(selectedConfig.id, { role: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor="temperature">Temperature: {selectedConfig.temperature}</Label>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[selectedConfig.temperature]}
                          onValueChange={(value) => 
                            updateAgentConfig(selectedConfig.id, { temperature: value[0] })
                          }
                          disabled={!isEditing}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
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
                          value={selectedConfig.description}
                          onChange={(e) => 
                            updateAgentConfig(selectedConfig.id, { description: e.target.value })
                          }
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Describe what this agent does..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="capabilities" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedConfig.capabilities).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {getCapabilityIcon(key, value)}
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updateAgentConfig(selectedConfig.id, {
                              capabilities: {
                                ...selectedConfig.capabilities,
                                [key]: checked
                              }
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedConfig.performance.tasksCompleted}
                        </div>
                        <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedConfig.performance.averageTime}s
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Time (s)</div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedConfig.performance.successRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* API Management Section */}
      {selectedConfig && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="keys" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="keys">API Keys</TabsTrigger>
                <TabsTrigger value="prompts">Prompt Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="keys" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>OpenAI API Key</Label>
                    <Input
                      type="password"
                      value={selectedConfig.apiKeys.openai || ''}
                      onChange={(e) => 
                        updateAgentConfig(selectedConfig.id, {
                          apiKeys: {
                            ...selectedConfig.apiKeys,
                            openai: e.target.value
                          }
                        })
                      }
                      disabled={!isEditing}
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div>
                    <Label>Anthropic API Key</Label>
                    <Input
                      type="password"
                      value={selectedConfig.apiKeys.anthropic || ''}
                      onChange={(e) => 
                        updateAgentConfig(selectedConfig.id, {
                          apiKeys: {
                            ...selectedConfig.apiKeys,
                            anthropic: e.target.value
                          }
                        })
                      }
                      disabled={!isEditing}
                      placeholder="sk-ant-..."
                    />
                  </div>

                  {selectedConfig.id === 'scout' && (
                    <div>
                      <Label>Tavily API Key</Label>
                      <Input
                        type="password"
                        value={selectedConfig.apiKeys.tavily || ''}
                        onChange={(e) => 
                          updateAgentConfig(selectedConfig.id, {
                            apiKeys: {
                              ...selectedConfig.apiKeys,
                              tavily: e.target.value
                            }
                          })
                        }
                        disabled={!isEditing}
                        placeholder="tvly-..."
                      />
                    </div>
                  )}

                  {selectedConfig.id === 'secretary' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Webhook URL</Label>
                        <Input
                          value={selectedConfig.apiKeys.custom?.[0] || ''}
                          onChange={(e) => 
                            updateAgentConfig(selectedConfig.id, {
                              apiKeys: {
                                ...selectedConfig.apiKeys,
                                custom: [e.target.value]
                              }
                            })
                          }
                          disabled={!isEditing}
                          placeholder="https://your-crm.com/webhook"
                        />
                      </div>
                      
                      <div>
                        <Label>CRM API Key</Label>
                        <Input
                          type="password"
                          value={selectedConfig.apiKeys.custom?.[1] || ''}
                          onChange={(e) => 
                            updateAgentConfig(selectedConfig.id, {
                              apiKeys: {
                                ...selectedConfig.apiKeys,
                                custom: [
                                  selectedConfig.apiKeys.custom?.[0] || '',
                                  e.target.value
                                ]
                              }
                            })
                          }
                          disabled={!isEditing}
                          placeholder="crm-api-key-..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prompts" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(selectedConfig.promptTemplates).map(([type, template]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium capitalize">
                          {type} Template
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomPrompt(selectedConfig.id, type)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(template)
                              // You could add a toast here
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={template}
                        onChange={(e) => 
                          updateAgentConfig(selectedConfig.id, {
                            promptTemplates: {
                              ...selectedConfig.promptTemplates,
                              [type]: e.target.value
                            }
                          })
                        }
                        disabled={!isEditing}
                        rows={3}
                        placeholder={`Enter ${type} prompt template...`}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            const configStr = JSON.stringify(agentConfigs, null, 2)
            const blob = new Blob([configStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'agent-configs.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Export Config
        </Button>
        
        <Button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.onchange = (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  try {
                    const configs = JSON.parse(e.target?.result as string)
                    setAgentConfigs(configs)
                  } catch (error) {
                    console.error('Error importing config:', error)
                  }
                }
                reader.readAsText(file)
              }
            }
            input.click()
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Import Config
        </Button>
        
        {isEditing && (
          <Button
            onClick={() => {
              // Save configurations to backend
              console.log('Saving agent configurations:', agentConfigs)
              setIsEditing(false)
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  )
}