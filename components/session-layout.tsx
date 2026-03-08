"use client"

import { useState } from "react"
import { CodeEditor } from "./code-editor"
import { VideoPanel } from "./video-panel"
import { ChatPanel } from "./chat-panel"
import { ParticipantsPanel } from "./participants-panel"
import { InterviewInfo } from "./interview-info"
import { DesignCanvas } from "./design-canvas"
import { TerminalOutput, type TerminalLine } from "./terminal-output"
import { Button } from "@/components/ui/button"
import { Code2, Copy, Check, LogOut, Users, MessageSquare, Video, PanelLeftClose, PanelLeft, Palette } from "lucide-react"
import Link from "next/link"
import type { User, Message, InterviewType } from "@/lib/types"

interface SessionLayoutProps {
  sessionId: string
  currentUser: User
  code: string
  language: string
  participants: User[]
  messages: Message[]
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onSendMessage: (content: string) => void
  onLeave: () => void
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onRun?: (code: string, language: string) => void
  isRunning?: boolean
  terminalOutput?: TerminalLine[]
  onClearTerminal?: () => void
  interviewType?: InterviewType
}

export function SessionLayout({
  sessionId,
  currentUser,
  code,
  language,
  participants,
  messages,
  onCodeChange,
  onLanguageChange,
  onSendMessage,
  onLeave,
  localStream,
  remoteStreams,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onRun,
  isRunning = false,
  terminalOutput = [],
  onClearTerminal,
  interviewType = 'coding',
}: SessionLayoutProps) {
  const [copied, setCopied] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "whiteboard">("chat")

  const copySessionLink = async () => {
    const link = `${window.location.origin}/session/${sessionId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Code2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">CodeCollab</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="rounded bg-secondary px-2 py-1 font-mono text-sm text-foreground tracking-wider">
              {sessionId}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={copySessionLink}
            >
              {copied ? <Check className="h-4 w-4 text-online" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg bg-secondary p-1 md:flex">
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              size="sm"
              className={activeTab === "chat" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}
              onClick={() => {
                setActiveTab("chat")
                setShowSidebar(true)
              }}
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Chat
            </Button>
            <Button
              variant={activeTab === "participants" ? "default" : "ghost"}
              size="sm"
              className={activeTab === "participants" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}
              onClick={() => {
                setActiveTab("participants")
                setShowSidebar(true)
              }}
            >
              <Users className="mr-1.5 h-4 w-4" />
              <span>{participants.length}</span>
            </Button>
            {(interviewType === 'uiux' || interviewType === 'frontend') && (
              <Button
                variant={activeTab === "whiteboard" ? "default" : "ghost"}
                size="sm"
                className={activeTab === "whiteboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}
                onClick={() => {
                  setActiveTab("whiteboard")
                  setShowSidebar(true)
                }}
              >
                <Palette className="mr-1.5 h-4 w-4" />
                Canvas
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onLeave}
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor and Terminal */}
        <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
          {/* Code Editor - Top Half */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={onCodeChange}
              onLanguageChange={onLanguageChange}
              onRun={onRun}
              isRunning={isRunning}
            />
          </div>

          {/* Terminal - Bottom Half */}
          <div className="flex-1 min-h-0 border border-border rounded-lg">
            <TerminalOutput
              lines={terminalOutput}
              isRunning={isRunning}
              onClear={onClearTerminal}
            />
          </div>
        </main>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
            {/* Video Section */}
            <div className="border-b border-border p-3">
              <VideoPanel
                localStream={localStream}
                remoteStreams={remoteStreams}
                currentUser={currentUser}
                participants={participants}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                onToggleVideo={onToggleVideo}
                onToggleAudio={onToggleAudio}
              />
            </div>

            {/* Interview Info */}
            <div className="border-b border-border p-3">
              <InterviewInfo
                interviewType={interviewType}
                userRole={currentUser.role}
              />
            </div>

            {/* Tabs for mobile */}
            <div className="flex border-b border-border md:hidden">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "chat"
                    ? "border-b-2 border-accent text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "participants"
                    ? "border-b-2 border-accent text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("participants")}
              >
                Participants ({participants.length})
              </button>
              {(interviewType === 'uiux' || interviewType === 'frontend') && (
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "whiteboard"
                      ? "border-b-2 border-accent text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("whiteboard")}
                >
                  Canvas
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" ? (
                <ChatPanel
                  messages={messages}
                  currentUserId={currentUser.id}
                  onSendMessage={onSendMessage}
                />
              ) : activeTab === "participants" ? (
                <ParticipantsPanel
                  participants={participants}
                  currentUserId={currentUser.id}
                />
              ) : (
                <div className="overflow-auto p-3">
                  <DesignCanvas />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
