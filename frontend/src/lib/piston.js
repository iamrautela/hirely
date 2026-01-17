// Piston API endpoint for code execution
const PISTON_API = "https://emkc.org/api/v2/piston/execute";

// Language mapping for Piston API
const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "cpp", version: "11.2.0" },
  java: { language: "java", version: "15.0.6" },
};

export const executeCode = async (language, code) => {
  try {
    const langConfig = LANGUAGE_MAP[language];

    if (!langConfig) {
      return {
        success: false,
        output: "",
        error: `Unsupported language: ${language}`,
      };
    }

    const payload = {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          name: `main.${getFileExtension(language)}`,
          content: code,
        },
      ],
    };

    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.compile?.stderr) {
      return {
        success: false,
        output: "",
        error: result.compile.stderr,
      };
    }

    if (result.run?.stderr) {
      return {
        success: false,
        output: result.run.stdout || "",
        error: result.run.stderr,
      };
    }

    return {
      success: true,
      output: result.run?.stdout || "",
      error: "",
    };
  } catch (error) {
    console.error("Code execution error:", error);
    return {
      success: false,
      output: "",
      error: error.message || "Failed to execute code",
    };
  }
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: "js",
    python: "py",
    cpp: "cpp",
    java: "java",
  };
  return extensions[language] || "txt";
};
