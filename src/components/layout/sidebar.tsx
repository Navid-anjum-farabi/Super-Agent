'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  Brain, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Database,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Home,
  Edit3
} from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Intelligence Dashboard',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'agents',
    label: 'Agent Management',
    icon: <Bot className="h-4 w-4" />
  },
  {
    id: 'agent-workspace',
    label: 'Agent Workspace',
    icon: <Edit3 className="h-4 w-4" />,
    children: [
      { id: 'scout', label: 'Scout Agent', icon: <Zap className="h-4 w-4" /> },
      { id: 'ghostwriter', label: 'Ghostwriter Agent', icon: <FileText className="h-4 w-4" /> },
      { id: 'secretary', label: 'Secretary Agent', icon: <Shield className="h-4 w-4" /> }
    ]
  },
  {
    id: 'knowledge',
    label: 'Knowledge Base',
    icon: <Database className="h-4 w-4" />
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'settings',
    label: 'Command Center',
    icon: <Settings className="h-4 w-4" />
  }
]

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ activeItem, onItemClick, collapsed, onToggleCollapse }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['agents'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = activeItem === item.id
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)

    return (
      <div key={item.id}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size={collapsed ? 'icon' : 'default'}
          className={cn(
            'w-full justify-start gap-2 h-9',
            level > 0 && 'ml-4',
            isActive && 'bg-primary/10 text-primary border-r-2 border-primary'
          )}
          onClick={() => {
            if (hasChildren && !collapsed) {
              toggleExpanded(item.id)
            } else {
              onItemClick(item.id)
            }
          }}
        >
          {item.icon}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {hasChildren && (
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
            </>
          )}
        </Button>
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4">
        <div className={cn(
          'flex items-center gap-2',
          collapsed && 'justify-center'
        )}>
          <Brain className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-semibold text-lg">Super-Agent OS</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          <Button
            variant={activeItem === 'home' ? 'secondary' : 'ghost'}
            size={collapsed ? 'icon' : 'default'}
            className={cn(
              'w-full justify-start gap-2 h-9',
              activeItem === 'home' && 'bg-primary/10 text-primary border-r-2 border-primary'
            )}
            onClick={() => onItemClick('home')}
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span className="flex-1 text-left">Home</span>}
          </Button>
          
          {sidebarItems.map(item => renderSidebarItem(item))}
        </div>
      </ScrollArea>
    </div>
  )
}