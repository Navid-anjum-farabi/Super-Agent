import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { capabilityUpdateSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// Default capabilities for each agent type
const defaultCapabilities: Record<string, { name: string; description: string; isActive: boolean }[]> = {
  scout: [
    { name: 'webSearch', description: 'Search the web for lead information', isActive: true },
    { name: 'dataAnalysis', description: 'Analyze lead data and patterns', isActive: true },
    { name: 'crmIntegration', description: 'Integrate with CRM systems', isActive: true },
    { name: 'contentGeneration', description: 'Generate content', isActive: false },
    { name: 'voiceProcessing', description: 'Process voice input', isActive: false },
  ],
  ghostwriter: [
    { name: 'contentGeneration', description: 'Generate personalized content', isActive: true },
    { name: 'dataAnalysis', description: 'Analyze writing patterns', isActive: true },
    { name: 'crmIntegration', description: 'Integrate with CRM systems', isActive: true },
    { name: 'webSearch', description: 'Search the web', isActive: false },
    { name: 'voiceProcessing', description: 'Process voice input', isActive: false },
  ],
  secretary: [
    { name: 'voiceProcessing', description: 'Process voice recordings', isActive: true },
    { name: 'dataAnalysis', description: 'Analyze and structure data', isActive: true },
    { name: 'crmIntegration', description: 'Update CRM records', isActive: true },
    { name: 'webSearch', description: 'Search the web', isActive: false },
    { name: 'contentGeneration', description: 'Generate content', isActive: false },
  ],
}

// GET capabilities for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json(errorResponse("Unauthorized", 401), { status: 401 })
    }

    const { id: agentId } = await params

    // Verify agent ownership
    const agent = await db.agent.findFirst({
      where: {
        id: agentId,
        userId: session.user.id,
      },
    })

    if (!agent) {
      return NextResponse.json(errorResponse("Agent not found", 404), { status: 404 })
    }

    // Get existing capabilities
    let capabilities = await db.agentCapability.findMany({
      where: { agentId },
      orderBy: { name: 'asc' },
    })

    // If no capabilities exist, create defaults based on agent type
    if (capabilities.length === 0) {
      const defaults = defaultCapabilities[agent.type] || defaultCapabilities.scout
      
      await db.agentCapability.createMany({
        data: defaults.map(cap => ({
          agentId,
          name: cap.name,
          description: cap.description,
          isActive: cap.isActive,
        })),
      })

      capabilities = await db.agentCapability.findMany({
        where: { agentId },
        orderBy: { name: 'asc' },
      })
    }

    return NextResponse.json(
      successResponse(capabilities, "Capabilities retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get capabilities error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}

// PUT/PATCH update a capability
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json(errorResponse("Unauthorized", 401), { status: 401 })
    }

    const { id: agentId } = await params
    const body = await req.json()

    // Validate input
    const validation = capabilityUpdateSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      const errorMap = Object.entries(errors).reduce(
        (acc, [key, messages]) => ({
          ...acc,
          [key]: messages?.[0] || "Invalid field",
        }),
        {}
      )
      return NextResponse.json(validationError(errorMap), { status: 422 })
    }

    const { name, isActive, description } = validation.data

    // Verify agent ownership
    const agent = await db.agent.findFirst({
      where: {
        id: agentId,
        userId: session.user.id,
      },
    })

    if (!agent) {
      return NextResponse.json(errorResponse("Agent not found", 404), { status: 404 })
    }

    // Find existing capability by name
    const existing = await db.agentCapability.findFirst({
      where: { agentId, name },
    })

    let capability
    if (existing) {
      capability = await db.agentCapability.update({
        where: { id: existing.id },
        data: { 
          isActive, 
          description: description !== undefined ? description : existing.description 
        },
      })
    } else {
      capability = await db.agentCapability.create({
        data: {
          agentId,
          name,
          isActive,
          description: description || null,
        },
      })
    }

    return NextResponse.json(
      successResponse(capability, "Capability updated successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Update capability error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
