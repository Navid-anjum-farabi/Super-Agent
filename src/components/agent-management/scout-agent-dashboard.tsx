/**
 * Scout Agent Integration Example
 * Complete working example of Scout Agent in a real component
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useScoutAgent } from '@/hooks/use-scout-agent'
import { ScoutAgentConfigPanel } from '@/components/agent-management/scout-agent-config'
import { AgentIdentityPanel } from '@/components/agent-management/agent-identity-panel'
import { Zap, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * Example: Scout Agent Dashboard
 * Shows how to use the Scout Agent in a real application
 */
export function ScoutAgentDashboard() {
  const [testLead, setTestLead] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)

  const {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateApiKey,
    testAgent,
    activate,
    deactivate,
  } = useScoutAgent({
    agentId: 'scout',
    onError: (errorMsg) => {
      console.error('Scout Agent Error:', errorMsg)
    },
    onSuccess: (cfg) => {
      console.log('Scout Agent Updated:', cfg)
    },
  })

  // Load configuration on mount
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Handle test execution
  const handleTest = async () => {
    if (!testLead.trim()) {
      alert('Please enter a company name to research')
      return
    }

    const result = await testAgent({
      companyName: testLead,
      notes: 'Test run from Scout Agent Dashboard',
    })

    setTestResult(result)
  }

  // Handle activation toggle
  const handleToggleActive = async () => {
    if (config?.isActive) {
      await deactivate()
    } else {
      await activate()
    }
  }

  if (!config && !error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading Scout Agent...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Scout Agent Header */}
      <Card>
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-500" />
              <div>
                <CardTitle className="text-2xl">Scout Agent Dashboard</CardTitle>
                <CardDescription>Lead Research & Discovery Control Center</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {config?.isActive ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <Button
                size="sm"
                variant={config?.isActive ? 'destructive' : 'default'}
                onClick={handleToggleActive}
                disabled={loading}
              >
                {config?.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test Agent</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Agent Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {config && (
                <AgentIdentityPanel
                  identity={{
                    name: config.name,
                    role: config.role,
                    description: config.description,
                  }}
                  config={config}
                  isEditing={false}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <div className="space-y-4">
            {config && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Agent Configuration</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfig(!showConfig)}
                  >
                    {showConfig ? 'Hide' : 'Show'} Details
                  </Button>
                </div>

                {showConfig && (
                  <ScoutAgentConfigPanel
                    agentId="scout"
                    onSave={async (updatedConfig) => {
                      await saveConfig(updatedConfig)
                    }}
                    onClose={() => setShowConfig(false)}
                  />
                )}

                {/* Quick Configuration Summary */}
                {!showConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Temperature</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{config.temperature.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.temperature < 0.4
                            ? '🎯 Factual & Accurate'
                            : config.temperature < 0.7
                              ? '⚖️ Balanced'
                              : '✨ Creative'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Capabilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {Object.entries(config.capabilities)
                            .filter(([, enabled]) => enabled)
                            .map(([name]) => (
                              <div key={name} className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {name.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">API Keys</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {Object.entries(config.apiKeys)
                            .filter(([, key]) => key)
                            .map(([service]) => (
                              <div key={service} className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {service.charAt(0).toUpperCase() + service.slice(1)}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {config.isActive ? (
                            <span className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Ready to use
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last activity: {new Date(config.lastActivity).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Test Agent Tab */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Scout Agent</CardTitle>
              <CardDescription>Research a company to test agent capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  value={testLead}
                  onChange={(e) => setTestLead(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <Button
                onClick={handleTest}
                disabled={loading || !config?.isActive}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Research Company
                  </>
                )}
              </Button>

              {/* Test Results */}
              {testResult && (
                <Card className="bg-green-50 dark:bg-green-950 mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Analysis Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto max-h-60 bg-white dark:bg-black p-3 rounded">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {!config?.isActive && (
                <Alert>
                  <AlertDescription>
                    Scout Agent is currently inactive. Activate it to run tests.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {config?.performance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tasks Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {config.performance.tasksCompleted}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Total research tasks executed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 dark:bg-purple-950">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Average Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {config.performance.averageTime.toFixed(1)}s
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Average response time
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-950">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {(config.performance.successRate * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Task completion success
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Helpful Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p>
            • Scout Agent uses a low temperature (0.3) for highly accurate, fact-based research
          </p>
          <p>
            • Ensure OpenAI and Tavily API keys are configured for full functionality
          </p>
          <p>
            • Monitor performance metrics to optimize agent behavior
          </p>
          <p>
            • Test with various companies to ensure quality of research output
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Export for use in pages
 */
export default ScoutAgentDashboard
