'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, 
  FileText, 
  Send, 
  RefreshCw, 
  Zap, 
  Target,
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  MessageSquare,
  CheckCircle,
  Clock,
  Star,
  Settings,
  Edit3,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface LeadIntelligence {
  company: {
    name: string
    industry: string
    size: string
    location: string
    website: string
    description: string
  }
  recentNews: {
    title: string
    source: string
    date: string
    summary: string
    relevance: number
  }[]
  keyContacts: {
    name: string
    title: string
    linkedin?: string
    email?: string
  }[]
  competitorAnalysis: {
    competitor: string
    weakness: string
    opportunity: string
  }[]
  marketInsights: {
    trend: string
    impact: string
    relevance: number
  }[]
}

interface EmailDraft {
  id: string
  subject: string
  body: string
  tone: 'professional' | 'casual' | 'friendly' | 'formal'
  length: 'short' | 'medium' | 'long'
  focus: 'product' | 'value' | 'relationship' | 'solution'
  confidence: number
  status: 'draft' | 'reviewed' | 'approved'
}

const mockIntelligence: LeadIntelligence = {
  company: {
    name: 'TechVentures Inc.',
    industry: 'SaaS / FinTech',
    size: '201-500 employees',
    location: 'San Francisco, CA',
    website: 'https://techventures.com',
    description: 'Leading provider of AI-powered financial automation solutions for enterprise clients.'
  },
  recentNews: [
    {
      title: 'TechVentures Raises $50M Series B to Expand Sales Operations',
      source: 'TechCrunch',
      date: '2 days ago',
      summary: 'The funding round will be used to scale the sales team and expand into European markets.',
      relevance: 95
    },
    {
      title: 'CEO Sarah Chen Named to Forbes 30 Under 30',
      source: 'Forbes',
      date: '1 week ago',
      summary: 'Recognition for innovative approach to financial technology and company growth.',
      relevance: 78
    }
  ],
  keyContacts: [
    {
      name: 'Sarah Chen',
      title: 'CEO',
      linkedin: 'https://linkedin.com/in/sarahchen',
      email: 's.chen@techventures.com'
    },
    {
      name: 'Marcus Rodriguez',
      title: 'VP of Sales',
      linkedin: 'https://linkedin.com/in/marcusrodriguez',
      email: 'm.rodriguez@techventures.com'
    }
  ],
  competitorAnalysis: [
    {
      competitor: 'FinanceFlow Pro',
      weakness: 'Limited customization options',
      opportunity: 'Our flexible API integration'
    },
    {
      competitor: 'GlobalPay Solutions',
      weakness: 'Poor customer support',
      opportunity: 'Our 24/7 dedicated support team'
    }
  ],
  marketInsights: [
    {
      trend: 'Increased demand for AI automation',
      impact: 'High - Perfect timing for our solution',
      relevance: 92
    },
    {
      trend: 'Regulatory changes in FinTech',
      impact: 'Medium - Compliance features needed',
      relevance: 76
    }
  ]
}

const mockDrafts: EmailDraft[] = [
  {
    id: '1',
    subject: 'Re: Scaling Your Sales Operations with AI',
    body: `Hi Sarah,

Congratulations on the recent Series B funding! It's exciting to see TechVentures' rapid growth in the FinTech space.

Given your expansion plans and the recent funding, I thought you might be interested in how our AI-powered sales automation platform can help you:

• Scale your sales operations 3x without increasing headcount
• Automate lead qualification and follow-ups
• Integrate seamlessly with your existing CRM stack
• Provide real-time analytics and insights

Several companies in your space have seen 40% improvement in sales efficiency after implementing our solution.

Would you be open to a brief 15-minute call next week to explore how this could support your expansion goals?

Best regards,
Alex`,
    tone: 'professional',
    length: 'medium',
    focus: 'solution',
    confidence: 94,
    status: 'draft'
  },
  {
    id: '2',
    subject: 'Congrats on the funding! 🚀',
    body: `Sarah - Huge congrats on the $50M Series B! Saw the news on TechCrunch and had to reach out.

With you scaling the sales team, thought you might want to check out how we're helping companies like yours automate their sales workflow. Our AI platform basically acts like a 24/7 sales assistant.

Companies using it see 3x better conversion rates and their sales teams love it (actually use it, which is rare 😅).

Worth a quick chat? 

Cheers,
Alex`,
    tone: 'casual',
    length: 'short',
    focus: 'value',
    confidence: 87,
    status: 'draft'
  }
]

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' }
]

const lengthOptions = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' }
]

const focusOptions = [
  { value: 'product', label: 'Product' },
  { value: 'value', label: 'Value' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'solution', label: 'Solution' }
]

export function AgentWorkspace({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft>(mockDrafts[0])
  const [refinementInstruction, setRefinementInstruction] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const handleRefine = () => {
    setIsRefining(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefining(false)
      setRefinementInstruction('')
    }, 2000)
  }

  const handleToneChange = (tone: string) => {
    setSelectedDraft(prev => ({ ...prev, tone: tone as any }))
  }

  const handleLengthChange = (length: string) => {
    setSelectedDraft(prev => ({ ...prev, length: length as any }))
  }

  const handleFocusChange = (focus: string) => {
    setSelectedDraft(prev => ({ ...prev, focus: focus as any }))
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Intelligence */}
      <div className="w-1/2 border-r bg-muted/20">
        <div className="p-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Agent Intelligence
            </h2>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Research Complete
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-6 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{mockIntelligence.company.name}</h3>
                    <p className="text-sm text-muted-foreground">{mockIntelligence.company.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Industry:</span> {mockIntelligence.company.industry}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {mockIntelligence.company.size}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {mockIntelligence.company.location}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span> 
                      <a href={mockIntelligence.company.website} className="text-blue-500 hover:underline ml-1">
                        {mockIntelligence.company.website}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent News */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent News & Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockIntelligence.recentNews.map((news, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{news.title}</h4>
                        <Badge variant="outline">{news.relevance}% relevant</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{news.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Key Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockIntelligence.keyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        <p className="text-sm text-blue-500">{contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.linkedin && (
                          <Button variant="ghost" size="sm">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Competitive Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockIntelligence.competitorAnalysis.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{competitor.competitor}</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-red-600">Weakness:</span> {competitor.weakness}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Opportunity:</span> {competitor.opportunity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Drafts */}
      <div className="w-1/2 flex flex-col">
        <div className="p-6 border-b bg-background">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ghostwriter Output
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Star className="h-4 w-4 mr-1" />
                {selectedDraft.confidence}% Confidence
              </Badge>
              {/* Settings button to open settings panel */}
              <Button variant="outline" size="sm" onClick={() => onOpenSettings && onOpenSettings()}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Draft Selection */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              {mockDrafts.map((draft) => (
                <Button
                  key={draft.id}
                  variant={selectedDraft.id === draft.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDraft(draft)}
                >
                  Draft {draft.id}
                </Button>
              ))}
            </div>
          </div>

          {/* Refinement Controls */}
          <div className="p-4 border-b bg-muted/20">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tone</label>
                <Select value={selectedDraft.tone} onValueChange={handleToneChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Length</label>
                <Select value={selectedDraft.length} onValueChange={handleLengthChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Focus</label>
                <Select value={selectedDraft.focus} onValueChange={handleFocusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {focusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Give specific instructions for refinement (e.g., 'Make it more casual', 'Add more social proof', 'Shorten by 50%')"
                value={refinementInstruction}
                onChange={(e) => setRefinementInstruction(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button 
                onClick={handleRefine}
                disabled={!refinementInstruction.trim() || isRefining}
              >
                {isRefining ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedDraft.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedDraft.body}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-4 w-4 mr-1" />
                          Draft
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Last modified: 2 minutes ago
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}