'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import type { InterviewFeedback, Interview } from '@/lib/types'

interface InterviewFeedbackFormProps {
  interview: Interview
  onSubmit?: (feedback: InterviewFeedback) => void
}

const FEEDBACK_AREAS = [
  {
    category: 'Technical Skills',
    items: ['Problem Solving', 'Code Quality', 'System Design', 'Algorithm Knowledge'],
  },
  {
    category: 'Communication',
    items: ['Clarity', 'Listening', 'Asking Questions', 'Explaining Approach'],
  },
  {
    category: 'Professional Conduct',
    items: ['Time Management', 'Professionalism', 'Enthusiasm', 'Follow-up'],
  },
]

export function InterviewFeedbackForm({ interview, onSubmit }: InterviewFeedbackFormProps) {
  const [recommendation, setRecommendation] = useState<'hire' | 'maybe' | 'reject' | ''>('')
  const [overallScore, setOverallScore] = useState(70)
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const toggleItem = (item: string) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(item)) {
      newSet.delete(item)
    } else {
      newSet.add(item)
    }
    setSelectedItems(newSet)
  }

  const handleSubmit = () => {
    if (!recommendation) {
      alert('Please select a recommendation')
      return
    }

    const feedback: InterviewFeedback = {
      overallScore,
      criteriaScores: new Map(),
      strengths,
      improvements,
      recommendation,
    }

    onSubmit?.(feedback)
  }

  const scoreColor =
    overallScore >= 75 ? 'text-online' : overallScore >= 50 ? 'text-chart-3' : 'text-destructive'

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Interview Feedback</h2>
        <p className="text-muted-foreground">
          Provide comprehensive feedback for {interview.candidateId}
        </p>
      </div>

      {/* Overall Score */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Overall Performance Score</h3>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold">{overallScore}</div>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={overallScore}
                onChange={(e) => setOverallScore(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div className="mt-2 text-xs text-muted-foreground">0 - 100</div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all ${scoreColor.replace('text-', 'bg-')}`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {overallScore >= 75
              ? 'Strong performance'
              : overallScore >= 50
                ? 'Average performance'
                : 'Below expectations'}
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Hiring Recommendation</h3>
        <RadioGroup value={recommendation} onValueChange={(val) => setRecommendation(val as any)}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary">
              <RadioGroupItem value="hire" id="hire" />
              <Label htmlFor="hire" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-online" />
                  <span className="font-medium text-foreground">Hire</span>
                </div>
                <p className="text-xs text-muted-foreground">Strong candidate - ready for the role</p>
              </Label>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary">
              <RadioGroupItem value="maybe" id="maybe" />
              <Label htmlFor="maybe" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-chart-3" />
                  <span className="font-medium text-foreground">Maybe</span>
                </div>
                <p className="text-xs text-muted-foreground">Potential - needs further consideration</p>
              </Label>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary">
              <RadioGroupItem value="reject" id="reject" />
              <Label htmlFor="reject" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-foreground">Reject</span>
                </div>
                <p className="text-xs text-muted-foreground">Does not meet requirements</p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Evaluation Areas */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Evaluation Areas</h3>
        <div className="space-y-4">
          {FEEDBACK_AREAS.map((area) => (
            <div key={area.category}>
              <h4 className="mb-2 text-sm font-medium text-foreground">{area.category}</h4>
              <div className="grid grid-cols-2 gap-2">
                {area.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox
                      id={item}
                      checked={selectedItems.has(item)}
                      onCheckedChange={() => toggleItem(item)}
                    />
                    <Label htmlFor={item} className="cursor-pointer text-sm text-muted-foreground">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths and Improvements */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Strengths</h3>
        <Textarea
          placeholder="What did the candidate do well? List specific strengths..."
          value={strengths.join('\n')}
          onChange={(e) => setStrengths(e.target.value.split('\n').filter((s) => s.trim()))}
          className="min-h-20 resize-none bg-secondary text-foreground border-border placeholder:text-muted-foreground"
        />
      </Card>

      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Areas for Improvement</h3>
        <Textarea
          placeholder="What should the candidate improve? Be specific and constructive..."
          value={improvements.join('\n')}
          onChange={(e) => setImprovements(e.target.value.split('\n').filter((s) => s.trim()))}
          className="min-h-20 resize-none bg-secondary text-foreground border-border placeholder:text-muted-foreground"
        />
      </Card>

      {/* Additional Notes */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Additional Notes</h3>
        <Textarea
          placeholder="Any other observations or comments about the interview..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-24 resize-none bg-secondary text-foreground border-border placeholder:text-muted-foreground"
        />
      </Card>

      {/* Summary and Submit */}
      <Card className="border border-online/50 bg-online/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-online" />
          <div>
            <h4 className="font-semibold text-foreground">Ready to submit?</h4>
            <p className="text-sm text-muted-foreground">
              Review your feedback and recommendation before submitting.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Save as Draft
        </Button>
        <Button onClick={handleSubmit} disabled={!recommendation} className="flex-1">
          Submit Feedback
        </Button>
      </div>
    </div>
  )
}
