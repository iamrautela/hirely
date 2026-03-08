'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, Users, CheckCircle2, XCircle } from 'lucide-react'
import type { Session, User } from '@/lib/types'

interface SessionStatusProps {
  session: Partial<Session> & { id: string }
  currentUser: User
  onEndSession?: () => void
  timeElapsed?: number
}

export function SessionStatus({
  session,
  currentUser,
  onEndSession,
  timeElapsed = 0,
}: SessionStatusProps) {
  const [isWarningTime, setIsWarningTime] = useState(false)

  // Check if time is running low (within 5 minutes of limit)
  useEffect(() => {
    if (session.problem?.timeLimit) {
      setIsWarningTime(session.problem.timeLimit - timeElapsed < 300)
    }
  }, [timeElapsed, session.problem?.timeLimit])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  const timeRemaining = session.problem
    ? session.problem.timeLimit - timeElapsed
    : null

  return (
    <Card className="border-border bg-card p-4">
      <div className="space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-online animate-pulse" />
            <span className="text-sm font-medium text-foreground">Interview In Progress</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {session.participants?.length || 1} participant{(session.participants?.length || 1) !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Time Information */}
        {timeRemaining !== null && (
          <div className={`rounded-lg p-3 ${isWarningTime ? 'bg-destructive/10' : 'bg-secondary'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${isWarningTime ? 'text-destructive' : 'text-online'}`} />
                <span className={`text-sm font-medium ${isWarningTime ? 'text-destructive' : 'text-foreground'}`}>
                  Time Remaining
                </span>
              </div>
              <span className={`text-sm font-mono font-bold ${isWarningTime ? 'text-destructive' : 'text-online'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            {isWarningTime && (
              <p className="mt-2 text-xs text-destructive">
                You are running low on time. Wrap up soon.
              </p>
            )}
          </div>
        )}

        {/* Session Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Your Role</span>
            <Badge variant="outline" className="capitalize">{currentUser.role}</Badge>
          </div>
          {session.code && (
            <div className="flex items-center justify-between">
              <span>Session Code</span>
              <Badge variant="secondary" className="font-mono">{session.code}</Badge>
            </div>
          )}
          {session.interviewType && (
            <div className="flex items-center justify-between">
              <span>Interview Type</span>
              <Badge variant="outline" className="capitalize">{session.interviewType}</Badge>
            </div>
          )}
        </div>

        {/* End Session Button */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
          onClick={onEndSession}
        >
          <XCircle className="h-4 w-4" />
          End Interview Session
        </Button>
      </div>
    </Card>
  )
}
