'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useWebSocket } from '@/hooks/use-websocket'
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Eye,
  Edit,
  Star,
  Target,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  company: string
  email: string
  status: 'new' | 'researching' | 'drafting' | 'ready'
  confidence: number
  whyNow: string
  lastActivity: string
  agentNotes: string
  priority: 'high' | 'medium' | 'low'
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'TechVentures Inc.',
    email: 's.chen@techventures.com',
    status: 'researching',
    confidence: 94,
    whyNow: 'Just raised $50M Series B - actively expanding sales team',
    lastActivity: '2 minutes ago',
    agentNotes: 'Scout Agent found recent funding news. Company is hiring 15+ sales roles.',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    company: 'Global Logistics Pro',
    email: 'm.rodriguez@glp.com',
    status: 'drafting',
    confidence: 87,
    whyNow: 'Q4 planning season - historically our best conversion window',
    lastActivity: '15 minutes ago',
    agentNotes: 'Ghostwriter preparing personalized outreach based on recent LinkedIn activity.',
    priority: 'high'
  },
  {
    id: '3',
    name: 'Emily Watson',
    company: 'FinanceFlow Solutions',
    email: 'e.watson@financeflow.io',
    status: 'ready',
    confidence: 92,
    whyNow: 'Competitor just raised prices - perfect timing for alternative solutions',
    lastActivity: '1 hour ago',
    agentNotes: 'Secretary Agent has CRM update ready. All research compiled.',
    priority: 'medium'
  }
]

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  researching: 'bg-yellow-100 text-yellow-800',
  drafting: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800'
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  new: <AlertCircle className="h-4 w-4" />,
  researching: <Brain className="h-4 w-4" />,
  drafting: <Edit className="h-4 w-4" />,
  ready: <CheckCircle className="h-4 w-4" />
}

export function IntelligenceDashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const { connected, agentStatus, leadUpdates, notifications } = useWebSocket()

  // Update mock leads with real-time data
  const [mockLeads, setMockLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      company: 'TechVentures Inc.',
      email: 's.chen@techventures.com',
      status: 'researching',
      confidence: 94,
      whyNow: 'Just raised $50M Series B - actively expanding sales team',
      lastActivity: '2 minutes ago',
      agentNotes: 'Scout Agent found recent funding news. Company is hiring 15+ sales roles.',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      company: 'Global Logistics Pro',
      email: 'm.rodriguez@glp.com',
      status: 'drafting',
      confidence: 87,
      whyNow: 'Q4 planning season - historically our best conversion window',
      lastActivity: '15 minutes ago',
      agentNotes: 'Ghostwriter preparing personalized outreach based on recent LinkedIn activity.',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Emily Watson',
      company: 'FinanceFlow Solutions',
      email: 'e.watson@financeflow.io',
      status: 'ready',
      confidence: 92,
      whyNow: 'Competitor just raised prices - perfect timing for alternative solutions',
      lastActivity: '1 hour ago',
      agentNotes: 'Secretary Agent has CRM update ready. All research compiled.',
      priority: 'medium'
    }
  ])

  // Update leads when WebSocket updates come in
  useEffect(() => {
    if (leadUpdates.length > 0) {
      const latestUpdate = leadUpdates[0]
      setMockLeads(prev => prev.map(lead => {
        if (lead.id === latestUpdate.leadId) {
          return {
            ...lead,
            status: latestUpdate.status as any,
            confidence: latestUpdate.confidence,
            lastActivity: 'Just now',
            agentNotes: `${latestUpdate.agent} Agent updated this lead.`
          }
        }
        return lead
      }))
    }
  }, [leadUpdates])

  return (
    <div className="flex h-full">
      {/* Priority Inbox */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Intelligence Dashboard</h1>
            <p className="text-muted-foreground">AI-powered lead prioritization and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Active Agents</p>
                  <p className="text-2xl font-bold">
                    {Object.values(agentStatus).filter(status => status.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Leads Processed</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Priority Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] custom-scrollbar">
              <div className="space-y-4">
                {mockLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md glass custom-scrollbar ${
                      selectedLead?.id === lead.id ? 'border-primary bg-primary/5 pulse-glow' : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{lead.name}</h3>
                          <Badge variant="outline" className={priorityColors[lead.priority]}>
                            {lead.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[lead.status]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[lead.status]}
                            {lead.status}
                          </div>
                        </Badge>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-bold text-green-600">{lead.confidence}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Why Now?</p>
                          <p className="text-sm text-muted-foreground">{lead.whyNow}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Agent Notes</p>
                          <p className="text-sm text-muted-foreground">{lead.agentNotes}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lead.lastActivity}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Workspace
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Lead Detail Panel */}
      {selectedLead && (
        <div className="w-96 border-l bg-muted/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLead(null)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedLead.name}</CardTitle>
                <p className="text-muted-foreground">{selectedLead.company}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={statusColors[selectedLead.status]}>
                      {selectedLead.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priority</p>
                    <Badge variant="outline" className={priorityColors[selectedLead.priority]}>
                      {selectedLead.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedLead.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{selectedLead.confidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Open in Agent Workspace
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Request Research Update
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in CRM
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}