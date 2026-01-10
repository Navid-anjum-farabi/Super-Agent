import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import { authConfig } from "./auth"
import { errorResponse } from "./api-response"

export async function withAuth(
  handler: (req: NextRequest, { params }: any) => Promise<Response>,
  requiredRole?: string
) {
  return async (req: NextRequest, { params }: any) => {
    try {
      const session = await getServerSession(authConfig)

      if (!session) {
        return NextResponse.json(
          errorResponse("Unauthorized: No session", 401),
          { status: 401 }
        )
      }

      if (requiredRole && session.user.role !== requiredRole && session.user.role !== "admin") {
        return NextResponse.json(
          errorResponse("Forbidden: Insufficient permissions", 403),
          { status: 403 }
        )
      }

      // Add user to request context
      ;(req as any).user = session.user

      return handler(req, { params })
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        errorResponse("Internal server error", 500),
        { status: 500 }
      )
    }
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authConfig)
  return session?.user
}
