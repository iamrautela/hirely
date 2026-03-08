'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Type, Square, Circle, Trash2 } from 'lucide-react'

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'line' | 'rectangle' | 'circle' | 'text'>('pen')
  const [color, setColor] = useState('#ffffff')
  const [lineWidth, setLineWidth] = useState(2)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#1a1a2e'
      context.fillRect(0, 0, canvas.width, canvas.height)
      setCtx(context)
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setLastX(e.clientX - rect.left)
    setLastY(e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'pen') {
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    setLastX(x)
    setLastY(y)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Design Canvas</h3>
        <Button size="sm" variant="destructive" onClick={clearCanvas} className="gap-1">
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1 rounded-lg border border-border bg-secondary p-2">
          {(['pen', 'line', 'rectangle', 'circle'] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tool === t ? 'default' : 'ghost'}
              onClick={() => setTool(t)}
              className="gap-1"
            >
              {t === 'pen' && '✏️'}
              {t === 'line' && '—'}
              {t === 'rectangle' && <Square className="h-4 w-4" />}
              {t === 'circle' && <Circle className="h-4 w-4" />}
            </Button>
          ))}
        </div>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-border"
        />

        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="h-96 w-full cursor-crosshair rounded-lg border border-border bg-secondary"
      />
    </div>
  )
}
