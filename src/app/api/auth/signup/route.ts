import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { signUpSchema } from "@/lib/validators"
import { successResponse, validationError, errorResponse } from "@/lib/api-response"
import bcrypt from "bcryptjs"

// Default agent configurations for new users
const defaultAgents = [
  {
    name: "Scout Agent",
    type: "scout",
    role: "Lead Research & Discovery",
    description: "Proactively identifies and qualifies high-potential leads using advanced search and analysis. Specializes in company research, market intelligence, and opportunity identification.",
    status: "active",
    isActive: true,
    config: { temperature: 0.3, maxTokens: 2000 },
    capabilities: [
      { name: "webSearch", description: "Search the web for lead information", isActive: true },
      { name: "dataAnalysis", description: "Analyze lead data and patterns", isActive: true },
      { name: "crmIntegration", description: "Integrate with CRM systems", isActive: true },
      { name: "contentGeneration", description: "Generate content", isActive: false },
      { name: "voiceProcessing", description: "Process voice input", isActive: false },
    ],
  },
  {
    name: "Ghostwriter Agent",
    type: "ghostwriter",
    role: "Content Generation & Personalization",
    description: "Crafts personalized outreach content with creative flair and persuasive language. Specializes in email generation, social media content, and personalized messaging.",
    status: "active",
    isActive: true,
    config: { temperature: 0.7, maxTokens: 2000 },
    capabilities: [
      { name: "contentGeneration", description: "Generate personalized content", isActive: true },
      { name: "dataAnalysis", description: "Analyze writing patterns", isActive: true },
      { name: "crmIntegration", description: "Integrate with CRM systems", isActive: true },
      { name: "webSearch", description: "Search the web", isActive: false },
      { name: "voiceProcessing", description: "Process voice input", isActive: false },
    ],
  },
  {
    name: "Secretary Agent",
    type: "secretary",
    role: "Administrative & CRM Management",
    description: "Manages CRM updates, scheduling, and administrative tasks with precision and reliability. Specializes in data entry, calendar management, and workflow automation.",
    status: "active",
    isActive: true,
    config: { temperature: 0.1, maxTokens: 2000 },
    capabilities: [
      { name: "voiceProcessing", description: "Process voice recordings", isActive: true },
      { name: "dataAnalysis", description: "Analyze and structure data", isActive: true },
      { name: "crmIntegration", description: "Update CRM records", isActive: true },
      { name: "webSearch", description: "Search the web", isActive: false },
      { name: "contentGeneration", description: "Generate content", isActive: false },
    ],
  },
]

/**
 * Seeds default agents for a new user
 */
async function seedDefaultAgents(userId: string) {
  for (const agentDef of defaultAgents) {
    // Create agent with config
    const agent = await db.agent.create({
      data: {
        userId,
        name: agentDef.name,
        type: agentDef.type,
        role: agentDef.role,
        description: agentDef.description,
        status: agentDef.status,
        isActive: agentDef.isActive,
        config: {
          create: {
            temperature: agentDef.config.temperature,
            maxTokens: agentDef.config.maxTokens,
          },
        },
      },
    })

    // Create capabilities
    await db.agentCapability.createMany({
      data: agentDef.capabilities.map((cap) => ({
        agentId: agent.id,
        name: cap.name,
        description: cap.description,
        isActive: cap.isActive,
      })),
    })

    // Create initial performance record
    await db.agentPerformance.create({
      data: {
        agentId: agent.id,
        tasksCompleted: 0,
        successRate: 0,
        avgResponseTime: 0,
      },
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = signUpSchema.safeParse(body)
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

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        errorResponse("Email already in use", 409),
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "user",
      },
    })

    // Seed default agents for the new user
    try {
      await seedDefaultAgents(user.id)
      console.log(`Seeded default agents for user ${user.id}`)
    } catch (seedError) {
      // Log but don't fail registration if seeding fails
      console.error("Failed to seed default agents:", seedError)
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      successResponse(userWithoutPassword, "User created successfully", 201),
      { status: 201 }
    )
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
