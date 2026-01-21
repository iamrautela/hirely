"use client"

import { create } from "zustand"
import type { SessionState, User, Message } from "./types"

const USER_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
]

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  currentUser: null,
  code: `// Welcome to CodeCollab!
// Start coding here...

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`,
  language: "javascript",
  participants: [],
  messages: [],
  isConnected: false,

  setSessionId: (id) => set({ sessionId: id }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  addParticipant: (user) =>
    set((state) => ({
      participants: state.participants.some((p) => p.id === user.id)
        ? state.participants
        : [...state.participants, user],
    })),
  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== userId),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setConnected: (connected) => set({ isConnected: connected }),
  reset: () =>
    set({
      sessionId: null,
      currentUser: null,
      code: "",
      language: "javascript",
      participants: [],
      messages: [],
      isConnected: false,
    }),
}))
