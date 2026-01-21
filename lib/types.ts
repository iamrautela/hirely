export interface User {
  id: string
  name: string
  color: string
}

export interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
}

export interface Session {
  id: string
  code: string
  language: string
  participants: User[]
  messages: Message[]
  createdAt: number
}

export interface SessionState {
  sessionId: string | null
  currentUser: User | null
  code: string
  language: string
  participants: User[]
  messages: Message[]
  isConnected: boolean
  setSessionId: (id: string) => void
  setCurrentUser: (user: User) => void
  setCode: (code: string) => void
  setLanguage: (language: string) => void
  addParticipant: (user: User) => void
  removeParticipant: (userId: string) => void
  addMessage: (message: Message) => void
  setConnected: (connected: boolean) => void
  reset: () => void
}
