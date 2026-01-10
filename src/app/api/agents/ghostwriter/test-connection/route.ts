import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { apiEndpoint, apiKey } = body

    // Simulate 3 second network test (as requested)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Basic simulated check
    if (!apiEndpoint || !apiKey) {
      return NextResponse.json({ ok: false, message: 'Missing endpoint or key' }, { status: 400 })
    }

    // For demo purposes, any apiKey starting with "bad" will fail
    if (apiKey.startsWith('bad')) {
      return NextResponse.json({ ok: false, message: 'Authentication failed' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, message: 'Connection successful' })
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Error testing connection' }, { status: 500 })
  }
}
