"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { SessionLayout } from "@/components/session-layout"
import { RoleSelector } from "@/components/role-selector"
import { InterviewInfo } from "@/components/interview-info"
import { ProjectPortfolio } from "@/components/project-portfolio"
import { UIUXChallenge } from "@/components/uiux-challenge"
import { AIMLProblem } from "@/components/aiml-problem"
import { EvaluationRubric } from "@/components/evaluation-rubric"
import { useSessionSync } from "@/hooks/use-session-sync"
import { useMediaStream } from "@/hooks/use-media-stream"
import { useCodeExecution } from "@/hooks/use-code-execution"
import { generateUserId, getRandomColor } from "@/lib/store"
import type { User, Message, UserRole, InterviewType, DesignChallenge, AIMLProblem as AIMLProblemType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2 } from "lucide-react"

const ADJECTIVES = ["Swift", "Clever", "Bright", "Quick", "Sharp", "Smart", "Bold", "Cool"]
const NOUNS = ["Coder", "Dev", "Hacker", "Ninja", "Wizard", "Guru", "Master", "Pro"]

function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}${noun}`
}

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [userName, setUserName] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [participants, setParticipants] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [interviewType, setInterviewType] = useState<InterviewType>('coding')
  const [showRoleSelector, setShowRoleSelector] = useState(true)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [designChallenge, setDesignChallenge] = useState<DesignChallenge | null>(null)
  const [aimlProblem, setAIMLProblem] = useState<AIMLProblemType | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [challengeStarted, setChallengeStarted] = useState(false)

  const {
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    stopMedia,
  } = useMediaStream()

  const {
    output,
    isRunning,
    executeCode,
    clearOutput,
  } = useCodeExecution()

  const handleCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  const handleLanguageUpdate = useCallback((newLanguage: string) => {
    setLanguage(newLanguage)
  }, [])

  const handleRunCode = useCallback((code: string, language: string) => {
    executeCode(code, { language, timeout: 5000 })
  }, [executeCode])

  const handleStartChallenge = useCallback(() => {
    setChallengeStarted(true)
    // Initialize timer based on challenge type
    if (designChallenge) {
      setTimeRemaining(designChallenge.timeLimit)
    } else if (aimlProblem) {
      setTimeRemaining(aimlProblem.timeLimit)
    }
  }, [designChallenge, aimlProblem])

  const handleUploadDataset = useCallback((file: File) => {
    // Handle dataset upload for AI/ML
    console.log("[hirely] Uploading dataset:", file.name)
  }, [])

  const handleParticipantJoin = useCallback((user: User) => {
    setParticipants((prev) => {
      if (prev.some((p) => p.id === user.id)) return prev
      return [...prev, user]
    })
  }, [])

  const handleParticipantLeave = useCallback((userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId))
    setRemoteStreams((prev) => {
      const newMap = new Map(prev)
      newMap.delete(userId)
      return newMap
    })
  }, [])

  const handleMessageReceive = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const handleRemoteStream = useCallback((userId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const newMap = new Map(prev)
      newMap.set(userId, stream)
      return newMap
    })
  }, [])

  const handleInitialState = useCallback(
    (initialCode: string, initialLanguage: string, initialParticipants: User[]) => {
      setCode(initialCode)
      setLanguage(initialLanguage)
      setParticipants(initialParticipants)
    },
    []
  )

  const {
    isConnected,
    sendCodeUpdate,
    sendLanguageUpdate,
    sendMessage,
    setLocalStream,
    leaveSession,
  } = useSessionSync({
    sessionId,
    currentUser: currentUser || { id: "", name: "", color: "" },
    onCodeUpdate: handleCodeUpdate,
    onLanguageUpdate: handleLanguageUpdate,
    onParticipantJoin: handleParticipantJoin,
    onParticipantLeave: handleParticipantLeave,
    onMessageReceive: handleMessageReceive,
    onRemoteStream: handleRemoteStream,
    onInitialState: handleInitialState,
  })

  // Set local stream when available
  useEffect(() => {
    if (localStream) {
      setLocalStream(localStream)
    }
  }, [localStream, setLocalStream])

  const handleRoleSelect = async (name: string, role: UserRole) => {
    setIsJoining(true)
    const user: User = {
      id: generateUserId(),
      name,
      color: getRandomColor(),
      role,
      interviewType,
    }
    setCurrentUser(user)
    setShowRoleSelector(false)

    // Initialize media
    await initializeMedia()
  }

  const handleJoinSession = async () => {
    setIsJoining(true)
    const user: User = {
      id: generateUserId(),
      name: userName.trim() || generateRandomName(),
      color: getRandomColor(),
      role: 'candidate',
      interviewType,
    }
    setCurrentUser(user)

    // Initialize media
    await initializeMedia()
  }

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode)
      sendCodeUpdate(newCode)
    },
    [sendCodeUpdate]
  )

  const handleLanguageChange = useCallback(
    (newLanguage: string) => {
      setLanguage(newLanguage)
      sendLanguageUpdate(newLanguage)
    },
    [sendLanguageUpdate]
  )

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!currentUser) return
      const message: Message = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        content,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, message])
      sendMessage(message)
    },
    [currentUser, sendMessage]
  )

  const handleLeave = useCallback(() => {
    leaveSession()
    stopMedia()
    router.push("/")
  }, [leaveSession, stopMedia, router])

  // Show role selector if not joined yet
  if (!currentUser && showRoleSelector) {
    return (
      <RoleSelector
        onSelect={handleRoleSelect}
        interviewType={interviewType}
      />
    )
  }

  // Show join form if not joined yet
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Code2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Join Session</h1>
            <p className="mt-2 text-muted-foreground">
              Session code: <span className="font-mono text-foreground">{sessionId}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Your name (optional)
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name or get a random one"
                className="bg-input text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
              />
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={handleJoinSession}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join Session"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By joining, you agree to allow camera and microphone access for video chat
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show UI/UX challenge if applicable
  if (interviewType === 'uiux' && designChallenge) {
    return (
      <div className="flex min-h-screen flex-col bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Design Challenge</h1>
          <Button variant="outline" onClick={() => setDesignChallenge(null)}>
            Back to Interview
          </Button>
        </div>
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <UIUXChallenge
              challenge={designChallenge}
              timeRemaining={timeRemaining}
              onStart={handleStartChallenge}
              isStarted={challengeStarted}
            />
          </div>
          {currentUser?.role === 'interviewer' && challengeStarted && (
            <div className="w-96 overflow-auto border-l border-border pl-6">
              <EvaluationRubric
                criteria={designChallenge.evaluationCriteria}
                isEvaluating={true}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show AI/ML problem if applicable
  if (interviewType === 'aiml' && aimlProblem) {
    return (
      <div className="flex min-h-screen flex-col bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">ML Problem</h1>
          <Button variant="outline" onClick={() => setAIMLProblem(null)}>
            Back to Interview
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <AIMLProblem
            problem={aimlProblem}
            timeRemaining={timeRemaining}
            onUploadDataset={handleUploadDataset}
            onStart={handleStartChallenge}
            isStarted={challengeStarted}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SessionLayout
        sessionId={sessionId}
        currentUser={currentUser}
        code={code}
        language={language}
        participants={participants.length > 0 ? participants : [currentUser]}
        messages={messages}
        onCodeChange={handleCodeChange}
        onLanguageChange={handleLanguageChange}
        onSendMessage={handleSendMessage}
        onLeave={handleLeave}
        localStream={localStream}
        remoteStreams={remoteStreams}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onRun={handleRunCode}
        isRunning={isRunning}
        terminalOutput={output}
        onClearTerminal={clearOutput}
        interviewType={interviewType}
      />
      {showPortfolio && currentUser && (
        <div className="border-t border-border bg-card p-4">
          <ProjectPortfolio user={currentUser} />
        </div>
      )}
    </div>
  )
}
