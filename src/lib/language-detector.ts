/**
 * Language detection heuristics and URL slug extension override utilities.
 */

export const EXTENSION_TO_SYNTAX_MAP: Record<string, string> = {
  // TypeScript & JavaScript
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",

  // Python
  py: "python",
  pyw: "python",
  python: "python",

  // Go
  go: "go",
  golang: "go",

  // Rust
  rs: "rust",
  rust: "rust",

  // JSON
  json: "json",
  jsonc: "json",
  json5: "json",

  // YAML
  yaml: "yaml",
  yml: "yaml",

  // HTML
  html: "html",
  htm: "html",
  xhtml: "html",

  // CSS
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",

  // SQL
  sql: "sql",

  // Shell / Bash
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  ksh: "bash",

  // Markdown
  md: "markdown",
  markdown: "markdown",
  mdown: "markdown",
  mkdn: "markdown",

  // C / C++
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  hxx: "cpp",

  // C#
  cs: "csharp",
  csharp: "csharp",

  // Java
  java: "java",
  class: "java",

  // PHP
  php: "php",
  phtml: "php",
  php3: "php",
  php4: "php",
  php5: "php",
  php7: "php",

  // Ruby
  rb: "ruby",
  ruby: "ruby",
  rake: "ruby",
  gemspec: "ruby",

  // Docker
  dockerfile: "dockerfile",
  docker: "dockerfile",

  // Nginx / Config
  conf: "nginx",
  nginx: "nginx",

  // Env
  env: "env",

  // Diff / Patch
  diff: "diff",
  patch: "diff",

  // Plaintext
  txt: "plaintext",
  text: "plaintext",
  raw: "plaintext",
  plain: "plaintext",
  log: "plaintext",
};

/**
 * Resolves a file extension to its canonical supported syntax identifier.
 */
export function getSyntaxFromExtension(ext: string): string | null {
  const normalized = ext.trim().toLowerCase().replace(/^\./, "");
  return EXTENSION_TO_SYNTAX_MAP[normalized] ?? null;
}

/**
 * Detects syntax from a filename or title (e.g. "server.go", "Dockerfile", ".env.local").
 */
export function detectFromFilename(filename: string): string | null {
  const trimmed = filename.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Exact or prefix filenames
  if (lower === "dockerfile" || lower.startsWith("dockerfile.")) {
    return "dockerfile";
  }
  if (lower === ".env" || lower.startsWith(".env.")) {
    return "env";
  }
  if (lower === "gemfile" || lower === "rakefile") {
    return "ruby";
  }
  if (lower === "nginx.conf") {
    return "nginx";
  }

  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot >= 0 && lastDot < trimmed.length - 1) {
    const ext = trimmed.slice(lastDot + 1);
    const syntax = getSyntaxFromExtension(ext);
    if (syntax) return syntax;
  }

  return null;
}

export interface ResolvedSlugInfo {
  baseSlug: string;
  rawSlug: string;
  syntaxOverride: string | null;
}

/**
 * Parses a raw URL slug to extract the underlying base slug and any manual syntax override extension.
 * E.g. "K9xQm2v.py" -> { baseSlug: "K9xQm2v", rawSlug: "K9xQm2v.py", syntaxOverride: "python" }
 * E.g. "K9xQm2v"    -> { baseSlug: "K9xQm2v", rawSlug: "K9xQm2v", syntaxOverride: null }
 */
export function resolveSlugAndSyntaxOverride(
  rawSlug: string,
): ResolvedSlugInfo {
  const trimmed = rawSlug.trim();
  const lastDot = trimmed.lastIndexOf(".");

  if (lastDot > 0 && lastDot < trimmed.length - 1) {
    const ext = trimmed.slice(lastDot + 1).toLowerCase();
    const syntaxOverride = getSyntaxFromExtension(ext);
    if (syntaxOverride) {
      return {
        baseSlug: trimmed.slice(0, lastDot),
        rawSlug: trimmed,
        syntaxOverride,
      };
    }
  }

  return {
    baseSlug: trimmed,
    rawSlug: trimmed,
    syntaxOverride: null,
  };
}

/**
 * Detects programming language / syntax format from code content and optional filename.
 */
export function detectLanguage(code: string, filename?: string): string {
  // 1. Filename / title extension check
  if (filename) {
    const fromFilename = detectFromFilename(filename);
    if (fromFilename) {
      return fromFilename;
    }
  }

  const trimmed = code.trim();
  if (!trimmed) {
    return "plaintext";
  }

  // 2. Shebang / first line signatures
  const firstLine = trimmed.split("\n", 1)[0].trim();
  if (firstLine.startsWith("#!")) {
    const shebang = firstLine.toLowerCase();
    if (shebang.includes("python")) return "python";
    if (
      shebang.includes("node") ||
      shebang.includes("deno") ||
      shebang.includes("bun")
    )
      return "javascript";
    if (
      shebang.includes("bash") ||
      shebang.includes("sh") ||
      shebang.includes("zsh")
    )
      return "bash";
    if (shebang.includes("ruby")) return "ruby";
    if (shebang.includes("php")) return "php";
    if (shebang.includes("perl")) return "bash";
  }

  // 3. Unambiguous initial structures
  if (trimmed.startsWith("<?php") || trimmed.startsWith("<?=")) {
    return "php";
  }
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return "html";
  }
  if (
    trimmed.startsWith("diff --git ") ||
    trimmed.startsWith("--- a/") ||
    trimmed.startsWith("Index: ")
  ) {
    return "diff";
  }
  if (/^FROM\s+[\w./:-]+/m.test(trimmed)) {
    return "dockerfile";
  }

  // Quick JSON verification
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not valid JSON; evaluate other languages
    }
  }

  // 4. Feature Scoring
  const scores: Record<string, number> = {
    python: 0,
    go: 0,
    rust: 0,
    sql: 0,
    html: 0,
    css: 0,
    bash: 0,
    c: 0,
    cpp: 0,
    csharp: 0,
    java: 0,
    ruby: 0,
    yaml: 0,
    nginx: 0,
    env: 0,
    markdown: 0,
  };

  // Python patterns
  if (/\bdef\s+\w+\s*\([^)]*\)\s*:/.test(trimmed)) scores.python += 10;
  if (/\bif\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(trimmed))
    scores.python += 10;
  if (/\bfrom\s+[\w.]+\s+import\s+/.test(trimmed)) scores.python += 8;
  if (
    /\bimport\s+\w+(?:\s+as\s+\w+)?$/.test(trimmed) ||
    /\bimport\s+\w+/.test(trimmed)
  )
    scores.python += 4;
  if (/\belif\s+(?:\S.*)?:/.test(trimmed)) scores.python += 7;
  if (/\b(?:True|False|None)\b/.test(trimmed)) scores.python += 3;
  if (/\bself\.\w+/.test(trimmed)) scores.python += 4;
  if (/\bprint\s*\(/.test(trimmed)) scores.python += 2;

  // Go patterns
  if (/\bpackage\s+\w+/.test(trimmed)) scores.go += 10;
  if (/\bfunc\s+(?:\([\w* ]+\)\s+)?\w+\s*\(/.test(trimmed)) scores.go += 8;
  if (/\bimport\s+(?:\([^)]+\)|"[^"]+")/.test(trimmed)) scores.go += 6;
  if (/:=/.test(trimmed)) scores.go += 4;
  if (/\bfmt\.(?:Println|Printf|Sprintf|Errorf)\b/.test(trimmed))
    scores.go += 8;
  if (/\b(?:chan|defer|iota)\b/.test(trimmed)) scores.go += 5;

  // Rust patterns
  if (/\bfn\s+\w+\s*(?:<[^>]*>\s*)?\(/.test(trimmed)) scores.rust += 10;
  if (/\blet\s+mut\s+/.test(trimmed)) scores.rust += 10;
  if (/\bimpl(?:\s+[^\s{]+)?\s+for\s+/.test(trimmed)) scores.rust += 10;
  if (/\buse\s+(?:std|crate)::/.test(trimmed)) scores.rust += 8;
  if (/\bprintln!\s*\(/.test(trimmed)) scores.rust += 8;
  if (
    /\bpub(?:\(crate\))?\s+(?:fn|struct|enum|trait|type|const)\b/.test(trimmed)
  )
    scores.rust += 8;
  if (/\bmatch\s+(?:\S.*)?\{\s*/.test(trimmed)) scores.rust += 5;

  // SQL patterns
  if (
    /\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(
      trimmed,
    )
  )
    scores.sql += 10;
  if (
    /\b(?:FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN)\b/i.test(
      trimmed,
    )
  )
    scores.sql += 6;

  // CSS patterns
  if (/(?:[.#][\w-]+|\*|body|html|div)\s*\{[^:}]*:[^}]*\}/.test(trimmed))
    scores.css += 8;
  if (/@media\s*\(/.test(trimmed)) scores.css += 8;
  if (/@keyframes\s+/.test(trimmed)) scores.css += 8;
  if (/\b(?:px|rem|em|vh|vw|var\(--[\w-]+\))\b/.test(trimmed)) scores.css += 4;

  // HTML patterns
  if (
    /<\/?(?:html|head|body|div|span|p|a|ul|li|table|tr|td|button|form|input|section|nav|header|footer)[\s>]/i.test(
      trimmed,
    )
  )
    scores.html += 6;

  // C / C++ patterns
  if (/#include\s+<iostream>/.test(trimmed)) scores.cpp += 14;
  if (/#include\s+<vector>/.test(trimmed)) scores.cpp += 12;
  if (/\bstd::(?:cout|cin|endl|string|vector|map|unique_ptr)\b/.test(trimmed))
    scores.cpp += 10;
  if (/cout\s*<</.test(trimmed)) scores.cpp += 8;
  if (/\btemplate\s*</.test(trimmed)) scores.cpp += 8;

  if (/#include\s+<stdio\.h>/.test(trimmed)) scores.c += 14;
  if (/#include\s+<stdlib\.h>/.test(trimmed)) scores.c += 10;
  if (/\bprintf\s*\(/.test(trimmed)) scores.c += 6;

  // C# patterns
  if (/using\s+System(?:\.\w+)*;/.test(trimmed)) scores.csharp += 12;
  if (/namespace\s+[\w.]+/.test(trimmed)) scores.csharp += 8;
  if (/Console\.(?:WriteLine|Write)\s*\(/.test(trimmed)) scores.csharp += 10;

  // Java patterns
  if (/public\s+static\s+void\s+main\s*\(\s*String/.test(trimmed))
    scores.java += 14;
  if (/System\.(?:out|err)\.(?:println|print)/.test(trimmed)) scores.java += 10;
  if (/package\s+[a-z]+(?:\.[a-z0-9_]+)+;/.test(trimmed)) scores.java += 8;

  // Ruby patterns
  if (/\battr_(?:accessor|reader|writer)\b/.test(trimmed)) scores.ruby += 10;
  if (/\bdef\s+\w+[!?]?(?:\s*\([^)]*\))?\s*\n/.test(trimmed)) scores.ruby += 6;
  if (/\bputs\s+/.test(trimmed)) scores.ruby += 4;

  // YAML patterns
  if (/^[\w-]+:(?:\s+\S.*)?$/m.test(trimmed)) {
    const yamlMatches = (trimmed.match(/^[\w-]+:(?:\s+\S.*)?$/gm) || []).length;
    if (yamlMatches >= 2) scores.yaml += 8;
  }
  if (/^---\s*$/m.test(trimmed)) scores.yaml += 6;

  // Nginx patterns
  if (/\bserver\s*\{/.test(trimmed)) scores.nginx += 8;
  if (/\blocation\s+[/~]/.test(trimmed)) scores.nginx += 8;
  if (/\bproxy_pass\s+/.test(trimmed)) scores.nginx += 10;

  // Env patterns
  const lines = trimmed
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  const envMatches = lines.filter((l) =>
    /^[A-Z0-9_]+=[^\n]*$/.test(l.trim()),
  ).length;
  if (lines.length > 0 && envMatches / lines.length >= 0.7) {
    scores.env += 15;
  }

  // Markdown patterns
  if (/^#+\s+(?:\S.*)?$/m.test(trimmed)) scores.markdown += 6;
  if (/^```[a-z]*$/m.test(trimmed)) scores.markdown += 8;
  if (/\[.*\]\(https?:\/\/[^)]+\)/.test(trimmed)) scores.markdown += 6;

  // Shell / Bash patterns
  if (
    /\b(?:if\s+\[[\s\S]*?\];\s+then|fi|elif\s+\[[\s\S]*?\];\s+then)\b/.test(
      trimmed,
    )
  )
    scores.bash += 10;
  if (
    /\b(?:echo\s+['"]|chmod\s+|chown\s+|mkdir\s+-p|rm\s+-rf|sudo\s+)/.test(
      trimmed,
    )
  )
    scores.bash += 5;

  // JavaScript / TypeScript / React patterns
  let jsTsScore = 0;
  let hasTsFeatures = false;
  let hasJsxFeatures = false;

  if (/\b(?:const|let|var)\s+\w+\s*=\s*/.test(trimmed)) jsTsScore += 4;
  if (/\bconsole\.(?:log|error|warn|info)\s*\(/.test(trimmed)) jsTsScore += 6;
  if (/\bfunction\s+(?:\w+\s*)?\(/.test(trimmed)) jsTsScore += 5;
  if (/=>/.test(trimmed)) jsTsScore += 3;
  if (
    /\bimport\s+(?:\{[^}]*\}|[\w*]+)(?:,\s*(?:\{[^}]*\}|[\w*]+))*\s+from\s+['"][^'"]+['"]/.test(
      trimmed,
    )
  )
    jsTsScore += 6;
  if (/\bexport\s+(?:default\s+)?/.test(trimmed)) jsTsScore += 5;

  // Check TypeScript indicators
  if (/\b(?:interface|type)\s+[A-Z]\w*\s*(?:=|\{)/.test(trimmed)) {
    jsTsScore += 8;
    hasTsFeatures = true;
  }
  if (
    /:\s*(?:string|number|boolean|any|unknown|never|void|Record<[^>]+>)\b/.test(
      trimmed,
    )
  ) {
    jsTsScore += 6;
    hasTsFeatures = true;
  }
  if (/\bas\s+[A-Z]\w*/.test(trimmed)) {
    jsTsScore += 4;
    hasTsFeatures = true;
  }

  // Check JSX indicators
  if (
    /<\/?[A-Z]\w*(?:\s[^>]*)?\/?>/.test(trimmed) ||
    /className=/.test(trimmed) ||
    /onClick=/.test(trimmed) ||
    /import\s+React\b/.test(trimmed)
  ) {
    jsTsScore += 8;
    hasJsxFeatures = true;
  }

  // Determine top score from specific languages
  let topLang = "plaintext";
  let maxScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topLang = lang;
    }
  }

  if (jsTsScore > maxScore && jsTsScore >= 5) {
    if (hasJsxFeatures && hasTsFeatures) return "tsx";
    if (hasJsxFeatures) return "jsx";
    if (hasTsFeatures) return "typescript";
    return "javascript";
  }

  if (maxScore >= 5) {
    return topLang;
  }

  return "plaintext";
}
