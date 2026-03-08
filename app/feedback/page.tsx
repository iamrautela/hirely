'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InterviewFeedbackForm } from '@/components/interview-feedback-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import type { Interview, InterviewFeedback } from '@/lib/types'

const MOCK_INTERVIEW: Interview = {
  id: '1',
  candidateId: 'john.doe@example.com',
  interviewerId: 'int_001',
  interviewType: 'coding',
  scheduledAt: Date.now() - 60 * 60 * 1000,
  duration: 60,
  status: 'completed',
  notes: 'Candidate showed good problem-solving skills',
}

export default function FeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const interviewId = searchParams.get('interviewId') || '1'
  const [submitted, setSubmitted] = useState(false)

  const interview = MOCK_INTERVIEW

  const handleSubmitFeedback = (feedback: InterviewFeedback) => {
    console.log('[v0] Feedback submitted:', feedback)
    setSubmitted(true)

    // Simulate saving
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center p-6">
          <Card className="border-border bg-card p-8 text-center max-w-md">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-online/20">
              <AlertCircle className="h-8 w-8 text-online" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Feedback Submitted</h1>
            <p className="mb-6 text-muted-foreground">
              Your feedback has been successfully submitted for this interview.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-6">
        <InterviewFeedbackForm
          interview={interview}
          onSubmit={handleSubmitFeedback}
        />
      </div>
    </main>
  )
}
