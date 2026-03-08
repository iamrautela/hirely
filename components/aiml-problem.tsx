'use client'

import React, { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Upload, BarChart3, HelpCircle, Clock } from 'lucide-react'
import type { AIMLProblem, AIMLMetrics } from '@/lib/types'

interface AIMLProblemProps {
  problem: AIMLProblem
  timeRemaining: number
  onUploadDataset?: (file: File) => void
  onStart: () => void
  isStarted: boolean
}

export function AIMLProblem({
  problem,
  timeRemaining,
  onUploadDataset,
  onStart,
  isStarted,
}: AIMLProblemProps) {
  const [datasetFile, setDatasetFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDatasetFile(file)
      onUploadDataset?.(file)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Problem Header */}
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-foreground">{problem.title}</h2>
            <p className="mb-4 text-muted-foreground">{problem.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {problem.timeLimit / 60} min
              </Badge>
              <Badge variant="outline" className="capitalize">
                {problem.modelType}
              </Badge>
            </div>
          </div>
          {!isStarted && (
            <Button onClick={onStart} size="lg" className="ml-4">
              Start Problem
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

      {/* Problem Details */}
      <Tabs defaultValue="dataset" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger value="dataset">Dataset</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="dataset" className="space-y-4">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Upload className="h-5 w-5 text-online" />
              Dataset Information
            </h3>

            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="mb-2 text-sm font-medium text-foreground">Dataset: {problem.dataset.name}</p>
                <p className="text-sm text-muted-foreground">{problem.dataset.description}</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="font-semibold text-foreground">{problem.dataset.rows.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Features</p>
                    <p className="font-semibold text-foreground">{problem.dataset.columns.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="font-semibold text-foreground">{problem.targetVariable}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Upload Your Solution
                </label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.json"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {datasetFile ? datasetFile.name : 'Choose file'}
                  </Button>
                  <Button disabled={!datasetFile}>Upload</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <BarChart3 className="h-5 w-5 text-accent" />
              Expected Metrics
            </h3>

            <div className="grid gap-3">
              <MetricRow label="Accuracy" value={`${(problem.metrics.accuracy * 100).toFixed(1)}%`} />
              <MetricRow label="Precision" value={`${(problem.metrics.precision * 100).toFixed(1)}%`} />
              <MetricRow label="Recall" value={`${(problem.metrics.recall * 100).toFixed(1)}%`} />
              <MetricRow label="F1 Score" value={problem.metrics.f1Score.toFixed(3)} />
            </div>

            {problem.metrics.confusionMatrix && (
              <div className="mt-6">
                <p className="mb-3 font-medium text-foreground">Confusion Matrix</p>
                <div className="inline-block rounded-lg bg-secondary p-4">
                  <table className="border-collapse">
                    <tbody>
                      {problem.metrics.confusionMatrix.map((row, i) => (
                        <tr key={i}>
                          {row.map((val, j) => (
                            <td
                              key={j}
                              className="border border-border px-4 py-2 text-center font-mono text-sm text-foreground"
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="concepts" className="space-y-3">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <HelpCircle className="h-5 w-5 text-online" />
              Concept Questions
            </h3>
            <div className="space-y-3">
              {problem.conceptQuestions.map((question, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground">Q{i + 1}: {question}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Clean and preprocess the dataset appropriately</li>
              <li>• Handle missing values and outliers</li>
              <li>• Perform exploratory data analysis</li>
              <li>• Split data into train/test sets</li>
              <li>• Build and evaluate your model</li>
              <li>• Document your approach and findings</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="font-mono font-semibold text-online">{value}</span>
    </div>
  )
}
