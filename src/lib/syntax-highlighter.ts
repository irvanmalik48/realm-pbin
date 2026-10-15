import Prism from "prismjs";

// Import commonly used prism grammars
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-php";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-nginx";
import "prismjs/components/prism-diff";

export function highlightCode(code: string, syntax: string): string {
  const normalizedSyntax = syntax.toLowerCase();
  const grammar =
    Prism.languages[normalizedSyntax] ||
    (normalizedSyntax === "sh" ? Prism.languages.bash : null) ||
    (normalizedSyntax === "dockerfile" ? Prism.languages.docker : null) ||
    (normalizedSyntax === "env" ? Prism.languages.bash : null) ||
    Prism.languages.plaintext;

  if (!grammar) {
    return escapeHtml(code);
  }

  try {
    return Prism.highlight(code, grammar, normalizedSyntax);
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
