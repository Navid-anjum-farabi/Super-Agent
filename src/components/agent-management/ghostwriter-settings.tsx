'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, AlertCircle, Settings, Shield } from 'lucide-react'

type Tone = 'professional' | 'casual' | 'persuasive'
type Length = 'short' | 'medium' | 'long'
type Focus = 'solution' | 'value' | 'urgency'

export function GhostwriterSettings() {
  const [tone, setTone] = useState<Tone>('professional')
  const [length, setLength] = useState<Length>('medium')
  const [focus, setFocus] = useState<Focus>('solution')
  const [instruction, setInstruction] = useState('')

  const [apiEndpoint, setApiEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')

  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingTest, setLoadingTest] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    // load from API then fallback to localStorage
    const load = async () => {
      try {
        const res = await fetch('/api/agents/ghostwriter/settings')
        if (res.ok) {
          const json = await res.json()
          setTone((json.tone as Tone) ?? 'professional')
          setLength((json.length as Length) ?? 'medium')
          setFocus((json.focus as Focus) ?? 'solution')
          setInstruction(json.instruction ?? '')
          setApiEndpoint(json.apiEndpoint ?? '')
          setApiKey(json.apiKey ?? '')
          return
        }
      } catch (e) {
        // ignore and fallback
      }

      const ls = typeof window !== 'undefined' ? localStorage.getItem('ghostwriter-settings') : null
      if (ls) {
        try {
          const json = JSON.parse(ls)
          setTone(json.tone ?? 'professional')
          setLength(json.length ?? 'medium')
          setFocus(json.focus ?? 'solution')
          setInstruction(json.instruction ?? '')
          setApiEndpoint(json.apiEndpoint ?? '')
          setApiKey(json.apiKey ?? '')
        } catch (e) {}
      }
    }

    load()
  }, [])

  const handleSave = async () => {
    setLoadingSave(true)
    setTestResult(null)
    const payload = { tone, length, focus, instruction, apiEndpoint, apiKey }

    // optimistic localStorage
    try {
      localStorage.setItem('ghostwriter-settings', JSON.stringify(payload))
    } catch (e) {}

    try {
      const res = await fetch('/api/agents/ghostwriter/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setTestResult({ ok: true, message: 'Settings saved' })
      } else {
        setTestResult({ ok: false, message: 'Failed to save' })
      }
    } catch (e) {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setLoadingSave(false)
    }
  }

  const handleTestConnection = async () => {
    setLoadingTest(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/agents/ghostwriter/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiEndpoint, apiKey })
      })

      const json = await res.json()
      setTestResult({ ok: json.ok, message: json.message })
    } catch (e) {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setLoadingTest(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileIcon /> Ghostwriter · Settings
          </h1>
          <p className="text-sm text-muted-foreground">Configure default behavior and API connection for the Ghostwriter Agent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            Reset View
          </Button>
          <Button onClick={handleSave} disabled={loadingSave}>
            {loadingSave ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { /* navigate back to agent workspace */ window.location.hash = 'workspace' }}>
            Back to Agent Workspace
          </Button>
        </nav>
      </div>

      <Tabs defaultValue="agent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agent">Agent Settings</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agent">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Agent Role Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tone</label>
                    <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Length</label>
                    <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Focus</label>
                    <Select value={focus} onValueChange={(v) => setFocus(v as Focus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solution">Solution</SelectItem>
                        <SelectItem value="value">Value</SelectItem>
                        <SelectItem value="urgency">Urgency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Global Instructions</label>
                  <Textarea value={instruction} onChange={(e) => setInstruction((e.target as HTMLTextAreaElement).value)} rows={6} placeholder="High-level instructions applied to every output" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                API Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">API Endpoint</label>
                  <Input value={apiEndpoint} onChange={(e) => setApiEndpoint((e.target as HTMLInputElement).value)} placeholder="https://api.example.com/ghostwriter" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">API Key</label>
                  <Input type="password" value={apiKey} onChange={(e) => setApiKey((e.target as HTMLInputElement).value)} placeholder="••••••••••" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button onClick={handleTestConnection} disabled={loadingTest}>
                  {loadingTest ? 'Testing...' : 'Test Connection'}
                </Button>
                {testResult && (
                  <div className={`text-sm ${testResult.ok ? 'text-green-600' : 'text-red-600'} flex items-center gap-2`}> 
                    {testResult.ok ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} 
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
