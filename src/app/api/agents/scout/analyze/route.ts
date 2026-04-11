import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { db } from "@/lib/db"
import { z } from "zod"

// --- Agent Core Engine (single-component) ---

type ScoutLeadInput = {
  companyName?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  contactName?: string
  title?: string
  notes?: string
  rawData?: unknown
}

// Extra fields passed from admin/front-end to control which prompt to use
// These are not sent to the LLM directly as-is, but used to look up templates.
type ScoutAnalyzeInput = ScoutLeadInput & {
  promptId?: string
  promptName?: string
}

type ScoutResult = {
  qualification: "qualified" | "unqualified" | "uncertain"
  score: number
  reasons: string[]
  nextSteps: string[]
  rawExplanation: string
}

type ScoutEngineConfig = {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

async function runScoutAgent(
  lead: ScoutLeadInput,
  cfg: ScoutEngineConfig
): Promise<ScoutResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL ?? "openrouter/gpt-4o-mini"

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  const messages = [
    {
      role: "system" as const,
      content: cfg.systemPrompt,
    },
    {
      role: "user" as const,
      content: cfg.userPrompt,
    },
  ]

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: cfg.temperature ?? 0.3,
      max_tokens: cfg.maxTokens ?? 1024,
      messages,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${text}`)
  }

  const json = await res.json()
  const content: string = json.choices?.[0]?.message?.content ?? ""

  let parsed: any
  try {
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return {
      qualification: "uncertain",
      score: 50,
      reasons: [
        "Could not parse model output as JSON.",
        content.slice(0, 300),
      ],
      nextSteps: ["Review this lead manually."],
      rawExplanation: content,
    }
  }

  return {
    qualification: parsed.qualification ?? "uncertain",
    score: typeof parsed.score === "number" ? parsed.score : 50,
    reasons: Array.isArray(parsed.reasons)
      ? parsed.reasons
      : [parsed.reasons ?? "No reasons provided."],
    nextSteps: Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps
      : [parsed.nextSteps ?? "No next steps provided."],
    rawExplanation: content,
  }
}

// --- Input validation (simple Zod schema) ---

const leadSchema = z.object({
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  contactName: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  rawData: z.unknown().optional(),
  promptId: z.string().uuid().optional(),
  promptName: z.string().optional(),
})

// --- HTTP endpoint ---

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json(errorResponse("Unauthorized", 401), {
        status: 401,
      })
    }

    const body = await request.json()
    const parseResult = leadSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        errorResponse("Invalid lead payload", 400),
        { status: 400 }
      )
    }

    const { promptId, promptName, ...lead } = parseResult.data as ScoutAnalyzeInput

    // Load Scout Agent with config and prompt templates for this user
    const agent = await db.agent.findFirst({
      where: { userId: session.user.id, type: "scout" },
      include: { config: true, promptTemplates: true },
    })

    if (!agent) {
      return NextResponse.json(
        errorResponse("Scout Agent not found. Please create it first.", 404),
        { status: 404 }
      )
    }

    // Resolve selected prompt from admin/front-end
    let selectedPrompt = null as (typeof agent.promptTemplates)[number] | null
    if (promptId) {
      selectedPrompt = agent.promptTemplates.find((p) => p.id === promptId) ?? null
    } else if (promptName) {
      selectedPrompt =
        agent.promptTemplates.find((p) => p.name === promptName) ?? null
    }

    // System prompt: prefer dedicated system template, fallback to a generic one
    const systemTemplate =
      agent.promptTemplates.find(
        (p) => p.type === "system" && p.name === "Lead Analysis"
      )?.template ??
      "You are the Scout Agent, an expert in B2B lead research and qualification. " +
        "You strictly follow the configured prompts and return JSON only."

    // User prompt: use selected template or generic evaluation template
    const baseUserTemplate =
      selectedPrompt?.template ??
      "Evaluate the following lead and return JSON with qualification, score, reasons, and nextSteps. Lead data: {leadData}"

    const userPrompt = baseUserTemplate
      .replace("{companyName}", lead.companyName ?? "")
      .replace("{leadData}", JSON.stringify(lead, null, 2))

    const result = await runScoutAgent(lead, {
      systemPrompt: systemTemplate,
      userPrompt,
      temperature: (agent.config as any)?.temperature ?? 0.3,
      maxTokens: (agent.config as any)?.maxTokens ?? 1024,
    })

    return NextResponse.json(
      successResponse(result, "Lead analyzed successfully", 200),
      { status: 200 }
    )
  } catch (error) {
    console.error("Scout Agent API Error:", error)
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Internal server error",
        500
      ),
      { status: 500 }
    )
  }
}
