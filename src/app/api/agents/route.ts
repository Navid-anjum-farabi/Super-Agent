import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAgentSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// GET all agents for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    const agents = await db.agent.findMany({
      where: { userId: session.user.id },
      include: {
        config: true,
        apiKeys: true,
        promptTemplates: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      successResponse(agents, "Agents retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// CREATE new agent
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate input
    const validation = createAgentSchema.safeParse(body)
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

    const { name, type, description, status } = validation.data

    // Create agent with default config
    const agent = await db.agent.create({
      data: {
        userId: session.user.id,
        name,
        type,
        description,
        status,
        config: {
          create: {
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
      },
      include: {
        config: true,
        apiKeys: true,
        promptTemplates: true,
      },
    })

    return NextResponse.json(
      successResponse(agent, "Agent created successfully", 201),
      { status: 201 }
    )
  } catch (error) {
    console.error("Create agent error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
