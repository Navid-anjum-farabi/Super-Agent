import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'db', 'ghostwriter-settings.json')

export async function GET() {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Unable to read settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Basic validation
    const allowed = ['tone', 'length', 'focus', 'instruction', 'apiEndpoint', 'apiKey']
    const sanitized: any = {}
    for (const k of allowed) {
      if (body[k] !== undefined) sanitized[k] = body[k]
    }

    // Merge with existing file
    let current = {}
    try {
      const raw = await fs.readFile(SETTINGS_PATH, 'utf-8')
      current = JSON.parse(raw)
    } catch (e) {
      current = {}
    }

    const merged = { ...current, ...sanitized }
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8')

    return NextResponse.json({ ok: true, settings: merged })
  } catch (err) {
    return NextResponse.json({ error: 'Unable to save settings' }, { status: 500 })
  }
}
