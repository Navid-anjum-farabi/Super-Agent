import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"

// DELETE API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; keyId: string } }
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

    // Verify that the API key belongs to the agent
    const apiKey = await db.apiKey.findUnique({
      where: { id: params.keyId },
    })

    if (!apiKey) {
      return NextResponse.json(
        errorResponse("API key not found", 404),
        { status: 404 }
      )
    }

    if (apiKey.agentId !== params.id) {
      return NextResponse.json(
        errorResponse("API key does not belong to this agent", 403),
        { status: 403 }
      )
    }

    await db.apiKey.delete({
      where: { id: params.keyId },
    })

    return NextResponse.json(
      successResponse({}, "API key deleted successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
