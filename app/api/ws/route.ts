// WebSocket-like polling endpoint for real-time sync
// Since true WebSockets require a separate server, we use Server-Sent Events + API polling

import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// In-memory event store for each session
const sessionEvents = new Map<string, Array<{ id: string; data: unknown; timestamp: number }>>()
const sessionClients = new Map<string, Set<string>>()
const sessionState = new Map<string, { code: string; language: string }>()

// Clean up old events periodically
function cleanupOldEvents(sessionId: string) {
  const events = sessionEvents.get(sessionId)
  if (events) {
    const cutoff = Date.now() - 30000 // Keep events for 30 seconds
    const filtered = events.filter((e) => e.timestamp > cutoff)
    sessionEvents.set(sessionId, filtered)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")
  const userId = searchParams.get("userId")
  const lastEventId = searchParams.get("lastEventId")

  if (!sessionId || !userId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  cleanupOldEvents(sessionId)

  const events = sessionEvents.get(sessionId) || []
  const lastId = lastEventId ? parseInt(lastEventId) : 0
  
  // Get events after lastEventId
  const newEvents = events.filter((e) => parseInt(e.id) > lastId)
  
  // Get current state
  const state = sessionState.get(sessionId) || { code: "", language: "javascript" }
  
  // Get participants
  const clients = sessionClients.get(sessionId) || new Set()

  return NextResponse.json({
    events: newEvents,
    state,
    participants: Array.from(clients),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, sessionId, userId, userName, userColor, code, language, message, offer, answer, candidate, targetUserId } = body

  if (!sessionId || !userId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  // Initialize session data structures if needed
  if (!sessionEvents.has(sessionId)) {
    sessionEvents.set(sessionId, [])
  }
  if (!sessionClients.has(sessionId)) {
    sessionClients.set(sessionId, new Set())
  }
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, {
      code: `// Welcome to CodeCollab!
// Start coding here...

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`,
      language: "javascript",
    })
  }

  const events = sessionEvents.get(sessionId)!
  const clients = sessionClients.get(sessionId)!
  const state = sessionState.get(sessionId)!
  const eventId = Date.now().toString()

  switch (type) {
    case "join":
      clients.add(JSON.stringify({ id: userId, name: userName, color: userColor }))
      events.push({
        id: eventId,
        data: { type: "user-joined", userId, userName, userColor },
        timestamp: Date.now(),
      })
      // Send current state to the joining user
      return NextResponse.json({
        success: true,
        state,
        participants: Array.from(clients).map((c) => JSON.parse(c)),
      })

    case "leave":
      const toRemove = Array.from(clients).find((c) => {
        const parsed = JSON.parse(c)
        return parsed.id === userId
      })
      if (toRemove) {
        clients.delete(toRemove)
      }
      events.push({
        id: eventId,
        data: { type: "user-left", userId },
        timestamp: Date.now(),
      })
      break

    case "code-update":
      state.code = code
      events.push({
        id: eventId,
        data: { type: "code-update", userId, code },
        timestamp: Date.now(),
      })
      break

    case "language-update":
      state.language = language
      events.push({
        id: eventId,
        data: { type: "language-update", userId, language },
        timestamp: Date.now(),
      })
      break

    case "chat-message":
      events.push({
        id: eventId,
        data: { type: "chat-message", userId, message },
        timestamp: Date.now(),
      })
      break

    case "offer":
    case "answer":
    case "ice-candidate":
      events.push({
        id: eventId,
        data: { type, userId, targetUserId, offer, answer, candidate },
        timestamp: Date.now(),
      })
      break
  }

  // Cleanup old events
  cleanupOldEvents(sessionId)

  return NextResponse.json({ success: true, eventId })
}
