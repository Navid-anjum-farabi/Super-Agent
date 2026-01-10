import { z } from "zod"

// Agent Validators
export const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  type: z.enum(["scout", "ghostwriter", "secretary"]),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("inactive"),
})

export const updateAgentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const agentConfigSchema = z.object({
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
})

export const apiKeySchema = z.object({
  service: z.string().min(1, "Service name is required"),
  key: z.string().min(1, "API key is required"),
  secret: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

export const promptTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  type: z.enum(["system", "user", "assistant"]),
  template: z.string().min(1, "Template content is required"),
  description: z.string().optional(),
})

// User Validators
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Type exports
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
export type AgentConfigInput = z.infer<typeof agentConfigSchema>
export type ApiKeyInput = z.infer<typeof apiKeySchema>
export type PromptTemplateInput = z.infer<typeof promptTemplateSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
