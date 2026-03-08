'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole, InterviewType } from '@/lib/types'
import { Briefcase, Users } from 'lucide-react'

export function RoleSelector({
  onSelect,
  interviewType,
}: {
  onSelect: (name: string, role: UserRole) => void
  interviewType: InterviewType
}) {
  const [name, setName] = React.useState('')

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h2 className="mb-2 text-2xl font-bold text-card-foreground">Join Interview</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Select your role to join this {interviewType} interview session
        </p>

        <div className="mb-6 space-y-3">
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-input text-foreground placeholder:text-muted-foreground"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => name.trim() && onSelect(name, 'candidate')}
              disabled={!name.trim()}
              variant="outline"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Candidate
            </Button>
            <Button
              onClick={() => name.trim() && onSelect(name, 'interviewer')}
              disabled={!name.trim()}
              variant="outline"
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Interviewer
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Candidates solve problems. Interviewers evaluate and provide feedback.
        </p>
      </div>
    </div>
  )
}
