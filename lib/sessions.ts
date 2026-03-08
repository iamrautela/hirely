import type { Session, User, Message, InterviewType } from "./types"

// In-memory session storage (works for demo purposes)
const sessions = new Map<string, Session>()

export function createSession(id: string, interviewType: InterviewType = 'coding'): Session {
  const session: Session = {
    id,
    code: `// Welcome to CodeCollab!
// Start coding here...

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`,
    language: "javascript",
    interviewType,
    participants: [],
    messages: [],
    createdAt: Date.now(),
    isScreenSharing: false,
  }
  sessions.set(id, session)
  return session
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id)
}

export function updateSessionCode(id: string, code: string): void {
  const session = sessions.get(id)
  if (session) {
    session.code = code
  }
}

export function updateSessionLanguage(id: string, language: string): void {
  const session = sessions.get(id)
  if (session) {
    session.language = language
  }
}

export function updateSessionInterviewType(id: string, interviewType: InterviewType): void {
  const session = sessions.get(id)
  if (session) {
    session.interviewType = interviewType
  }
}

export function addParticipant(sessionId: string, user: User): void {
  const session = sessions.get(sessionId)
  if (session && !session.participants.some((p) => p.id === user.id)) {
    session.participants.push(user)
  }
}

export function removeParticipant(sessionId: string, userId: string): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.participants = session.participants.filter((p) => p.id !== userId)
  }
}

export function addMessage(sessionId: string, message: Message): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.messages.push(message)
  }
}

export function updateScreenSharing(sessionId: string, isSharing: boolean, userId?: string): void {
  const session = sessions.get(sessionId)
  if (session) {
    session.isScreenSharing = isSharing
    session.screenshareUserId = userId || undefined
  }
}

export function deleteSession(id: string): void {
  sessions.delete(id)
}
