export type InterviewType = 'coding' | 'frontend' | 'backend' | 'uiux' | 'aiml' | 'devops' | 'fullstack'
export type UserRole = 'interviewer' | 'candidate'
export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

// Phase 1: UI/UX and AI/ML Module Types
export interface DesignChallenge {
  id: string
  title: string
  description: string
  problem: string
  requirements: string[]
  wireframe?: string
  difficulty: ProblemDifficulty
  timeLimit: number
  evaluationCriteria: EvaluationCriterion[]
}

export interface EvaluationCriterion {
  id: string
  name: string
  description: string
  weight: number // 0-1
  maxPoints: number
}

export interface AIMLDataset {
  id: string
  name: string
  description: string
  fileUrl: string
  rows: number
  columns: string[]
  uploadedAt: number
}

export interface AIMLMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix?: number[][]
}

export interface AIMLProblem {
  id: string
  title: string
  description: string
  dataset: AIMLDataset
  targetVariable: string
  modelType: 'classification' | 'regression' | 'clustering'
  metrics: AIMLMetrics
  conceptQuestions: string[]
  timeLimit: number
}

// Phase 2: Dashboard Types
export interface Interview {
  id: string
  candidateId: string
  interviewerId: string
  interviewType: InterviewType
  scheduledAt: number
  duration: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  feedback?: InterviewFeedback
}

export interface InterviewFeedback {
  overallScore: number
  criteriaScores: Map<string, number>
  strengths: string[]
  improvements: string[]
  recommendation: 'hire' | 'maybe' | 'reject'
}

// Phase 3: Scheduling Types
export interface TimeSlot {
  id: string
  interviewerId: string
  startTime: number
  endTime: number
  available: boolean
}

export interface SchedulingRequest {
  candidateId: string
  interviewType: InterviewType
  preferredDates: number[]
  notes?: string
}

export interface Project {
  id: string
  title: string
  description: string
  url: string
  imageUrl?: string
  tech: string[]
  likes: number
}

export interface Whiteboard {
  id: string
  lines: DrawingLine[]
  shapes: Shape[]
  text: TextElement[]
}

export interface DrawingLine {
  id: string
  points: Array<{ x: number; y: number }>
  color: string
  width: number
}

export interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'triangle'
  x: number
  y: number
  width: number
  height: number
  color: string
}

export interface TextElement {
  id: string
  content: string
  x: number
  y: number
  fontSize: number
  color: string
}

export interface User {
  id: string
  name: string
  color: string
  role: UserRole
  interviewType?: InterviewType
  avatar?: string
  projects?: Project[]
}

export interface Problem {
  id: string
  title: string
  description: string
  difficulty: ProblemDifficulty
  examples: Array<{ input: string; output: string }>
  timeLimit: number
}

export interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'code-snippet' | 'link'
}

export interface Session {
  id: string
  code: string
  language: string
  interviewType: InterviewType
  participants: User[]
  messages: Message[]
  createdAt: number
  problem?: Problem
  whiteboard?: Whiteboard
  isScreenSharing?: boolean
  screenshareUserId?: string
}

export interface SessionState {
  sessionId: string | null
  currentUser: User | null
  code: string
  language: string
  participants: User[]
  messages: Message[]
  isConnected: boolean
  interviewType: InterviewType
  whiteboard: Whiteboard | null
  isScreenSharing: boolean
  screenshareUserId: string | null
  setSessionId: (id: string) => void
  setCurrentUser: (user: User) => void
  setCode: (code: string) => void
  setLanguage: (language: string) => void
  addParticipant: (user: User) => void
  removeParticipant: (userId: string) => void
  addMessage: (message: Message) => void
  setConnected: (connected: boolean) => void
  setInterviewType: (type: InterviewType) => void
  updateWhiteboard: (whiteboard: Whiteboard) => void
  setScreenSharing: (sharing: boolean, userId?: string) => void
  reset: () => void
}
