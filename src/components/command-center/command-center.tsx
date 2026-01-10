'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Zap,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  key: string
  status: 'active' | 'expired' | 'invalid'
  lastChecked: string
  service: string
}

interface AgentPersona {
  id: string
  name: string
  role: string
  temperature: number
  description: string
  isActive: boolean
}

interface KnowledgeItem {
  id: string
  title: string
  type: 'pdf' | 'docx' | 'url'
  status: 'processing' | 'completed' | 'failed'
  uploadDate: string
  size?: string
  url?: string
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'OpenAI API',
    key: 'sk-...••••••••••••••••••••••••••••••••',
    status: 'active',
    lastChecked: '2 minutes ago',
    service: 'OpenAI'
  },
  {
    id: '2',
    name: 'Anthropic Claude',
    key: 'sk-ant-...••••••••••••••••••••••••••••••••',
    status: 'active',
    lastChecked: '5 minutes ago',
    service: 'Anthropic'
  },
  {
    id: '3',
    name: 'Tavily Search',
    key: 'tvly-...••••••••••••••••••••••••••••••••',
    status: 'expired',
    lastChecked: '1 hour ago',
    service: 'Tavily'
  }
]

const mockAgentPersonas: AgentPersona[] = [
  {
    id: 'scout',
    name: 'Scout Agent',
    role: 'Aggressive Lead Hunter',
    temperature: 0.3,
    description: 'Proactively identifies and qualifies high-potential leads using advanced search and analysis.',
    isActive: true
  },
  {
    id: 'ghostwriter',
    name: 'Ghostwriter Agent',
    role: 'Creative Copywriter',
    temperature: 0.7,
    description: 'Crafts personalized outreach content with creative flair and persuasive language.',
    isActive: true
  },
  {
    id: 'secretary',
    name: 'Secretary Agent',
    role: 'Detail-Oriented Administrator',
    temperature: 0.1,
    description: 'Manages CRM updates, scheduling, and administrative tasks with precision.',
    isActive: true
  }
]

const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Competitive Analysis 2024',
    type: 'pdf',
    status: 'completed',
    uploadDate: '2 days ago',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Sales Playbook Q3',
    type: 'docx',
    status: 'processing',
    uploadDate: '1 hour ago',
    size: '1.1 MB'
  },
  {
    id: '3',
    title: 'Industry News Feed',
    type: 'url',
    status: 'completed',
    uploadDate: '3 days ago',
    url: 'https://techcrunch.com/tag/sales'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  invalid: 'bg-red-100 text-red-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const statusIcons = {
  active: <CheckCircle className="h-4 w-4" />,
  expired: <XCircle className="h-4 w-4" />,
  invalid: <XCircle className="h-4 w-4" />,
  processing: <Brain className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />
}

export function CommandCenter() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [agentPersonas, setAgentPersonas] = useState(mockAgentPersonas)

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const updateAgentPersona = (id: string, field: keyof AgentPersona, value: any) => {
    setAgentPersonas(prev => 
      prev.map(persona => 
        persona.id === id ? { ...persona, [field]: value } : persona
      )
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

        {/* API Vault Tab */}
        <TabsContent value="api-vault">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  API Management
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAPIKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{apiKey.name}</h3>
                          <p className="text-sm text-muted-foreground">{apiKey.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[apiKey.status]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[apiKey.status]}
                            {apiKey.status}
                          </div>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">API Key:</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type={showKeys[apiKey.id] ? 'text' : 'password'}
                            value={apiKey.key}
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
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Last checked: {apiKey.lastChecked}</span>
                        <Button variant="ghost" size="sm">
                          Check Status
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Personas Tab */}
        <TabsContent value="agent-personas">
          <div className="space-y-6">
            {agentPersonas.map((persona) => (
              <Card key={persona.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      {persona.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={persona.isActive ? 'default' : 'secondary'}>
                        {persona.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateAgentPersona(persona.id, 'isActive', !persona.isActive)}
                      >
                        {persona.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`role-${persona.id}`}>Role</Label>
                        <Select
                          value={persona.role}
                          onValueChange={(value) => updateAgentPersona(persona.id, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor={`temp-${persona.id}`}>Temperature: {persona.temperature}</Label>
                        <Slider
                          value={[persona.temperature]}
                          onValueChange={(value) => updateAgentPersona(persona.id, 'temperature', value[0])}
                          max={1}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Factual</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`description-${persona.id}`}>Description</Label>
                        <Textarea
                          id={`description-${persona.id}`}
                          value={persona.description}
                          onChange={(e) => updateAgentPersona(persona.id, 'description', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Knowledge Center Tab */}
        <TabsContent value="knowledge-center">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Agent Knowledge Base
                </CardTitle>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Knowledge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
                      <span>Uploaded: {item.uploadDate}</span>
                      {item.url && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit URL
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}