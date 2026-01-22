"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Users, Video, MessageSquare, ArrowRight, Zap, LogOut, User } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [joinCode, setJoinCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const createSession = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/session", { method: "POST" })
      const data = await response.json()
      router.push(`/session/${data.sessionId}`)
    } catch {
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Code2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Hirely</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Features</span>
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              Auth Demo
            </Link>
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Real-time collaborative coding</span>
          </div>
          
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Code together,
            <br />
            <span className="text-accent">interview smarter</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            The complete platform for live coding interviews. Real-time code editing, 
            video chat, and seamless collaboration - all in your browser.
          </p>

          {/* Action Section */}
          <div className="mt-12 flex w-full max-w-md flex-col gap-4">
            <Button 
              size="lg" 
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={createSession}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Start New Session"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">or join existing</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            
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
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Code2 className="h-6 w-6" />}
            title="Monaco Editor"
            description="Full-featured code editor with syntax highlighting and autocomplete"
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Real-time Sync"
            description="See changes instantly as your team edits code together"
          />
          <FeatureCard
            icon={<Video className="h-6 w-6" />}
            title="Video Chat"
            description="Built-in video calling with WebRTC peer-to-peer connection"
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Text Chat"
            description="Chat panel for sharing links, questions, and feedback"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          <StatCard value="< 50ms" label="Sync latency" />
          <StatCard value="10+" label="Languages supported" />
          <StatCard value="P2P" label="Video connection" />
          <StatCard value="Zero" label="Installation required" />
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
