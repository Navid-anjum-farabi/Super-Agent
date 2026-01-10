'use client'

import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full p-0 shadow-lg glass"
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-blue-600" />
        )}
      </div>
    </Button>
  )
}