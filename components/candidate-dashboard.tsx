'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, FileText } from 'lucide-react'
import type { Interview } from '@/lib/types'

interface CandidateDashboardProps {
  upcomingInterviews?: Interview[]
  completedInterviews?: Interview[]
  onJoinInterview?: (interviewId: string) => void
}

export function CandidateDashboard({
  upcomingInterviews = [],
  completedInterviews = [],
  onJoinInterview,
}: CandidateDashboardProps) {
  const [selectedResource, setSelectedResource] = useState<'resume' | 'resources' | 'notes'>('resume')

  const resources = [
    {
      title: 'System Design Best Practices',
      type: 'Guide',
      url: '#',
      duration: '15 min read',
    },
    {
      title: 'Algorithm Cheat Sheet',
      type: 'Document',
      url: '#',
      duration: '10 min read',
    },
    {
      title: 'Interview Tips for Success',
      type: 'Video',
      url: '#',
      duration: '8 min watch',
    },
  ]

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'text-online'
      case 'in-progress':
        return 'text-accent'
      case 'completed':
        return 'text-muted-foreground'
      case 'cancelled':
        return 'text-destructive'
      default:
        return 'text-foreground'
    }
  }

  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Manage your interviews and prepare with learning resources
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Upcoming Interviews</div>
          <div className="mt-2 text-3xl font-bold text-online">{upcomingInterviews.length}</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Completed Interviews</div>
          <div className="mt-2 text-3xl font-bold text-accent">{completedInterviews.length}</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="mt-2 text-3xl font-bold text-chart-3">
            {completedInterviews.length > 0
              ? Math.round(
                  (completedInterviews.filter((i) => i.status === 'completed').length /
                    completedInterviews.length) *
                    100
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground capitalize">
                        {interview.interviewType} Interview
                      </h3>
                      <Badge variant="outline" className="gap-1 capitalize">
                        {getStatusIcon(interview.status)}
                        {interview.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(interview.scheduledAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {interview.duration} minutes
                    </p>
                  </div>
                  <Button
                    onClick={() => onJoinInterview?.(interview.id)}
                    disabled={interview.status !== 'scheduled' && interview.status !== 'in-progress'}
                  >
                    {interview.status === 'in-progress' ? 'Join Now' : 'View'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-border bg-secondary p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No upcoming interviews</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedInterviews.length > 0 ? (
            completedInterviews.map((interview) => (
              <Card key={interview.id} className="border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground capitalize">
                        {interview.interviewType} Interview
                      </h3>
                      {interview.feedback?.recommendation && (
                        <Badge
                          className={
                            interview.feedback.recommendation === 'hire'
                              ? 'bg-online text-background'
                              : interview.feedback.recommendation === 'maybe'
                                ? 'bg-chart-3 text-background'
                                : 'bg-destructive text-background'
                          }
                        >
                          {interview.feedback.recommendation.charAt(0).toUpperCase() +
                            interview.feedback.recommendation.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Completed on {formatDate(interview.scheduledAt)}
                    </p>
                    {interview.feedback && (
                      <p className="mt-2 text-sm font-medium text-accent">
                        Score: {interview.feedback.overallScore}%
                      </p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => onJoinInterview?.(interview.id)}>
                    View Feedback
                  </Button>
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

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-3">
            {resources.map((resource, i) => (
              <Card key={i} className="border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{resource.title}</h4>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2 py-1">
                        {resource.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {resource.duration}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.url}>Access</a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
