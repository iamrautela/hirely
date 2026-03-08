'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateDashboard } from '@/components/candidate-dashboard'
import { InterviewerDashboard } from '@/components/interviewer-dashboard'
import type { Interview } from '@/lib/types'

// Demo data for UI purposes
const DEMO_INTERVIEWS: Interview[] = [
  {
    id: '1',
    candidateId: 'cand_001',
    interviewerId: 'int_001',
    interviewType: 'coding',
    scheduledAt: Date.now() + 24 * 60 * 60 * 1000,
    duration: 60,
    status: 'scheduled',
    notes: 'Strong fundamentals expected',
  },
  {
    id: '2',
    candidateId: 'cand_002',
    interviewerId: 'int_001',
    interviewType: 'frontend',
    scheduledAt: Date.now() + 48 * 60 * 60 * 1000,
    duration: 45,
    status: 'scheduled',
  },
  {
    id: '3',
    candidateId: 'cand_003',
    interviewerId: 'int_001',
    interviewType: 'backend',
    scheduledAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    duration: 60,
    status: 'completed',
    feedback: {
      overallScore: 85,
      criteriaScores: new Map([['communication', 8], ['problem-solving', 9]]),
      strengths: ['Clear communication', 'Good problem-solving approach'],
      improvements: ['Could optimize the solution further'],
      recommendation: 'hire',
    },
  },
  {
    id: '4',
    candidateId: 'cand_004',
    interviewerId: 'int_001',
    interviewType: 'uiux',
    scheduledAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    duration: 45,
    status: 'completed',
    feedback: {
      overallScore: 72,
      criteriaScores: new Map([['design', 7], ['research', 7]]),
      strengths: ['User-centric thinking', 'Good wireframes'],
      improvements: ['More rigorous user research needed'],
      recommendation: 'maybe',
    },
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [userRole] = useState<'candidate' | 'interviewer'>('candidate')
  const upcomingInterviews = DEMO_INTERVIEWS.filter((i) => i.status === 'scheduled')
  const completedInterviews = DEMO_INTERVIEWS.filter((i) => i.status === 'completed')

  const handleJoinInterview = (interviewId: string) => {
    router.push(`/session/${interviewId}`)
  }

  const handleStartInterview = (interviewId: string) => {
    router.push(`/session/${interviewId}`)
  }

  const handleEditFeedback = (interviewId: string, feedback: string) => {
    console.log('[v0] Feedback edited:', interviewId, feedback)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {userRole === 'candidate' ? (
          <CandidateDashboard
            upcomingInterviews={upcomingInterviews}
            completedInterviews={completedInterviews}
            onJoinInterview={handleJoinInterview}
          />
        ) : (
          <InterviewerDashboard
            upcomingInterviews={upcomingInterviews}
            completedInterviews={completedInterviews}
            onStartInterview={handleStartInterview}
            onEditFeedback={handleEditFeedback}
          />
        )}
      </div>
    </main>
  )
}
