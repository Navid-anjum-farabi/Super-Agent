import { NextRequest, NextResponse } from "next/server"
import { signOut } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    // Invalidate the session
    const response = NextResponse.json(
      successResponse({}, "Signed out successfully"),
      { status: 200 }
    )

    // Clear auth cookies
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("next-auth.callback-url")

    return response
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
