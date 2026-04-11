import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { performanceSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// GET performance metrics for an agent
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

    // Get or create performance record
    let performance = await db.agentPerformance.findUnique({
      where: { agentId },
    })

    if (!performance) {
      // Create default performance record
      performance = await db.agentPerformance.create({
        data: {
          agentId,
          tasksCompleted: 0,
          successRate: 0,
          avgResponseTime: 0,
        },
      })
    }

    return NextResponse.json(
      successResponse(performance, "Performance retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get performance error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}

// PUT update performance metrics (typically called by backend services)
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
    const validation = performanceSchema.safeParse(body)
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

    const { tasksCompleted, successRate, avgResponseTime } = validation.data

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

    // Upsert performance record
    const performance = await db.agentPerformance.upsert({
      where: { agentId },
      update: {
        tasksCompleted,
        successRate,
        avgResponseTime,
        lastUpdated: new Date(),
      },
      create: {
        agentId,
        tasksCompleted,
        successRate,
        avgResponseTime,
      },
    })

    return NextResponse.json(
      successResponse(performance, "Performance updated successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Update performance error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}

// POST increment task completion (convenience endpoint)
export async function POST(
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
    const { success, responseTime } = body

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

    // Get current performance
    const current = await db.agentPerformance.findUnique({
      where: { agentId },
    })

    const currentTasks = current?.tasksCompleted || 0
    const currentSuccessRate = current?.successRate || 0
    const currentAvgTime = current?.avgResponseTime || 0

    // Calculate new values
    const newTasks = currentTasks + 1
    const newSuccessRate = success !== undefined
      ? ((currentSuccessRate * currentTasks) + (success ? 100 : 0)) / newTasks
      : currentSuccessRate
    const newAvgTime = responseTime !== undefined
      ? ((currentAvgTime * currentTasks) + responseTime) / newTasks
      : currentAvgTime

    // Update performance
    const performance = await db.agentPerformance.upsert({
      where: { agentId },
      update: {
        tasksCompleted: newTasks,
        successRate: Math.round(newSuccessRate * 100) / 100,
        avgResponseTime: Math.round(newAvgTime * 100) / 100,
        lastUpdated: new Date(),
      },
      create: {
        agentId,
        tasksCompleted: 1,
        successRate: success ? 100 : 0,
        avgResponseTime: responseTime || 0,
      },
    })

    // Also update agent's lastActivity
    await db.agent.update({
      where: { id: agentId },
      data: { lastActivity: new Date() },
    })

    return NextResponse.json(
      successResponse(performance, "Task recorded successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Record task error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
