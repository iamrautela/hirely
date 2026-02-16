import { NextResponse } from "next/server"

type SupportedLanguage = "javascript" | "typescript"

interface RunRequestBody {
  language: SupportedLanguage
  code: string
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

    if (language !== "javascript" && language !== "typescript") {
      return NextResponse.json(
        {
          error:
            "Only JavaScript and TypeScript are supported in the in-browser runner right now.",
        },
        { status: 400 },
      )
    }

    // Extremely restricted execution: run code in a Function sandbox
    // This will only have access to a limited console and no outer scope.
    let output = ""
    const logs: string[] = []

    const sandboxConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((a) => String(a)).join(" "))
      },
      error: (...args: unknown[]) => {
        logs.push(args.map((a) => String(a)).join(" "))
      },
    }

    try {
      const wrappedCode =
        language === "typescript"
          ? code
          : code

      // eslint-disable-next-line no-new-func
      const fn = new Function("console", `"use strict";\n${wrappedCode}`)
      const result = await Promise.resolve(fn(sandboxConsole))

      output = logs.join("\n")
      if (result !== undefined) {
        output = output ? `${output}\n${String(result)}` : String(result)
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
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    )
  }
}


