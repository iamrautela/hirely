"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "shell", label: "Shell/Bash" },
  { value: "powershell", label: "PowerShell" },
  { value: "r", label: "R" },
  { value: "scala", label: "Scala" },
  { value: "perl", label: "Perl" },
  { value: "lua", label: "Lua" },
  { value: "dart", label: "Dart" },
  { value: "elixir", label: "Elixir" },
  { value: "haskell", label: "Haskell" },
  { value: "clojure", label: "Clojure" },
  { value: "objective-c", label: "Objective-C" },
]

interface CodeEditorProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  readOnly?: boolean
}

export function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const isExternalUpdate = useRef(false)
   const [isRunning, setIsRunning] = useState(false)
   const [runOutput, setRunOutput] = useState<string>("")
   const [runError, setRunError] = useState<string>("")

  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editorRef.current = editor

      // Configure editor theme
      monaco.editor.defineTheme("codecollab-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "function", foreground: "DCDCAA" },
        ],
        colors: {
          "editor.background": "#1a1a1a",
          "editor.foreground": "#d4d4d4",
          "editor.lineHighlightBackground": "#2a2a2a",
          "editor.selectionBackground": "#3a3a3a",
          "editorLineNumber.foreground": "#5a5a5a",
          "editorLineNumber.activeForeground": "#ffffff",
          "editor.inactiveSelectionBackground": "#3a3a3a",
        },
      })
      monaco.editor.setTheme("codecollab-dark")

      // Focus editor
      editor.focus()
    },
    []
  )

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (isExternalUpdate.current) {
        isExternalUpdate.current = false
        return
      }
      if (value !== undefined) {
        onCodeChange(value)
      }
    },
    [onCodeChange]
  )

  // Update editor content when code prop changes externally
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== code) {
        isExternalUpdate.current = true
        const position = editorRef.current.getPosition()
        editorRef.current.setValue(code)
        if (position) {
          editorRef.current.setPosition(position)
        }
      }
    }
  }, [code])

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setRunOutput("")
    setRunError("")
    try {
      const response = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        setRunError(data.error || "Failed to run code")
        if (data.logs && Array.isArray(data.logs)) {
          setRunOutput(data.logs.join("\n"))
        }
      } else {
        setRunOutput(data.output || "")
      }
    } catch (error: any) {
      setRunError(error?.message || "Unexpected error while running code")
    } finally {
      setIsRunning(false)
    }
  }, [code, language])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-editor-bg">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/50" />
            <div className="h-3 w-3 rounded-full bg-chart-3/50" />
            <div className="h-3 w-3 rounded-full bg-online/50" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">main.{getFileExtension(language)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-36 h-8 bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-foreground hover:bg-secondary">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || readOnly}
            className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground shadow-sm hover:bg-accent/90 disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: "'Geist Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            roundedSelection: true,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
          loading={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Loading editor...
            </div>
          }
        />
      </div>
      {/* Output Panel */}
      <div className="h-40 border-t border-border bg-card overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-border bg-secondary px-3 py-1.5">
          <span className="text-xs font-semibold text-foreground">Output</span>
          {(runOutput || runError) && (
            <button
              type="button"
              onClick={() => {
                setRunOutput("")
                setRunError("")
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex-1 px-3 py-2 text-xs font-mono text-foreground overflow-auto">
          {runError ? (
            <pre className="text-destructive whitespace-pre-wrap">{runError}</pre>
          ) : runOutput ? (
            <pre className="whitespace-pre-wrap">{runOutput}</pre>
          ) : (
            <span className="text-muted-foreground">Press "Run" to execute your code and see output here.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    go: "go",
    rust: "rs",
    ruby: "rb",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    sql: "sql",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    markdown: "md",
    shell: "sh",
    powershell: "ps1",
    r: "r",
    scala: "scala",
    perl: "pl",
    lua: "lua",
    dart: "dart",
    elixir: "ex",
    haskell: "hs",
    clojure: "clj",
    "objective-c": "m",
  }
  return extensions[language] || "txt"
}
