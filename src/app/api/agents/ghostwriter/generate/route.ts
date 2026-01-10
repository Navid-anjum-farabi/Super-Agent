import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, action, instruction, tone, length, focus } = body

    // Simulate Ghostwriter Agent processing
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Mock response based on action
    let response
    switch (action) {
      case 'generate':
        response = {
          id: leadId,
          status: 'generated',
          drafts: [
            {
              id: 'draft_1',
              subject: 'Re: Scaling Your Sales Operations with AI',
              body: `Hi Sarah,

Congratulations on the recent Series B funding! It's exciting to see TechVentures' rapid growth in the FinTech space.

Given your expansion plans and the recent funding, I thought you might be interested in how our AI-powered sales automation platform can help you:

• Scale your sales operations 3x without increasing headcount
• Automate lead qualification and follow-ups
• Integrate seamlessly with your existing CRM stack
• Provide real-time analytics and insights

Several companies in your space have seen 40% improvement in sales efficiency after implementing our solution.

Would you be open to a brief 15-minute call next week to explore how this could support your expansion goals?

Best regards,
Alex`,
              tone: tone || 'professional',
              length: length || 'medium',
              focus: focus || 'solution',
              confidence: 94
            }
          ]
        }
        break
      
      case 'refine':
        response = {
          id: leadId,
          status: 'refined',
          originalId: body.originalId,
          refinedDraft: {
            subject: 'Congrats on the funding! 🚀',
            body: `Sarah - Huge congrats on the $50M Series B! Saw the news on TechCrunch and had to reach out.

With you scaling the sales team, thought you might want to check out how we're helping companies like yours automate their sales workflow. Our AI platform basically acts like a 24/7 sales assistant.

Companies using it see 3x better conversion rates and their sales teams love it (actually use it, which is rare 😅).

Worth a quick chat? 

Cheers,
Alex`,
            tone: 'casual',
            length: 'short',
            focus: 'value',
            confidence: 87
          }
        }
        break
      
      default:
        throw new Error('Invalid action')
    }

    return NextResponse.json({
      success: true,
      agent: 'ghostwriter',
      action,
      timestamp: new Date().toISOString(),
      data: response
    })

  } catch (error) {
    console.error('Ghostwriter Agent API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}