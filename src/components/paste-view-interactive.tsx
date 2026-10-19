"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  Code2,
  Eye,
  GitFork,
  Hourglass,
  Lock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ViewTransition } from "react";
import { CodeViewer } from "@/components/code-viewer";
import { PasswordUnlockCard } from "@/components/password-unlock-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Paste } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface PasteViewInteractiveProps {
  initialPaste: Paste;
}

export function PasteViewInteractive({
  initialPaste,
}: PasteViewInteractiveProps) {
  const [paste, setPaste] = React.useState<Paste>(initialPaste);
  const [isUnlocked, setIsUnlocked] = React.useState(
    Boolean(initialPaste.content),
  );

  const handleUnlock = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/v1/pastes/${encodeURIComponent(paste.slug)}?password=${encodeURIComponent(password)}`,
      );

      if (res.ok) {
        const data = await res.json();
        setPaste(data);
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(paste.created_at), {
    addSuffix: true,
  });

  const formattedDate = format(new Date(paste.created_at), "MMM d, yyyy");

  const forkUrl = `/?title=${encodeURIComponent(`Copy of ${paste.title}`)}&syntax=${encodeURIComponent(paste.syntax)}&content=${encodeURIComponent(paste.content)}`;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header Info & Actions */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="font-mono text-xs uppercase tracking-wider"
              >
                {paste.syntax}
              </Badge>
              {paste.is_encrypted && (
                <Badge
                  variant="outline"
                  className="text-amber-500 border-amber-500/30 gap-1 text-xs"
                >
                  <Lock className="size-3" />
                  Password Protected
                </Badge>
              )}
            </div>

            {/* Shared Element Text Morph on Paste Title */}
            <ViewTransition
              name={`paste-title-${paste.slug}`}
              share="text-morph"
            >
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl break-words">
                {paste.title}
              </h1>
            </ViewTransition>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isUnlocked && (
              <Link
                href={forkUrl}
                transitionTypes={["nav-back"]}
                title="Edit a copy in editor"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <GitFork className="size-3.5" data-icon="inline-start" />
                Edit a Copy
              </Link>
            )}

            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              <Plus className="size-3.5" data-icon="inline-start" />
              New Paste
            </Link>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <span
            className="flex items-center gap-1.5"
            title={`Created on ${formattedDate}`}
          >
            <Calendar className="size-3.5" />
            <span>{timeAgo}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            <span>
              {paste.views} {paste.views === 1 ? "view" : "views"}
            </span>
          </span>

          <span className="flex items-center gap-1.5 font-mono">
            <Code2 className="size-3.5" />
            <span>{formatBytes(paste.size)}</span>
          </span>

          {paste.expires_at ? (
            <span className="flex items-center gap-1.5 text-amber-500/90">
              <Hourglass className="size-3.5" />
              <span>
                Expires{" "}
                {formatDistanceToNow(new Date(paste.expires_at), {
                  addSuffix: true,
                })}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Never expires</span>
            </span>
          )}

          <span className="font-mono text-muted-foreground/60 ml-auto text-[11px]">
            ID: <span className="text-foreground">{paste.slug}</span>
          </span>
        </div>
      </div>

      {/* Content Area: Either Unlock Form or Code Viewer */}
      {paste.is_encrypted && !isUnlocked ? (
        <PasswordUnlockCard slug={paste.slug} onUnlock={handleUnlock} />
      ) : (
        <CodeViewer
          code={paste.content}
          syntax={paste.syntax}
          title={paste.title}
          slug={paste.slug}
        />
      )}
    </div>
  );
}
