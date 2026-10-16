import { Compass, FileCode, Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";
import { ExploreFilters } from "@/components/explore-filters";
import { PasteCard, PasteCardSkeleton } from "@/components/paste-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { PasteService } from "@/lib/paste-service";

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string;
    syntax?: string;
  }>;
}

async function ExploreList({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; syntax?: string }>;
}) {
  await connection();
  const { search, syntax } = await searchParams;
  const result = await PasteService.listPastes({
    search,
    syntax: syntax === "all" ? undefined : syntax,
    limit: 50,
  });

  const pastes = result.pastes;

  if (pastes.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileCode className="size-6" />
          </div>
          <EmptyTitle>No Snippets Found</EmptyTitle>
          <EmptyDescription>
            {search || (syntax && syntax !== "all")
              ? "No snippets match your current search and language filters."
              : "There are currently no public snippets in the directory."}
          </EmptyDescription>
          <div className="mt-4 flex justify-center gap-2">
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pastes.map((paste) => (
        <PasteCard key={paste.slug} paste={paste} />
      ))}
    </div>
  );
}

const EXPLORE_SKELETON_KEYS = [
  "exp-skel-1",
  "exp-skel-2",
  "exp-skel-3",
  "exp-skel-4",
  "exp-skel-5",
  "exp-skel-6",
] as const;

function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EXPLORE_SKELETON_KEYS.map((key) => (
        <PasteCardSkeleton key={key} />
      ))}
    </div>
  );
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
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
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Compass className="size-3.5" />
              Explore
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore Pastes
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse and search publicly shared pastes.
            </p>
          </div>

          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className={buttonVariants()}
          >
            <Plus className="size-4" data-icon="inline-start" />
            New Paste
          </Link>
        </div>

        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <ExploreFilters />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <ViewTransition exit="slide-down" default="none">
              <ExploreSkeleton />
            </ViewTransition>
          }
        >
          <ViewTransition enter="slide-up" default="none">
            <ExploreList searchParams={searchParams} />
          </ViewTransition>
        </Suspense>
      </div>
    </ViewTransition>
  );
}
