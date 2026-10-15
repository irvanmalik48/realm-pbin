export interface Paste {
  id: string;
  slug: string;
  title: string;
  content: string;
  syntax: string;
  is_public: boolean;
  is_encrypted: boolean;
  views: number;
  size: number;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface CreatePastePayload {
  title: string;
  content: string;
  syntax: string;
  is_public?: boolean;
  password?: string;
  ttl?: "never" | "10m" | "1h" | "1d" | "7d" | "30d" | string;
}

export interface PastesListResponse {
  total: number;
  pastes: Paste[];
}

export interface LanguageOption {
  value: string;
  label: string;
  extension: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "plaintext", label: "Plain Text", extension: "txt" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "tsx", label: "TypeScript React (TSX)", extension: "tsx" },
  { value: "jsx", label: "JavaScript React (JSX)", extension: "jsx" },
  { value: "python", label: "Python", extension: "py" },
  { value: "go", label: "Go", extension: "go" },
  { value: "rust", label: "Rust", extension: "rs" },
  { value: "json", label: "JSON", extension: "json" },
  { value: "yaml", label: "YAML", extension: "yaml" },
  { value: "html", label: "HTML", extension: "html" },
  { value: "css", label: "CSS", extension: "css" },
  { value: "sql", label: "SQL", extension: "sql" },
  { value: "bash", label: "Bash / Shell", extension: "sh" },
  { value: "markdown", label: "Markdown", extension: "md" },
  { value: "c", label: "C", extension: "c" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "java", label: "Java", extension: "java" },
  { value: "php", label: "PHP", extension: "php" },
  { value: "ruby", label: "Ruby", extension: "rb" },
  { value: "dockerfile", label: "Dockerfile", extension: "dockerfile" },
  { value: "nginx", label: "Nginx", extension: "conf" },
  { value: "env", label: ".env", extension: "env" },
  { value: "diff", label: "Diff / Patch", extension: "diff" },
];
