import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { promptTemplateSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// UPDATE prompt template
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; promptId: string } }
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
    const validation = promptTemplateSchema.safeParse(body)
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

    const template = await db.promptTemplate.update({
      where: { id: params.promptId },
      data: validation.data,
    })

    return NextResponse.json(
      successResponse(template, "Prompt template updated successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Update prompt template error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// DELETE prompt template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; promptId: string } }
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

    await db.promptTemplate.delete({
      where: { id: params.promptId },
    })

    return NextResponse.json(
      successResponse({}, "Prompt template deleted successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete prompt template error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
