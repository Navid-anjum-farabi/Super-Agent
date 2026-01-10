import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { db } from "@/lib/db"
import { createAgentSchema, agentConfigSchema, promptTemplateSchema } from "@/lib/validators"
import { successResponse, errorResponse } from "@/lib/api-response"

// Create a pre-configured Scout Agent
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session) {
      return NextResponse.json(
        errorResponse("Unauthorized", 401),
        { status: 401 }
      )
    }

    // Check if user already has a Scout Agent
    const existingScoutAgent = await db.agent.findFirst({
      where: { 
        userId: session.user.id,
        type: "scout"
      }
    })

    if (existingScoutAgent) {
      return NextResponse.json(
        errorResponse("You already have a Scout Agent", 409),
        { status: 409 }
      )
    }

    // Create Scout Agent with default configuration
    const agent = await db.agent.create({
      data: {
        userId: session.user.id,
        name: "Scout Agent",
        type: "scout",
        role: "Lead Research & Discovery",
        description: "Proactively identifies and qualifies high-potential leads using advanced search and analysis. Specializes in company research, market intelligence, and opportunity identification.",
        status: "active",
        isActive: true,
        lastActivity: new Date(),
        config: {
          create: {
            temperature: 0.3, // Lower temperature for more factual analysis
            maxTokens: 3000,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
          },
        },
        capabilities: {
          create: [
            {
              name: "Company Research",
              description: "Comprehensive analysis of company profiles, financials, and market position",
              isActive: true
            },
            {
              name: "Lead Qualification",
              description: "Evaluates leads based on BANT criteria and custom scoring models",
              isActive: true
            },
            {
              name: "Market Intelligence",
              description: "Gathers and analyzes market trends, competitor activities, and industry insights",
              isActive: true
            },
            {
              name: "Opportunity Identification",
              description: "Identifies high-potential opportunities and timing for outreach",
              isActive: true
            }
          ]
        },
        performance: {
          create: {
            tasksCompleted: 0,
            successRate: 0.0,
            avgResponseTime: 0.0,
          }
        },
        promptTemplates: {
          create: [
            {
              name: "Lead Analysis",
              type: "system",
              template: "You are the Scout Agent, an expert in lead research and qualification. Your task is to analyze leads and provide comprehensive insights including company profile, market position, recent activities, and potential opportunities. Be thorough, factual, and provide actionable recommendations.",
              description: "System prompt for lead analysis tasks"
            },
            {
              name: "Company Research",
              type: "user",
              template: "Research the following company: {companyName}. Provide detailed information about their industry, size, location, revenue, recent news, key decision makers, and any relevant market intelligence.",
              description: "Template for company research requests"
            },
            {
              name: "Lead Qualification",
              type: "user",
              template: "Evaluate the following lead for potential: {leadData}. Rate their potential on a scale of 1-100 and provide specific reasons for your rating. Include at least 3 actionable next steps.",
              description: "Template for lead qualification"
            }
          ]
        }
      },
      include: {
        config: true,
        apiKeys: true,
        promptTemplates: true,
        capabilities: true,
        performance: true,
      },
    })

    return NextResponse.json(
      successResponse(agent, "Scout Agent created successfully", 201),
      { status: 201 }
    )
  } catch (error) {
    console.error("Create Scout Agent error:", error)
    return NextResponse.json(
      errorResponse("Internal server error", 500),
      { status: 500 }
    )
  }
}
