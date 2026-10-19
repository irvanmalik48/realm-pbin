"use client";

import {
  Code,
  Eye,
  EyeOff,
  Hourglass,
  Keyboard,
  Lock,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type CreatePastePayload, SUPPORTED_LANGUAGES } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface PasteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialSyntax?: string;
}

export function PasteEditor({
  initialTitle = "",
  initialContent = "",
  initialSyntax = "plaintext",
}: PasteEditorProps) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initialTitle);
  const [content, setContent] = React.useState(initialContent);
  const [syntax, setSyntax] = React.useState(initialSyntax);
  const [ttl, setTtl] = React.useState("7d");
  const [enablePassword, setEnablePassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  // Line count
  const lines = React.useMemo(() => {
    return content.split("\n");
  }, [content]);

  const lineCount = lines.length;
  const charCount = content.length;
  const byteSize = React.useMemo(() => {
    return new TextEncoder().encode(content).length;
  }, [content]);

  // Synchronize line numbers scroll with textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Support Tab key indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const updated = `${content.substring(0, start)}  ${content.substring(end)}`;
      setContent(updated);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      });
    }

    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Drag and drop file support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContent(text);

      // Guess syntax from extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext) {
        const found = SUPPORTED_LANGUAGES.find((l) => l.extension === ext);
        if (found) {
          setSyntax(found.value);
        }
      }

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      toast.success(`Loaded file: ${file.name}`);
    } catch {
      toast.error("Could not read dropped file");
    }
  };

  const handleReset = () => {
    if (
      content.length > 0 &&
      !window.confirm("Are you sure you want to clear your current text?")
    ) {
      return;
    }
    setTitle("");
    setContent("");
    setSyntax("plaintext");
    setPassword("");
    setEnablePassword(false);
    toast.info("Editor cleared");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some text or code before creating a paste");
      textareaRef.current?.focus();
      return;
    }

    if (enablePassword && !password.trim()) {
      toast.error("Please enter a password or turn off password protection");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreatePastePayload = {
        title: title.trim() || "Untitled Paste",
        content: content.trim(),
        syntax,
        ttl,
        password:
          enablePassword && password.trim() ? password.trim() : undefined,
      };

      const res = await fetch("/api/v1/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to create paste");
        setIsSubmitting(false);
        return;
      }

      const created = await res.json();
      toast.success("Paste created!");
      setIsSubmitting(false);

      // Navigate with View Transition
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (document as any).startViewTransition(() => {
          router.push(`/${created.slug}`);
        });
      } else {
        router.push(`/${created.slug}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {/* Top Meta Controls Bar */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs w-full">
        <FieldGroup className="gap-4">
          {/* Row 1: Title & Language */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <Field>
                <FieldLabel htmlFor="paste-title">Title</FieldLabel>
                <Input
                  id="paste-title"
                  placeholder="Untitled paste (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <FieldDescription>
                  Optional title to identify this paste.
                </FieldDescription>
              </Field>
            </div>

            <div className="sm:col-span-4">
              <Field>
                <FieldLabel htmlFor="syntax-select">Language</FieldLabel>
                <Select
                  value={syntax}
                  onValueChange={(val) => val && setSyntax(val)}
                >
                  <SelectTrigger id="syntax-select" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Languages</SelectLabel>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Syntax highlighting format.</FieldDescription>
              </Field>
            </div>
          </div>

          {/* Row 2: Expiration & Encryption */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 pt-3 border-t border-border/60">
            {/* Expiration (TTL) */}
            <div className="sm:col-span-6">
              <Field>
                <FieldLabel
                  htmlFor="ttl-select"
                  className="flex items-center gap-1.5"
                >
                  <Hourglass className="size-3.5 text-muted-foreground" />
                  Expiration
                </FieldLabel>
                <Select value={ttl} onValueChange={(val) => val && setTtl(val)}>
                  <SelectTrigger id="ttl-select" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Keep for</SelectLabel>
                      <SelectItem value="10m">10 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days (Default)</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="never">Never Expire</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  How long this paste will stay available.
                </FieldDescription>
              </Field>
            </div>

            {/* Password Protection Toggle */}
            <div className="sm:col-span-6 flex flex-col justify-center">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Password Protect
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {enablePassword
                      ? "Requires password"
                      : "No password needed"}
                  </span>
                </div>
                <Switch
                  checked={enablePassword}
                  onCheckedChange={setEnablePassword}
                  aria-label="Toggle password protection"
                />
              </div>
            </div>
          </div>

          {/* Conditional Password Input */}
          {enablePassword && (
            <div className="pt-2 animate-in fade-in-50 slide-in-from-top-2">
              <Field>
                <FieldLabel htmlFor="paste-password">Password</FieldLabel>
                <div className="relative flex items-center max-w-md">
                  <Input
                    id="paste-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password to protect this paste..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required={enablePassword}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <FieldDescription>
                  Anyone opening this paste will need to enter this password to
                  view it.
                </FieldDescription>
              </Field>
            </div>
          )}
        </FieldGroup>
      </div>

      {/* Editor Surface */}
      <section
        aria-label="Code Editor Surface"
        className={`relative flex flex-col rounded-xl border transition-all w-full ${
          isDragging
            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
            : "border-border/80 bg-card shadow-xs"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Code className="size-3.5" />
              Editor
            </span>
            <span className="text-border">|</span>
            <span className="font-mono text-xs text-muted-foreground">
              {lineCount} {lineCount === 1 ? "line" : "lines"} • {charCount}{" "}
              characters • {formatBytes(byteSize)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Upload file"
            >
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">Upload File</span>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  setContent(text);
                  if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
                  const ext = file.name.split(".").pop()?.toLowerCase();
                  if (ext) {
                    const found = SUPPORTED_LANGUAGES.find(
                      (l) => l.extension === ext,
                    );
                    if (found) setSyntax(found.value);
                  }
                  toast.success(`Loaded ${file.name}`);
                }}
              />
            </label>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Clear editor"
            >
              <RotateCcw className="size-3.5" data-icon="inline-start" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Code & Line Numbers Gutter Area */}
        <div className="relative flex min-h-[500px] max-h-[750px] overflow-hidden font-mono text-[13px] w-full">
          {/* Gutter */}
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="w-12 shrink-0 select-none overflow-hidden bg-muted/20 py-4 pr-3 text-right font-mono text-xs text-muted-foreground/60 border-r border-border/40"
          >
            {lines.map((_, i) => (
              <div key={`gutter-${i + 1}`} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            aria-label="Code or text content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder="Paste or write code here... (or drag & drop a file)"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            required
            className="flex-1 resize-none bg-transparent p-4 font-mono leading-6 outline-none text-foreground placeholder:text-muted-foreground/60 overflow-y-auto w-full"
          />

          {isDragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs text-primary z-20">
              <Upload className="size-10 mb-2 animate-bounce" />
              <p className="text-base font-semibold">
                Drop file to load content
              </p>
            </div>
          )}
        </div>

        {/* Editor Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Keyboard className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Keyboard shortcut: </span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground border border-border">
              Ctrl+Enter
            </kbd>{" "}
            to save
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || content.trim().length === 0}
              size="default"
              className="px-6 font-medium"
            >
              <Plus className="size-4" data-icon="inline-start" />
              {isSubmitting ? "Creating Paste..." : "Create Paste"}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
