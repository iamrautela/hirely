'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Users, TrendingUp, Edit2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { Interview } from '@/lib/types'

interface InterviewerDashboardProps {
  upcomingInterviews?: Interview[]
  completedInterviews?: Interview[]
  onStartInterview?: (interviewId: string) => void
  onEditFeedback?: (interviewId: string, feedback: string) => void
}

export function InterviewerDashboard({
  upcomingInterviews = [],
  completedInterviews = [],
  onStartInterview,
  onEditFeedback,
}: InterviewerDashboardProps) {
  const [editingFeedback, setEditingFeedback] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const totalInterviews = upcomingInterviews.length + completedInterviews.length
  const hireCount = completedInterviews.filter((i) => i.feedback?.recommendation === 'hire').length
  const hireRate = totalInterviews > 0 ? Math.round((hireCount / totalInterviews) * 100) : 0

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return 'bg-online text-background'
      case 'maybe':
        return 'bg-chart-3 text-background'
      case 'reject':
        return 'bg-destructive text-background'
      default:
        return 'bg-secondary text-foreground'
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Interviewer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage interviews, evaluate candidates, and track hiring metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Interviews</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{totalInterviews}</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Upcoming</div>
          <div className="mt-2 text-3xl font-bold text-online">{upcomingInterviews.length}</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="mt-2 text-3xl font-bold text-accent">{completedInterviews.length}</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Hire Rate</div>
          <div className="mt-2 text-3xl font-bold text-chart-3">{hireRate}%</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="completed">Interview Results</TabsTrigger>
        </TabsList>

        {/* Upcoming Interviews */}
        <TabsContent value="upcoming" className="space-y-3">
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-secondary" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Candidate ID: {interview.candidateId}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {interview.interviewType} • {interview.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(interview.scheduledAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onStartInterview?.(interview.id)}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Start Interview
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-border bg-secondary p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No upcoming interviews scheduled</p>
              <Button className="mt-4" variant="outline">
                Schedule Interview
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Completed Interviews */}
        <TabsContent value="completed" className="space-y-3">
          {completedInterviews.length > 0 ? (
            completedInterviews.map((interview) => (
              <Card
                key={interview.id}
                className={`border-border bg-card p-4 transition-colors hover:border-accent ${
                  editingFeedback === interview.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-secondary" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            Candidate ID: {interview.candidateId}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {interview.interviewType}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(interview.scheduledAt)}
                        </span>
                      </div>
                    </div>
                    {interview.feedback && (
                      <div className="text-right">
                        <Badge className={getRecommendationColor(interview.feedback.recommendation)}>
                          {interview.feedback.recommendation.toUpperCase()}
                        </Badge>
                        <p className="mt-2 text-2xl font-bold text-accent">
                          {interview.feedback.overallScore}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  {editingFeedback === interview.id ? (
                    <div className="space-y-3 border-t border-border pt-4">
                      <Textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Enter feedback for the candidate..."
                        className="min-h-24 resize-none bg-secondary text-foreground"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            onEditFeedback?.(interview.id, feedbackText)
                            setEditingFeedback(null)
                          }}
                        >
                          Save Feedback
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEditingFeedback(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    interview.feedback?.recommendation && (
                      <div className="space-y-2 border-t border-border pt-4">
                        <p className="text-sm text-muted-foreground">
                          {interview.notes || 'No feedback added yet'}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setEditingFeedback(interview.id)
                            setFeedbackText(interview.notes || '')
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Feedback
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-border bg-secondary p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No completed interviews yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
