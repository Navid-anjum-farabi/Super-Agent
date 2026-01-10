import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    return NextResponse.json(
      successResponse(session, "Session retrieved successfully"),
      { status: 200 }
    )
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
