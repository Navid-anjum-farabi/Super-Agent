'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Toaster } from '@/components/ui/toaster'

interface MainLayoutProps {
  children: React.ReactNode
  activeItem: string
  onItemClick: (item: string) => void
}

export function MainLayout({ children, activeItem, onItemClick }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar
          activeItem={activeItem}
          onItemClick={onItemClick}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}