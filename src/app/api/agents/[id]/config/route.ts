import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { agentConfigSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// GET agent config
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

    const config = await db.agentConfig.findUnique({
      where: { agentId: params.id },
    })

    if (!config) {
      return NextResponse.json(
        errorResponse("Config not found", 404),
        { status: 404 }
      )
    }

    // Verify ownership
    const agent = await db.agent.findUnique({
      where: { id: params.id },
    })

    if (agent?.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("Forbidden", 403),
        { status: 403 }
      )
    }

    return NextResponse.json(
      successResponse(config, "Config retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get config error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// UPDATE agent config
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

    // Verify ownership
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
    const validation = agentConfigSchema.safeParse(body)
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

    const updatedConfig = await db.agentConfig.update({
      where: { agentId: params.id },
      data: validation.data,
    })

    return NextResponse.json(
      successResponse(updatedConfig, "Config updated successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Update config error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
