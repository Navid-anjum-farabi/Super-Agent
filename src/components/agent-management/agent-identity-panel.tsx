'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Zap, Brain, CheckCircle2 } from 'lucide-react'
import type { AgentIdentity, AgentConfig } from '@/types/agent'

interface AgentIdentityPanelProps {
  identity: AgentIdentity
  config?: AgentConfig
  isEditing?: boolean
  onUpdate?: (identity: Partial<AgentIdentity>) => void
  onEdit?: (enable: boolean) => void
}

export function AgentIdentityPanel({
  identity,
  config,
  isEditing = false,
  onUpdate,
  onEdit,
}: AgentIdentityPanelProps) {
  const handleNameChange = (value: string) => {
    onUpdate?.({ name: value })
  }

  const handleRoleChange = (value: string) => {
    onUpdate?.({ role: value })
  }

  const handleDescriptionChange = (value: string) => {
    onUpdate?.({ description: value })
  }

  // Icon mapping for different agent types
  const iconMap: Record<string, React.ReactNode> = {
    scout: <Zap className="h-6 w-6 text-yellow-500" />,
    ghostwriter: <Brain className="h-6 w-6 text-blue-500" />,
    secretary: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  }

  // Color mapping
  const colorMap: Record<string, string> = {
    scout: 'bg-yellow-100 dark:bg-yellow-950',
    ghostwriter: 'bg-blue-100 dark:bg-blue-950',
    secretary: 'bg-green-100 dark:bg-green-950',
  }

  const agentType =
    identity.name.toLowerCase().includes('scout')
      ? 'scout'
      : identity.name.toLowerCase().includes('ghostwriter')
        ? 'ghostwriter'
        : 'secretary'

  return (
    <Card>
      <CardHeader className={`${colorMap[agentType] || 'bg-slate-100'} rounded-t-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {iconMap[agentType] || <Brain className="h-6 w-6" />}
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={identity.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Agent name"
                    className="font-bold text-lg"
                  />
                </div>
              ) : (
                <CardTitle>{identity.name}</CardTitle>
              )}
              <CardDescription className="mt-1">{agentType}</CardDescription>
            </div>
          </div>
          {onEdit && (
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => onEdit(!isEditing)}
            >
              {isEditing ? 'Done' : 'Edit Identity'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Role Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Role & Purpose</Label>
          {isEditing ? (
            <Input
              value={identity.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              placeholder="e.g., Lead Research & Discovery"
              className="text-base font-medium"
            />
          ) : (
            <p className="text-base font-medium text-primary">{identity.role}</p>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Description</Label>
          {isEditing ? (
            <Textarea
              value={identity.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe the agent's primary function, capabilities, and specialization..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {identity.description}
            </p>
          )}
        </div>

        {/* DNA of the Agent - Configuration Overview */}
        {config && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">The DNA of {identity.name}</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Core configuration attributes that define this agent's behavior
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity Card */}
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">ID:</span>
                    <p className="text-sm font-mono">{config.id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Type:</span>
                    <p className="text-sm capitalize font-semibold">{agentType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <p className="text-sm mt-1">
                      <Badge
                        variant={config.isActive ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {config.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Card */}
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Temperature:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold">
                        {config.temperature.toFixed(1)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({config.temperature < 0.4
                          ? 'Factual'
                          : config.temperature < 0.7
                            ? 'Balanced'
                            : 'Creative'})
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Role:</span>
                    <p className="text-sm font-medium mt-1">{config.role}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities Card */}
              <Card className="bg-slate-50 dark:bg-slate-900 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.capabilities).map(([key, enabled]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className={enabled ? 'font-medium' : 'text-muted-foreground'}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Keys Card */}
              <Card className="bg-slate-50 dark:bg-slate-900 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(config.apiKeys).map(([service, key]) => (
                      key && (
                        <div
                          key={service}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize font-medium">{service}</span>
                          <Badge variant="outline" className="text-xs">
                            {key.substring(0, 8)}••••••••
                          </Badge>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Agent Architecture Info */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>💡 The DNA Architecture:</strong> This agent is built on a
            strictly-typed AgentConfig interface that ensures reliability,
            predictability, and scalability across the entire agent workforce.
            Every attribute from high-level identity to low-level API
            credentials is precisely defined.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
