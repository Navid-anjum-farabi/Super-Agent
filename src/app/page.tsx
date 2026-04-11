'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { IntelligenceDashboard } from '@/components/dashboard/intelligence-dashboard'
import { CommandCenter } from '@/components/command-center/command-center'
import { AgentWorkspace } from '@/components/agent-workspace/agent-workspace'
import { GhostwriterSettings } from '@/components/agent-management/ghostwriter-settings'
import { VoiceRecorder } from '@/components/voice/voice-recorder'
import { AgentManagement } from '@/components/agent-management/agent-management'
import { ScoutAgentDashboard } from '@/components/agent-management/scout-agent-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  Settings,
  TrendingUp,
  Activity,
  Target,
  Star,
  ArrowRight,
  Bot,
  FileText,
  Database
} from 'lucide-react'

type ViewType = 'home' | 'dashboard' | 'agents' | 'agent-workspace' | 'scout' | 'ghostwriter' | 'ghostwriter-settings' | 'secretary' | 'knowledge' | 'leads' | 'settings'

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <IntelligenceDashboard />
      case 'settings':
        return <CommandCenter />
      case 'agent-workspace':
        return <AgentWorkspace onOpenSettings={() => setActiveView('ghostwriter-settings')} />
      case 'scout':
        return <ScoutAgentDashboard />
      case 'ghostwriter':
        return <AgentWorkspace onOpenSettings={() => setActiveView('ghostwriter-settings')} />
      case 'ghostwriter-settings':
        return <GhostwriterSettings />
      case 'secretary':
        return <VoiceRecorder />
      case 'agents':
        return <AgentManagement />
      case 'home':
        return <HomeView setActiveView={setActiveView} />
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <MainLayout activeItem={activeView} onItemClick={setActiveView}>
      {renderContent()}
    </MainLayout>
  )
}

function HomeView({ setActiveView }: { setActiveView: (view: ViewType) => void }) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Super-Agent Sales OS</h1>
        <p className="text-xl text-muted-foreground">AI-powered sales automation that works while you sleep</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leads Processed</p>
              <p className="text-2xl font-bold">247</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">34%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
              <p className="text-2xl font-bold">91%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Scout Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode</span>
                <span className="text-sm">Aggressive Lead Hunter</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Activity</span>
                <span className="text-sm">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Leads Found Today</span>
                <span className="text-sm font-bold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Ghostwriter Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode</span>
                <span className="text-sm">Creative Copywriter</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Activity</span>
                <span className="text-sm">5 minutes ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Emails Drafted</span>
                <span className="text-sm font-bold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Secretary Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode</span>
                <span className="text-sm">Detail-Oriented Admin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Activity</span>
                <span className="text-sm">1 minute ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CRM Updates</span>
                <span className="text-sm font-bold">15</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-16 flex items-center justify-between p-4"
              onClick={() => setActiveView('dashboard')}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">View Dashboard</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline"
              className="h-16 flex items-center justify-between p-4"
              onClick={() => setActiveView('ghostwriter')}
            >
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5" />
                <span className="font-medium">Agent Workspace</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline"
              className="h-16 flex items-center justify-between p-4"
              onClick={() => setActiveView('agents')}
            >
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5" />
                <span className="font-medium">Agent Management</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline"
              className="h-16 flex items-center justify-between p-4"
              onClick={() => setActiveView('knowledge')}
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <span className="font-medium">Knowledge Base</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}