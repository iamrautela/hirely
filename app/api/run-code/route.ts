import { NextResponse } from "next/server"

interface RunRequestBody {
  language: string
  code: string
}

// Language configurations for execution
const LANGUAGE_CONFIGS: Record<string, { 
  canRunInBrowser: boolean
  command?: string
  fileExt?: string
}> = {
  javascript: { canRunInBrowser: true },
  typescript: { canRunInBrowser: true },
  python: { canRunInBrowser: false, command: "python", fileExt: "py" },
  java: { canRunInBrowser: false, command: "java", fileExt: "java" },
  cpp: { canRunInBrowser: false, command: "g++", fileExt: "cpp" },
  c: { canRunInBrowser: false, command: "gcc", fileExt: "c" },
  csharp: { canRunInBrowser: false, command: "dotnet", fileExt: "cs" },
  go: { canRunInBrowser: false, command: "go", fileExt: "go" },
  rust: { canRunInBrowser: false, command: "rustc", fileExt: "rs" },
  ruby: { canRunInBrowser: false, command: "ruby", fileExt: "rb" },
  php: { canRunInBrowser: false, command: "php", fileExt: "php" },
  swift: { canRunInBrowser: false, command: "swift", fileExt: "swift" },
  kotlin: { canRunInBrowser: false, command: "kotlinc", fileExt: "kt" },
  shell: { canRunInBrowser: false, command: "bash", fileExt: "sh" },
  powershell: { canRunInBrowser: false, command: "pwsh", fileExt: "ps1" },
  r: { canRunInBrowser: false, command: "Rscript", fileExt: "r" },
  scala: { canRunInBrowser: false, command: "scala", fileExt: "scala" },
  perl: { canRunInBrowser: false, command: "perl", fileExt: "pl" },
  lua: { canRunInBrowser: false, command: "lua", fileExt: "lua" },
  dart: { canRunInBrowser: false, command: "dart", fileExt: "dart" },
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunRequestBody
    const { language, code } = body

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing code or language" },
        { status: 400 },
      )
    }

    const config = LANGUAGE_CONFIGS[language]

    // Handle non-executable languages
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: `${language} is not executable. This language is for viewing/editing only.`,
          output: "Syntax highlighting and editing are supported for this language.",
        },
        { status: 200 },
      )
    }

    // Handle in-browser execution (JavaScript/TypeScript)
    if (config.canRunInBrowser) {
      return await runInBrowser(code, language)
    }

    // For other languages, provide instructions
    return NextResponse.json(
      {
        success: false,
        error: `Server-side execution for ${language} is not available in this demo.`,
        output: `To run ${language} code:\n\n1. Install ${config.command} on your system\n2. Save your code to a .${config.fileExt} file\n3. Run: ${getRunCommand(language, config)}\n\nNote: JavaScript and TypeScript can run directly in the browser.`,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    )
  }
}

async function runInBrowser(code: string, language: string) {
  let output = ""
  const logs: string[] = []

  const sandboxConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map((a) => String(a)).join(" "))
    },
    error: (...args: unknown[]) => {
      logs.push("ERROR: " + args.map((a) => String(a)).join(" "))
    },
    warn: (...args: unknown[]) => {
      logs.push("WARN: " + args.map((a) => String(a)).join(" "))
    },
    info: (...args: unknown[]) => {
      logs.push("INFO: " + args.map((a) => String(a)).join(" "))
    },
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", `"use strict";\n${code}`)
    const result = await Promise.resolve(fn(sandboxConsole))

    output = logs.join("\n")
    if (result !== undefined) {
      output = output ? `${output}\n${String(result)}` : String(result)
    }

    if (!output) {
      output = "Code executed successfully (no output)"
    }

    return NextResponse.json({ success: true, output })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Runtime error while executing code",
        logs,
      },
      { status: 400 },
    )
  }
}

function getRunCommand(language: string, config: { command?: string; fileExt?: string }): string {
  const commands: Record<string, string> = {
    python: `${config.command} main.${config.fileExt}`,
    java: `javac main.${config.fileExt} && java main`,
    cpp: `${config.command} main.${config.fileExt} -o main && ./main`,
    c: `${config.command} main.${config.fileExt} -o main && ./main`,
    go: `${config.command} run main.${config.fileExt}`,
    rust: `${config.command} main.${config.fileExt} && ./main`,
    ruby: `${config.command} main.${config.fileExt}`,
    php: `${config.command} main.${config.fileExt}`,
    shell: `bash main.${config.fileExt}`,
    powershell: `pwsh main.${config.fileExt}`,
    r: `Rscript main.${config.fileExt}`,
    dart: `dart run main.${config.fileExt}`,
    lua: `lua main.${config.fileExt}`,
    perl: `perl main.${config.fileExt}`,
  }
  return commands[language] || `${config.command} main.${config.fileExt}`
}


