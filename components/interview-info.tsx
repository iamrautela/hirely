'use client'

import React from 'react'
import type { InterviewType, UserRole } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Code2, Palette, Server, Brain, Cpu, Wind, FileText, Briefcase, Users } from 'lucide-react'

const INTERVIEW_ICONS: Record<InterviewType, React.ReactNode> = {
  coding: <Code2 className="h-4 w-4" />,
  frontend: <Palette className="h-4 w-4" />,
  backend: <Server className="h-4 w-4" />,
  aiml: <Brain className="h-4 w-4" />,
  devops: <Cpu className="h-4 w-4" />,
  uiux: <Palette className="h-4 w-4" />,
  fullstack: <Wind className="h-4 w-4" />,
}

const INTERVIEW_COLORS: Record<InterviewType, string> = {
  coding: 'bg-blue-500/20 text-blue-500',
  frontend: 'bg-purple-500/20 text-purple-500',
  backend: 'bg-green-500/20 text-green-500',
  aiml: 'bg-orange-500/20 text-orange-500',
  devops: 'bg-red-500/20 text-red-500',
  uiux: 'bg-pink-500/20 text-pink-500',
  fullstack: 'bg-cyan-500/20 text-cyan-500',
}

export function InterviewInfo({
  interviewType,
  userRole,
}: {
  interviewType: InterviewType
  userRole: UserRole
}) {
  const typeLabel = interviewType.split(/(?=[A-Z])/).join(' ')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
      <div className={`flex items-center justify-center rounded-lg p-2 ${INTERVIEW_COLORS[interviewType]}`}>
        {INTERVIEW_ICONS[interviewType]}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground">Interview Type</p>
        <p className="font-semibold text-card-foreground capitalize">{typeLabel}</p>
      </div>
      <Badge variant={userRole === 'interviewer' ? 'default' : 'secondary'} className="gap-1">
        {userRole === 'interviewer' ? (
          <>
            <Briefcase className="h-3 w-3" />
            Interviewer
          </>
        ) : (
          <>
            <Users className="h-3 w-3" />
            Candidate
          </>
        )}
      </Badge>
    </div>
  )
}
