'use client'

import React, { useState } from 'react'
import { InterviewScheduler } from '@/components/interview-scheduler'
import type { Interview } from '@/lib/types'

export default function SchedulePage() {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      candidateId: 'john@example.com',
      interviewerId: 'int_001',
      interviewType: 'coding',
      scheduledAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
      duration: 60,
      status: 'scheduled',
    },
    {
      id: '2',
      candidateId: 'sarah@example.com',
      interviewerId: 'int_001',
      interviewType: 'frontend',
      scheduledAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      duration: 45,
      status: 'scheduled',
    },
  ])

  const handleScheduleInterview = (interview: Partial<Interview>) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      candidateId: interview.candidateId || '',
      interviewerId: 'int_001',
      interviewType: interview.interviewType || 'coding',
      scheduledAt: interview.scheduledAt || Date.now(),
      duration: interview.duration || 60,
      status: interview.status || 'scheduled',
      notes: interview.notes,
    }
    setInterviews([...interviews, newInterview])
    console.log('[v0] Interview scheduled:', newInterview)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <InterviewScheduler
          onSchedule={handleScheduleInterview}
          existingInterviews={interviews}
        />
      </div>
    </main>
  )
}
