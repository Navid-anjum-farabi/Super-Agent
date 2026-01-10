import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { updateAgentSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// GET single agent
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    const agent = await db.agent.findUnique({
      where: { id: params.id },
      include: {
        config: true,
        apiKeys: true,
        promptTemplates: true,
      },
    })

    if (!agent) {
      return NextResponse.json(
        errorResponse("Agent not found", 404),
        { status: 404 }
      )
    }

    // Check ownership
    if (agent.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("Forbidden", 403),
        { status: 403 }
      )
    }

    return NextResponse.json(
      successResponse(agent, "Agent retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get agent error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// UPDATE agent
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    // Check ownership
    const agent = await db.agent.findUnique({
      where: { id: params.id },
    })

    if (!agent) {
      return NextResponse.json(
        errorResponse("Agent not found", 404),
        { status: 404 }
      )
    }

    if (agent.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("Forbidden", 403),
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validate input
    const validation = updateAgentSchema.safeParse(body)
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

    const updatedAgent = await db.agent.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        config: true,
        apiKeys: true,
        promptTemplates: true,
      },
    })

    return NextResponse.json(
      successResponse(updatedAgent, "Agent updated successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Update agent error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// DELETE agent
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    // Check ownership
    const agent = await db.agent.findUnique({
      where: { id: params.id },
    })

    if (!agent) {
      return NextResponse.json(
        errorResponse("Agent not found", 404),
        { status: 404 }
      )
    }

    if (agent.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("Forbidden", 403),
        { status: 403 }
      )
    }

    await db.agent.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      successResponse({}, "Agent deleted successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete agent error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
