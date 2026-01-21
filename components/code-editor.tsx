"use client"

import { useEffect, useRef, useCallback } from "react"
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
  }
  return extensions[language] || "txt"
}
