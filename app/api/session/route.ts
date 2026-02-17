import { NextResponse } from "next/server"
import { createSession, getSession, updateSessionCode, updateSessionLanguage, addParticipant, removeParticipant, addMessage } from "@/lib/sessions"
import type { User, Message } from "@/lib/types"

export const dynamic = 'force-dynamic'

// Create a new session
export async function POST() {
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
  const session = createSession(sessionId)
  return NextResponse.json({ sessionId: session.id })
}

// Get session or update session
export async function PUT(request: Request) {
  const body = await request.json()
  const { action, sessionId, code, language, user, userId, message } = body

  const session = getSession(sessionId)
  
  if (action === "check") {
    return NextResponse.json({ exists: !!session })
  }

  if (!session) {
    // Create session if it doesn't exist (for join links)
    const newSession = createSession(sessionId)
    return NextResponse.json(newSession)
  }

  switch (action) {
    case "get":
      return NextResponse.json(session)
    
    case "updateCode":
      updateSessionCode(sessionId, code)
      return NextResponse.json({ success: true })
    
    case "updateLanguage":
      updateSessionLanguage(sessionId, language)
      return NextResponse.json({ success: true })
    
    case "join":
      addParticipant(sessionId, user as User)
      return NextResponse.json(session)
    
    case "leave":
      removeParticipant(sessionId, userId)
      return NextResponse.json({ success: true })
    
    case "message":
      addMessage(sessionId, message as Message)
      return NextResponse.json({ success: true })
    
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
