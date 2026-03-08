'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, Clock, Lightbulb } from 'lucide-react'
import type { DesignChallenge, EvaluationCriterion } from '@/lib/types'

interface UIUXChallengeProps {
  challenge: DesignChallenge
  timeRemaining: number
  onStart: () => void
  isStarted: boolean
}

export function UIUXChallenge({
  challenge,
  timeRemaining,
  onStart,
  isStarted,
}: UIUXChallengeProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-4">
      {/* Challenge Header */}
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-foreground">{challenge.title}</h2>
            <p className="mb-4 text-muted-foreground">{challenge.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {challenge.timeLimit / 60} min
              </Badge>
              <Badge variant="outline" className="capitalize">
                {challenge.difficulty}
              </Badge>
            </div>
          </div>
          {!isStarted && (
            <Button onClick={onStart} size="lg" className="ml-4">
              Start Challenge
            </Button>
          )}
        </div>

        {isStarted && (
          <div className="mt-4 rounded-lg bg-secondary p-3">
            <div className="text-sm text-muted-foreground">Time Remaining</div>
            <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-destructive' : 'text-online'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}
      </Card>

      {/* Challenge Details */}
      <Tabs defaultValue="problem" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="problem">Problem</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="criteria">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="problem" className="space-y-4">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Problem Statement</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">{challenge.problem}</p>
            {challenge.wireframe && (
              <div className="mt-6">
                <h4 className="mb-3 font-medium text-foreground">Reference Wireframe</h4>
                <img
                  src={challenge.wireframe}
                  alt="Reference wireframe"
                  className="max-w-full rounded-lg border border-border"
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-3">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Lightbulb className="h-5 w-5 text-online" />
              Key Requirements
            </h3>
            <ul className="space-y-3">
              {challenge.requirements.map((req, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-online" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-3">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <AlertCircle className="h-5 w-5 text-accent" />
              Evaluation Criteria
            </h3>
            <div className="space-y-3">
              {challenge.evaluationCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                  onClick={() =>
                    setExpandedCriteria(
                      expandedCriteria === criterion.id ? null : criterion.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{criterion.name}</h4>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(criterion.weight * 100)}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {criterion.maxPoints} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {expandedCriteria === criterion.id && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {criterion.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
