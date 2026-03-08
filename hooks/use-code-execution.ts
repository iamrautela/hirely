'use client'

import { useState, useCallback } from 'react'
import type { TerminalLine } from '@/components/terminal-output'

interface ExecutionOptions {
  timeout?: number
  language?: string
}

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<TerminalLine[]>([])

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const captureConsole = (callback: (line: TerminalLine) => void) => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    console.log = (...args: any[]) => {
      callback({
        id: generateId(),
        content: args.map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2)
          }
          return String(arg)
        }).join(' '),
        type: 'log',
        timestamp: Date.now(),
      })
    }

    console.error = (...args: any[]) => {
      callback({
        id: generateId(),
        content: args.map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2)
          }
          return String(arg)
        }).join(' '),
        type: 'error',
        timestamp: Date.now(),
      })
    }

    console.warn = (...args: any[]) => {
      callback({
        id: generateId(),
        content: args.map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2)
          }
          return String(arg)
        }).join(' '),
        type: 'warning',
        timestamp: Date.now(),
      })
    }

    console.info = (...args: any[]) => {
      callback({
        id: generateId(),
        content: args.map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2)
          }
          return String(arg)
        }).join(' '),
        type: 'info',
        timestamp: Date.now(),
      })
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
    }
  }

  const executeCode = useCallback(
    async (code: string, options: ExecutionOptions = {}) => {
      const { timeout = 5000, language = 'javascript' } = options

      // Only support JavaScript for now
      if (language !== 'javascript') {
        setOutput([
          {
            id: generateId(),
            content: `Language "${language}" is not supported yet. Currently only JavaScript is supported.`,
            type: 'error',
            timestamp: Date.now(),
          },
        ])
        return
      }

      setIsRunning(true)
      const newOutput: TerminalLine[] = [
        {
          id: generateId(),
          content: `$ Executing code...`,
          type: 'info',
          timestamp: Date.now(),
        },
      ]

      try {
        // Set up console capture
        const restoreConsole = captureConsole((line) => {
          newOutput.push(line)
          setOutput([...newOutput])
        })

        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Execution timeout: code took too long to run')), timeout)
        })

        // Execute code
        try {
          const executePromise = new Promise<void>((resolve) => {
            try {
              // eslint-disable-next-line no-new-func
              const userFunction = new Function(code)
              userFunction()
              resolve()
            } catch (err) {
              throw err
            }
          })

          await Promise.race([executePromise, timeoutPromise])

          newOutput.push({
            id: generateId(),
            content: 'Code executed successfully',
            type: 'success',
            timestamp: Date.now(),
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          newOutput.push({
            id: generateId(),
            content: `Error: ${errorMessage}`,
            type: 'error',
            timestamp: Date.now(),
          })
        }

        restoreConsole()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        newOutput.push({
          id: generateId(),
          content: `Fatal error: ${errorMessage}`,
          type: 'error',
          timestamp: Date.now(),
        })
      } finally {
        setIsRunning(false)
        setOutput(newOutput)
      }
    },
    []
  )

  const clearOutput = useCallback(() => {
    setOutput([])
  }, [])

  return {
    output,
    isRunning,
    executeCode,
    clearOutput,
  }
}
