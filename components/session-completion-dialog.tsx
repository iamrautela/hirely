'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react'
import type { Interview } from '@/lib/types'

interface SessionCompletionDialogProps {
  open: boolean
  interview: Interview
  timeSpent: number
  onConfirm?: () => void
  onCancel?: () => void
}

export function SessionCompletionDialog({
  open,
  interview,
  timeSpent,
  onConfirm,
  onCancel,
}: SessionCompletionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate save
    onConfirm?.()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
    }
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`
  }

  return (
    <Dialog open={open}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Interview Session Complete</DialogTitle>
          <DialogDescription>
            Your interview session has ended. Please review the summary below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Badge */}
          <div className="flex justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-online/20">
              <CheckCircle2 className="h-8 w-8 text-online" />
            </div>
          </div>

          {/* Interview Summary */}
          <Card className="border-border/50 bg-secondary/50 p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Candidate</span>
                <span className="font-medium text-foreground">{interview.candidateId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Interview Type</span>
                <span className="font-medium capitalize text-foreground">{interview.interviewType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{formatTime(timeSpent)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-online/20 px-2 py-1 text-xs font-medium text-online">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="border-online/50 bg-online/5 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-online mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-foreground">Next Steps</p>
                <p className="mt-1 text-muted-foreground">
                  You will be redirected to your dashboard to provide interview feedback.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Go Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue to Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
