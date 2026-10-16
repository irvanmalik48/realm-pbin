"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  WrapText,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { highlightCode } from "@/lib/syntax-highlighter";
import { SUPPORTED_LANGUAGES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  code: string;
  syntax: string;
  title: string;
  slug: string;
}

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot(): number | null {
  const match = window.location.hash.match(/^#L(\d+)$/);
  return match?.[1] ? Number.parseInt(match[1], 10) : null;
}

function getServerHashSnapshot(): number | null {
  return null;
}

export function CodeViewer({ code, syntax, title, slug }: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const [lineWrap, setLineWrap] = React.useState(false);
  const [selectedLine, setSelectedLine] = React.useState<number | null>(null);
  const hashLine = React.useSyncExternalStore(
    subscribeHash,
    getHashSnapshot,
    getServerHashSnapshot,
  );
  const activeLine = selectedLine ?? hashLine;

  const highlightedHtml = React.useMemo(() => {
    return highlightCode(code, syntax);
  }, [code, syntax]);

  const lines = React.useMemo(() => {
    return code.split("\n");
  }, [code]);

  const lineItems = React.useMemo(() => {
    const splitLines = highlightedHtml.split("\n");
    return splitLines.map((lineHtml, i) => ({
      key: `${slug}-line-${i + 1}`,
      lineNum: i + 1,
      lineHtml,
    }));
  }, [highlightedHtml, slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Snippet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard");
    }
  };

  const handleDownload = () => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.value === syntax);
    const ext = lang ? lang.extension : "txt";
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || slug}.${ext}`;

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  const handleLineClick = (lineNum: number) => {
    if (activeLine === lineNum) {
      setSelectedLine(null);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } else {
      setSelectedLine(lineNum);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#L${lineNum}`);
      }
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* Code Viewer Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Terminal decoration */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-red-500/70" />
            <span className="size-2.5 rounded-full bg-yellow-500/70" />
            <span className="size-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-1.5 flex items-center gap-1">
            <FileCode className="size-3.5" />
            {syntax} • {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLineWrap(!lineWrap)}
            title={lineWrap ? "Disable line wrapping" : "Enable line wrapping"}
            className={cn(
              "h-7 px-2 text-xs",
              lineWrap && "bg-muted text-foreground",
            )}
          >
            <WrapText className="size-3.5" data-icon="inline-start" />
            <span className="hidden sm:inline">Wrap</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
            title="Copy code"
          >
            {copied ? (
              <Check
                className="size-3.5 text-green-500"
                data-icon="inline-start"
              />
            ) : (
              <Copy className="size-3.5" data-icon="inline-start" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 text-xs"
            title="Download snippet"
          >
            <Download className="size-3.5" data-icon="inline-start" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <a
            href={`/api/v1/pastes/${encodeURIComponent(slug)}/raw`}
            target="_blank"
            rel="noopener noreferrer"
            title="View Raw plaintext"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-7 px-2 text-xs",
            })}
          >
            <ExternalLink className="size-3.5" data-icon="inline-start" />
            <span className="hidden sm:inline">Raw</span>
          </a>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative overflow-x-auto bg-card">
        <pre
          className={cn(
            "p-4 font-mono text-[13px] leading-relaxed select-text",
            lineWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
          )}
        >
          <code className={`language-${syntax} block`}>
            {lineItems.map((item) => {
              const isSelected = activeLine === item.lineNum;
              return (
                <div
                  key={item.key}
                  id={`L${item.lineNum}`}
                  className={cn(
                    "flex group hover:bg-muted/40 transition-colors -mx-4 px-4 py-0.5",
                    isSelected && "bg-accent/70 border-l-2 border-primary",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleLineClick(item.lineNum)}
                    className={cn(
                      "w-10 select-none text-right pr-4 text-xs font-mono tabular-nums text-muted-foreground/60 transition-colors group-hover:text-muted-foreground cursor-pointer focus:outline-none",
                      isSelected && "text-primary font-semibold",
                    )}
                    aria-label={`Line ${item.lineNum}`}
                  >
                    {item.lineNum}
                  </button>
                  <span
                    className="flex-1 overflow-x-visible"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: safe prism highlighted output
                    dangerouslySetInnerHTML={{
                      __html: item.lineHtml || " ",
                    }}
                  />
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
