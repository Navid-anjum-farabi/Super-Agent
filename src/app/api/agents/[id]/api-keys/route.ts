import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiKeySchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"
import crypto from "crypto"

// GET all API keys for agent
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

    const apiKeys = await db.apiKey.findMany({
      where: { agentId: params.id },
      select: {
        id: true,
        service: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Don't return the actual key for security
      },
    })

    return NextResponse.json(
      successResponse(apiKeys, "API keys retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// CREATE new API key
export async function POST(
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
    const validation = apiKeySchema.safeParse(body)
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

    // Encrypt the API key
    const encrypted = crypto
      .createCipher("aes192", process.env.ENCRYPTION_KEY || "default-key")
      .update(validation.data.key, "utf8", "hex")
    const cipher = crypto.createCipher("aes192", process.env.ENCRYPTION_KEY || "default-key")
    cipher.end(validation.data.key, "utf8")
    const encryptedKey = cipher.read().toString("hex")

    const apiKey = await db.apiKey.create({
      data: {
        agentId: params.id,
        service: validation.data.service,
        key: encryptedKey,
        secret: validation.data.secret,
        status: validation.data.status,
      },
      select: {
        id: true,
        service: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      successResponse(apiKey, "API key created successfully", 201),
      { status: 201 }
    )
  } catch (error) {
    console.error("Create API key error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
