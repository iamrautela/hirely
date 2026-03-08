"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Users, Video, MessageSquare, ArrowRight, Zap, Palette, Brain, Cpu, Server, FileText, Wind, LayoutGrid, Calendar } from "lucide-react"
import type { InterviewType } from "@/lib/types"

const INTERVIEW_TYPES: Array<{
  id: InterviewType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  tech: string[]
}> = [
  {
    id: 'coding',
    title: 'Coding Interview',
    description: 'Algorithm and data structure problem solving',
    icon: <Code2 className="h-6 w-6" />,
    color: 'bg-blue-500/20 text-blue-500',
    tech: ['Python', 'JavaScript', 'Java', 'C++'],
  },
  {
    id: 'frontend',
    title: 'Frontend Interview',
    description: 'HTML, CSS, JavaScript & React expertise',
    icon: <Palette className="h-6 w-6" />,
    color: 'bg-purple-500/20 text-purple-500',
    tech: ['React', 'Vue', 'Angular', 'CSS'],
  },
  {
    id: 'backend',
    title: 'Backend Interview',
    description: 'Server-side development and APIs',
    icon: <Server className="h-6 w-6" />,
    color: 'bg-green-500/20 text-green-500',
    tech: ['Node.js', 'Python', 'Go', 'Java'],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Interview',
    description: 'Both frontend and backend skills',
    icon: <Wind className="h-6 w-6" />,
    color: 'bg-cyan-500/20 text-cyan-500',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'uiux',
    title: 'UI/UX Interview',
    description: 'Design thinking and prototyping',
    icon: <Palette className="h-6 w-6" />,
    color: 'bg-pink-500/20 text-pink-500',
    tech: ['Figma', 'Design Systems', 'Prototyping', 'UX Research'],
  },
  {
    id: 'aiml',
    title: 'AI/ML Interview',
    description: 'Machine learning and data science',
    icon: <Brain className="h-6 w-6" />,
    color: 'bg-orange-500/20 text-orange-500',
    tech: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
  },
  {
    id: 'devops',
    title: 'DevOps Interview',
    description: 'Infrastructure and deployment',
    icon: <Cpu className="h-6 w-6" />,
    color: 'bg-red-500/20 text-red-500',
    tech: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
  },
]

export default function HomePage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null)

  const createSession = async (type: InterviewType) => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/session", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewType: type })
      })
      const data = await response.json()
      router.push(`/session/${data.sessionId}`)
    } catch (error) {
      console.error(error)
      setIsCreating(false)
    }
  }

  const joinSession = async () => {
    if (!joinCode.trim()) return
    setIsJoining(true)
    router.push(`/session/${joinCode.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity">
              <Code2 className="h-6 w-6" />
              Hirely
            </Link>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/schedule" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Schedule
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">AI-powered technical interviews</span>
          </div>
          
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Hire the right talent,
            <br />
            <span className="text-accent">with Hirely</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            The complete platform for technical interviews with coding challenges, design assessments, 
            AI/ML problems, and real-time collaboration - all in your browser.
          </p>

          {/* Action Section */}
          <div className="mt-12 flex w-full max-w-md flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinSession()}
                className="flex-1 bg-input text-foreground placeholder:text-muted-foreground uppercase tracking-wider"
                maxLength={6}
              />
              <Button 
                variant="secondary" 
                onClick={joinSession}
                disabled={!joinCode.trim() || isJoining}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {isJoining ? "Joining..." : "Join"}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">start a new interview</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
        </div>

        {/* Interview Types Grid */}
        <div className="mt-32">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Choose Interview Type</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => selectedType === type.id ? setSelectedType(null) : setSelectedType(type.id)}
                className={`rounded-xl border-2 p-6 text-left transition-all ${
                  selectedType === type.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${type.color}`}>
                  {type.icon}
                </div>
                <h3 className="mb-2 font-semibold text-card-foreground">{type.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{type.description}</p>
                <div className="flex flex-wrap gap-1">
                  {type.tech.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs rounded bg-secondary px-2 py-1 text-secondary-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          {selectedType && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={() => createSession(selectedType)}
                disabled={isCreating}
                className="gap-2"
              >
                {isCreating ? 'Creating Session...' : `Start ${INTERVIEW_TYPES.find(t => t.id === selectedType)?.title}`}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Code2 className="h-6 w-6" />}
            title="Multi-Language Editor"
            description="Full-featured Monaco editor with 50+ languages and syntax highlighting"
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Real-time Collaboration"
            description="See changes instantly as teams collaborate on code"
          />
          <FeatureCard
            icon={<Video className="h-6 w-6" />}
            title="Built-in Video Chat"
            description="WebRTC peer-to-peer video with screen sharing"
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Portfolio Showcase"
            description="Share and discuss projects in real-time"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          <StatCard value="7" label="Interview types" />
          <StatCard value="50+" label="Languages supported" />
          <StatCard value="P2P" label="Video connection" />
          <StatCard value="Instant" label="Code sync" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          Built for developers, by developers
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card p-6 text-center">
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
