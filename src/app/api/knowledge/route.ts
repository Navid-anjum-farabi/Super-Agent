import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { knowledgeItemSchema } from "@/lib/validators"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"

// GET all knowledge items for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    const knowledgeItems = await db.knowledgeItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Transform for frontend (hide sensitive fields, format dates)
    const items = knowledgeItems.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      status: item.status,
      url: item.url,
      fileSize: item.fileSize,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    return NextResponse.json(
      successResponse(items, "Knowledge items retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get knowledge items error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// CREATE new knowledge item
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
    const validation = knowledgeItemSchema.safeParse(body)
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

    const { title, type, url, content } = validation.data

    // Create knowledge item
    const knowledgeItem = await db.knowledgeItem.create({
      data: {
        userId: session.user.id,
        title,
        type,
        url: type === 'url' ? url : null,
        content: content || null,
        status: 'processing', // Will be updated by background job
      },
    })

    // TODO: Trigger background job for processing/embedding

    return NextResponse.json(
      successResponse({
        id: knowledgeItem.id,
        title: knowledgeItem.title,
        type: knowledgeItem.type,
        status: knowledgeItem.status,
        url: knowledgeItem.url,
        createdAt: knowledgeItem.createdAt.toISOString(),
      }, "Knowledge item created successfully", 201),
      { status: 201 }
    )
  } catch (error) {
    console.error("Create knowledge item error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}

// DELETE knowledge item
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        errorResponse("Item ID is required", 400),
        { status: 400 }
      )
    }

    // Verify ownership
    const item = await db.knowledgeItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    })

    if (!item) {
      return NextResponse.json(
        errorResponse("Knowledge item not found", 404),
        { status: 404 }
      )
    }

    // Delete the item
    await db.knowledgeItem.delete({
      where: { id: itemId },
    })

    // TODO: Clean up any associated files

    return NextResponse.json(
      successResponse(null, "Knowledge item deleted successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete knowledge item error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
