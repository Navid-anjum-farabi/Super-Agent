'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from '@/hooks/use-toast'

interface AgentStatus {
  [agent: string]: {
    status: string
    lastActivity: Date
    progress?: number
    leadsProcessed?: number
    emailsDrafted?: number
    crmUpdates?: number
  }
}

interface LeadUpdate {
  leadId: string
  status: string
  confidence: number
  agent: string
  timestamp: string
}

interface Notification {
  type: string
  message: string
  priority: string
  timestamp: string
}

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({})
  const [leadUpdates, setLeadUpdates] = useState<LeadUpdate[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const pingIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Initialize socket connection
    // NOTE: WebSocket service currently runs on port 3001 (see mini-services/websocket-service/index.ts)
    const socketInstance = io('ws://localhost:3001', {
      transports: ['websocket'],
      upgrade: false
    })

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket service')
      setConnected(true)
      
      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        socketInstance.emit('ping')
      }, 30000)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket service')
      setConnected(false)
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    })

    socketInstance.on('pong', () => {
      console.log('WebSocket connection healthy')
    })

    // Listen for agent status updates
    socketInstance.on('agent-status', (status: AgentStatus) => {
      setAgentStatus(status)
    })

    // Listen for lead updates
    socketInstance.on('lead-update', (update: LeadUpdate) => {
      setLeadUpdates(prev => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
    })

    // Listen for notifications
    socketInstance.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20 notifications
      
      // Also show toast notification for high priority
      if (notification.priority === 'high') {
        toast({
          title: notification.type || 'High priority notification',
          description: notification.message,
          variant: 'destructive',
        })
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [])

  const sendAgentUpdate = (agent: string, status: string, progress?: number) => {
    if (socket) {
      socket.emit('agent-update', { agent, status, progress })
    }
  }

  const sendLeadUpdate = (leadId: string, status: string, confidence: number, agent: string) => {
    if (socket) {
      socket.emit('lead-update', { leadId, status, confidence, agent })
    }
  }

  const sendNotification = (type: string, message: string, priority: string = 'medium') => {
    if (socket) {
      socket.emit('notification', { type, message, priority })
    }
  }

  return {
    connected,
    agentStatus,
    leadUpdates,
    notifications,
    sendAgentUpdate,
    sendLeadUpdate,
    sendNotification
  }
}