'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { EvaluationCriterion } from '@/lib/types'

interface EvaluationRubricProps {
  criteria: EvaluationCriterion[]
  onScoreChange?: (criterionId: string, score: number) => void
  onFeedbackChange?: (feedback: string) => void
  isEvaluating?: boolean
}

export function EvaluationRubric({
  criteria,
  onScoreChange,
  onFeedbackChange,
  isEvaluating = false,
}: EvaluationRubricProps) {
  const [scores, setScores] = useState<Map<string, number>>(new Map())
  const [feedback, setFeedback] = useState('')

  const handleScoreChange = (criterionId: string, value: number[]) => {
    const score = value[0]
    setScores(new Map(scores).set(criterionId, score))
    onScoreChange?.(criterionId, score)
  }

  const handleFeedbackChange = (text: string) => {
    setFeedback(text)
    onFeedbackChange?.(text)
  }

  const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0)
  const maxScore = criteria.reduce((sum, c) => sum + c.maxPoints, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return (
    <div className="w-full space-y-6">
      {/* Score Summary */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Overall Score</h3>
        <div className="flex items-end gap-6">
          <div>
            <div className={`text-5xl font-bold ${percentage >= 70 ? 'text-online' : percentage >= 50 ? 'text-chart-3' : 'text-destructive'}`}>
              {percentage}%
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalScore} / {maxScore} points
            </p>
          </div>
          <div className="flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all ${percentage >= 70 ? 'bg-online' : percentage >= 50 ? 'bg-chart-3' : 'bg-destructive'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Evaluation Criteria */}
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <Card key={criterion.id} className="border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="mb-1 text-base font-semibold text-foreground">
                  {criterion.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {criterion.description}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(criterion.weight * 100)}% weight
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {criterion.maxPoints} pts max
                  </Badge>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-accent">
                  {scores.get(criterion.id) ?? 0}
                </div>
              </div>
            </div>

            {isEvaluating && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Score</label>
                    <span className="text-xs text-muted-foreground">
                      0 - {criterion.maxPoints}
                    </span>
                  </div>
                  <Slider
                    value={[scores.get(criterion.id) ?? 0]}
                    onValueChange={(value) =>
                      handleScoreChange(criterion.id, value)
                    }
                    max={criterion.maxPoints}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Feedback Section */}
      {isEvaluating && (
        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Overall Feedback
          </h3>
          <Textarea
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            placeholder="Provide constructive feedback about the candidate's performance, strengths, areas for improvement, and recommendations..."
            className="min-h-32 resize-none bg-secondary text-foreground placeholder:text-muted-foreground"
          />
          <div className="mt-4 text-xs text-muted-foreground">
            Include specific examples and actionable suggestions
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {isEvaluating && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Save Draft
          </Button>
          <Button className="flex-1" disabled={totalScore === 0}>
            Submit Evaluation
          </Button>
        </div>
      )}
    </div>
  )
}
