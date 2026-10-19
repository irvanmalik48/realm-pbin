import { AlertCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";
import { PasteViewInteractive } from "@/components/paste-view-interactive";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveSlugAndSyntaxOverride } from "@/lib/language-detector";
import { PasteService } from "@/lib/paste-service";
import { highlightCodeToLines } from "@/lib/syntax-highlighter";

interface PastePageProps {
  params: Promise<{ slug: string }>;
}

async function PasteContent({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug: rawSlug } = await params;
  const { baseSlug, syntaxOverride } = resolveSlugAndSyntaxOverride(rawSlug);

  let result = await PasteService.getPaste(baseSlug);

  // If baseSlug lookup 404s and rawSlug is different, try looking up rawSlug directly
  if (result.status === 404 && baseSlug !== rawSlug) {
    result = await PasteService.getPaste(rawSlug);
  }

  if (result.status === 404 || !result.paste) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="size-6" />
          </div>
          <EmptyTitle>Paste Not Found</EmptyTitle>
          <EmptyDescription>
            The snippet with slug <code className="font-mono">{rawSlug}</code>{" "}
            does not exist or may have been deleted.
          </EmptyDescription>
          <div className="mt-4 flex justify-center">
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className={buttonVariants()}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Create New Paste
            </Link>
          </div>
        </EmptyHeader>
      </Empty>
    );
  }

  if (result.status === 410) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Clock className="size-6" />
          </div>
          <EmptyTitle>Paste Has Expired</EmptyTitle>
          <EmptyDescription>
            This snippet had an expiration policy and is no longer available.
          </EmptyDescription>
          <div className="mt-4 flex justify-center">
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className={buttonVariants()}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Create New Paste
            </Link>
          </div>
        </EmptyHeader>
      </Empty>
    );
  }

  const syntax = syntaxOverride || result.paste.syntax;
  const initialPaste = syntaxOverride
    ? {
        ...result.paste,
        syntax: syntaxOverride,
      }
    : result.paste;

  const initialLines = initialPaste.content
    ? await highlightCodeToLines(initialPaste.content, syntax)
    : [];

  return (
    <PasteViewInteractive
      initialPaste={initialPaste}
      initialLines={initialLines}
    />
  );
}

function PasteSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border/60 bg-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 w-1/2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="flex gap-4 pt-3 border-t border-border/40">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6 flex flex-col gap-3">
        <div className="flex justify-between items-center pb-3 border-b border-border/40">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-col gap-2 py-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function PastePage({ params }: PastePageProps) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <ViewTransition exit="slide-down" default="none">
              <PasteSkeleton />
            </ViewTransition>
          }
        >
          <ViewTransition enter="slide-up" default="none">
            <PasteContent params={params} />
          </ViewTransition>
        </Suspense>
      </div>
    </ViewTransition>
  );
}
