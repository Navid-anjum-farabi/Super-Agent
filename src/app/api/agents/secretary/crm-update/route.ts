import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, action, data } = body

    // Simulate Secretary Agent processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock response based on action
    let response
    switch (action) {
      case 'crm-update':
        response = {
          id: leadId,
          status: 'updated',
          crmUpdates: {
            leadStatus: 'contacted',
            lastActivity: new Date().toISOString(),
            notes: data.notes || 'Initial outreach completed via AI agent',
            nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            tags: ['AI-generated', 'high-priority', 'series-b-funded'],
            assignedTo: 'alex@company.com'
          }
        }
        break
      
      case 'schedule-followup':
        response = {
          id: leadId,
          status: 'scheduled',
          followup: {
            type: 'email',
            scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            template: 'follow-up-series-b',
            priority: 'high'
          }
        }
        break
      
      case 'voice-update':
        response = {
          id: leadId,
          status: 'processed',
          transcription: {
            text: data.transcription || "Just finished a great call with Sarah from TechVentures. They're very interested in our AI automation platform, especially the scalability features. They want to schedule a demo with their technical team next week. I should prepare a custom proposal focusing on their expansion plans.",
            summary: "Positive call outcome. Lead interested in scalability features. Technical demo requested. Custom proposal needed.",
            actionItems: [
              "Schedule technical demo",
              "Prepare custom proposal",
              "Follow up with technical requirements"
            ],
            confidence: 92
          }
        }
        break
      
      default:
        throw new Error('Invalid action')
    }

    return NextResponse.json({
      success: true,
      agent: 'secretary',
      action,
      timestamp: new Date().toISOString(),
      data: response
    })

  } catch (error) {
    console.error('Secretary Agent API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}