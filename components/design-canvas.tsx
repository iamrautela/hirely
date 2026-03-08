'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Type, Square, Circle, Trash2, Copy, Download, Undo2, RotateCcw, AlertCircle, Move, Eye, EyeOff } from 'lucide-react'

interface CanvasElement {
  id: string
  type: 'rect' | 'circle' | 'text' | 'line' | 'image'
  x: number
  y: number
  width: number
  height: number
  color: string
  fillColor: string
  text?: string
  fontSize?: number
  opacity: number
  rotation: number
  locked: boolean
}

export function DesignCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'text' | 'line'>('select')
  const [color, setColor] = useState('#ffffff')
  const [fillColor, setFillColor] = useState('#3b82f6')
  const [lineWidth, setLineWidth] = useState(2)
  const [fontSize, setFontSize] = useState(16)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [history, setHistory] = useState<CanvasElement[][]>([])
  const [opacity, setOpacity] = useState(100)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#0f172a'
      context.fillRect(0, 0, canvas.width, canvas.height)
      drawGrid(context, canvas.width, canvas.height)
      setCtx(context)
    }
  }, [])

  // Redraw canvas when elements change
  useEffect(() => {
    if (!ctx || !canvasRef.current) return
    const canvas = canvasRef.current
    
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (gridEnabled) {
      drawGrid(ctx, canvas.width, canvas.height)
    }
    
    elements.forEach((el) => {
      drawElement(ctx, el, el.id === selectedId)
    })
  }, [elements, selectedId, ctx, gridEnabled])

  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    context.strokeStyle = '#1e293b'
    context.lineWidth = 0.5
    
    for (let x = 0; x < width; x += gridSize) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }
    
    for (let y = 0; y < height; y += gridSize) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }
  }

  const drawElement = (context: CanvasRenderingContext2D, el: CanvasElement, isSelected: boolean) => {
    context.globalAlpha = el.opacity / 100
    context.fillStyle = el.fillColor
    context.strokeStyle = el.color
    context.lineWidth = lineWidth

    switch (el.type) {
      case 'rect':
        context.fillRect(el.x, el.y, el.width, el.height)
        if (isSelected) {
          context.strokeStyle = '#fbbf24'
          context.lineWidth = 2
          context.strokeRect(el.x, el.y, el.width, el.height)
        }
        break
      
      case 'circle':
        context.beginPath()
        context.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2)
        context.fill()
        if (isSelected) {
          context.strokeStyle = '#fbbf24'
          context.lineWidth = 2
          context.stroke()
        }
        break
      
      case 'line':
        context.beginPath()
        context.moveTo(el.x, el.y)
        context.lineTo(el.x + el.width, el.y + el.height)
        context.stroke()
        break
      
      case 'text':
        context.fillStyle = el.color
        context.font = `${el.fontSize || 16}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
        context.fillText(el.text || 'Text', el.x, el.y)
        if (isSelected) {
          context.strokeStyle = '#fbbf24'
          context.lineWidth = 2
          context.strokeRect(el.x, el.y - (el.fontSize || 16), el.width, el.height)
        }
        break
    }
    
    context.globalAlpha = 1
  }

  const addElement = (type: CanvasElement['type'], x: number, y: number, width: number, height: number) => {
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y,
      width,
      height,
      color,
      fillColor,
      fontSize,
      opacity,
      rotation: 0,
      locked: false,
    }
    
    const newElements = [...elements, newElement]
    setElements(newElements)
    setHistory([...history, elements])
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'select') {
      // Click to select element
      const clicked = elements.find(
        (el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
      )
      setSelectedId(clicked?.id || null)
    } else {
      setIsDrawing(true)
      setStartX(x)
      setStartY(y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = Math.abs(x - startX)
    const height = Math.abs(y - startY)
    const finalX = Math.min(startX, x)
    const finalY = Math.min(startY, y)

    // Visual preview (could be enhanced with temp drawing)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    setIsDrawing(false)

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = Math.abs(x - startX)
    const height = Math.abs(y - startY)
    const finalX = Math.min(startX, x)
    const finalY = Math.min(startY, y)

    if (width > 5 && height > 5) {
      switch (tool) {
        case 'rect':
          addElement('rect', finalX, finalY, width, height)
          break
        case 'circle':
          addElement('circle', finalX, finalY, width, height)
          break
        case 'line':
          addElement('line', startX, startY, x - startX, y - startY)
          break
        case 'text':
          addElement('text', finalX, finalY, width, height)
          break
      }
    }
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setElements(elements.filter((el) => el.id !== selectedId))
    setSelectedId(null)
  }

  const duplicateSelected = () => {
    if (!selectedId) return
    const el = elements.find((e) => e.id === selectedId)
    if (!el) return
    const newEl = { ...el, id: Math.random().toString(36).substr(2, 9), x: el.x + 20, y: el.y + 20 }
    setElements([...elements, newEl])
  }

  const clearCanvas = () => {
    setElements([])
    setSelectedId(null)
    setHistory([])
  }

  const undo = () => {
    if (history.length === 0) return
    const previousState = history[history.length - 1]
    setElements(previousState)
    setHistory(history.slice(0, -1))
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = 'design.png'
    link.click()
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary p-3">
        {/* Tool Selection */}
        <div className="flex gap-1 rounded-lg bg-background/50 p-1">
          {(['select', 'pen', 'rect', 'circle', 'text', 'line'] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tool === t ? 'default' : 'ghost'}
              onClick={() => setTool(t)}
              className="gap-1"
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              {t === 'select' && <Move className="h-4 w-4" />}
              {t === 'pen' && '✏️'}
              {t === 'rect' && <Square className="h-4 w-4" />}
              {t === 'circle' && <Circle className="h-4 w-4" />}
              {t === 'text' && <Type className="h-4 w-4" />}
              {t === 'line' && '—'}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Colors */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Stroke:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Fill:</label>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Width and Font Size */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">Font:</label>
            <input
              type="number"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-12 rounded border border-border bg-input px-2 py-1 text-xs"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Opacity */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-medium text-muted-foreground">Opacity:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground">{opacity}%</span>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* View Options */}
        <Button
          size="sm"
          variant={gridEnabled ? 'default' : 'ghost'}
          onClick={() => setGridEnabled(!gridEnabled)}
          className="gap-1"
          title="Toggle Grid"
        >
          Grid
        </Button>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-medium text-muted-foreground">Zoom:</label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground">{zoom}%</span>
        </div>

        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" onClick={undo} className="gap-1" title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={duplicateSelected}
            disabled={!selectedId}
            className="gap-1"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteSelected}
            disabled={!selectedId}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadCanvas} className="gap-1" title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={clearCanvas} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>Elements: {elements.length}</span>
          {selectedId && <span className="text-accent">Selected: {selectedId}</span>}
        </div>
        <div className="flex gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Click and drag to create shapes. Click to select.</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
        className="flex-1 cursor-crosshair rounded-lg border border-border bg-slate-900"
      />
    </div>
  )
}
