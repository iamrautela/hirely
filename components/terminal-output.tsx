'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Copy, Check, Trash2 } from 'lucide-react'
import { useState } from 'react'

export interface TerminalLine {
  id: string
  content: string
  type: 'log' | 'error' | 'warning' | 'info' | 'success'
  timestamp: number
}

interface TerminalOutputProps {
  lines: TerminalLine[]
  isRunning?: boolean
  onClear?: () => void
  onClose?: () => void
}

export function TerminalOutput({ lines, isRunning = false, onClear, onClose }: TerminalOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const copyOutput = () => {
    const text = lines.map((line) => line.content).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive'
      case 'warning':
        return 'text-yellow-500'
      case 'success':
        return 'text-green-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTypePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      default:
        return '>'
    }
  }

  return (
    <div className="flex h-full flex-col bg-editor-bg">
      {/* Header */}
      <div className="border-b border-editor-line flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-online"></div>
          <span className="text-sm font-medium text-foreground">Terminal</span>
          {isRunning && (
            <span className="text-xs text-muted-foreground ml-2">• Running...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={copyOutput}
            title="Copy output"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onClear}
            title="Clear terminal"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onClose}
              title="Close terminal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-editor-bg p-4 font-mono text-sm font-light leading-relaxed"
      >
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground text-xs">
              Run your code to see output here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {lines.map((line) => (
              <div
                key={line.id}
                className={`flex gap-2 ${getTypeColor(line.type)}`}
              >
                <span className="opacity-70">{getTypePrefix(line.type)}</span>
                <span className="flex-1 break-words">{line.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
