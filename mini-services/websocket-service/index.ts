import { createServer } from 'http'
import { Server } from 'socket.io'

const server = createServer()
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Store active connections
const activeConnections = new Map()

// Mock agent status updates
const agentStatuses = {
  scout: { status: 'active', lastActivity: new Date(), leadsProcessed: 12 },
  ghostwriter: { status: 'active', lastActivity: new Date(), emailsDrafted: 8 },
  secretary: { status: 'active', lastActivity: new Date(), crmUpdates: 15 }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  
  // Store connection
  activeConnections.set(socket.id, {
    connectedAt: new Date(),
    lastPing: new Date()
  })

  // Send initial agent status
  socket.emit('agent-status', agentStatuses)

  // Handle agent updates
  socket.on('agent-update', (data) => {
    const { agent, status, progress } = data
    
    // Update agent status
    if (agentStatuses[agent]) {
      agentStatuses[agent] = {
        ...agentStatuses[agent],
        status,
        lastActivity: new Date(),
        progress
      }
    }

    // Broadcast to all clients
    io.emit('agent-status', agentStatuses)
    
    console.log(`Agent ${agent} updated:`, status, progress)
  })

  // Handle lead updates
  socket.on('lead-update', (data) => {
    const { leadId, status, confidence, agent } = data
    
    // Broadcast lead update to all clients
    io.emit('lead-update', {
      leadId,
      status,
      confidence,
      agent,
      timestamp: new Date().toISOString()
    })
    
    console.log(`Lead ${leadId} updated by ${agent}:`, status, confidence)
  })

  // Handle real-time notifications
  socket.on('notification', (data) => {
    const { type, message, priority } = data
    
    // Broadcast notification to all clients
    io.emit('notification', {
      type,
      message,
      priority,
      timestamp: new Date().toISOString()
    })
    
    console.log(`Notification sent:`, type, message)
  })

  // Handle ping for connection health
  socket.on('ping', () => {
    const connection = activeConnections.get(socket.id)
    if (connection) {
      connection.lastPing = new Date()
    }
    socket.emit('pong')
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    activeConnections.delete(socket.id)
  })
})

// Simulate agent activity
function simulateAgentActivity() {
  const agents = ['scout', 'ghostwriter', 'secretary']
  const randomAgent = agents[Math.floor(Math.random() * agents.length)]
  
  // Randomly update agent status
  const statuses = ['processing', 'analyzing', 'generating', 'updating', 'active']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  
  agentStatuses[randomAgent] = {
    ...agentStatuses[randomAgent],
    status: randomStatus,
    lastActivity: new Date()
  }

  // Broadcast to all clients
  io.emit('agent-status', agentStatuses)
}

// Simulate lead updates
function simulateLeadUpdate() {
  // Align lead IDs with the dashboard's mock leads ("1", "2", "3") so real-time
  // updates visibly apply to existing cards in the Intelligence Dashboard.
  const leadIds = ['1', '2', '3']
  const leadId = leadIds[Math.floor(Math.random() * leadIds.length)]
  const statuses = ['new', 'researching', 'drafting', 'ready']
  const agents = ['scout', 'ghostwriter', 'secretary']
  
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  const randomAgent = agents[Math.floor(Math.random() * agents.length)]
  const randomConfidence = Math.floor(Math.random() * 30) + 70 // 70-100%

  io.emit('lead-update', {
    leadId,
    status: randomStatus,
    confidence: randomConfidence,
    agent: randomAgent,
    timestamp: new Date().toISOString()
  })
}

// Start simulation intervals
setInterval(simulateAgentActivity, 5000) // Every 5 seconds
setInterval(simulateLeadUpdate, 8000) // Every 8 seconds

// Cleanup inactive connections
setInterval(() => {
  const now = new Date()
  activeConnections.forEach((connection, socketId) => {
    if (now.getTime() - connection.lastPing.getTime() > 30000) { // 30 seconds
      console.log(`Cleaning up inactive connection: ${socketId}`)
      activeConnections.delete(socketId)
    }
  })
}, 60000) // Every minute

const PORT = 3001
server.listen(PORT, () => {
  console.log(`WebSocket service running on port ${PORT}`)
})