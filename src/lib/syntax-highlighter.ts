import { codeToHtml } from "shiki";

export const SHIKI_LANG_MAP: Record<string, string> = {
  plaintext: "plaintext",
  txt: "plaintext",
  text: "plaintext",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  tsx: "tsx",
  jsx: "jsx",
  python: "python",
  py: "python",
  go: "go",
  golang: "go",
  rust: "rust",
  rs: "rust",
  json: "json",
  jsonc: "json",
  json5: "json",
  yaml: "yaml",
  yml: "yaml",
  html: "html",
  htm: "html",
  xhtml: "html",
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",
  sql: "sql",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  ksh: "bash",
  markdown: "markdown",
  md: "markdown",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  csharp: "csharp",
  cs: "csharp",
  java: "java",
  php: "php",
  ruby: "ruby",
  rb: "ruby",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  nginx: "nginx",
  conf: "nginx",
  env: "dotenv",
  dotenv: "dotenv",
  diff: "diff",
  patch: "diff",
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Highlights source code using Shiki with dual themes (github-light & github-dark).
 * Returns an array of HTML strings corresponding to each line.
 */
export async function highlightCodeToLines(
  code: string,
  syntax: string,
): Promise<string[]> {
  const normalized = syntax ? syntax.toLowerCase() : "plaintext";
  const lang = SHIKI_LANG_MAP[normalized] || "plaintext";

  try {
    const html = await codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    });

    const codeStart = html.indexOf("<code>");
    const codeEnd = html.lastIndexOf("</code>");
    if (codeStart === -1 || codeEnd === -1) {
      return code.split("\n").map(escapeHtml);
    }

    const inner = html.slice(codeStart + 6, codeEnd);
    const rawLines = inner.split("\n");
    return rawLines.map((line) => {
      return line.replace(/^<span class="line">/, "").replace(/<\/span>$/, "");
    });
  } catch {
    return code.split("\n").map(escapeHtml);
  }
}
