import { Compass } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";
import { PasteCard, PasteCardSkeleton } from "@/components/paste-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PasteService } from "@/lib/paste-service";

async function RecentPastesList() {
  await connection();
  const data = await PasteService.listPastes({ limit: 8 });
  const pastes = data.pastes;

  if (pastes.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyTitle>No public pastes yet</EmptyTitle>
          <EmptyDescription>Be the first to share a paste!</EmptyDescription>
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

const RECENT_SKELETON_KEYS = [
  "rec-skel-1",
  "rec-skel-2",
  "rec-skel-3",
  "rec-skel-4",
] as const;

function RecentPastesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {RECENT_SKELETON_KEYS.map((key) => (
        <PasteCardSkeleton key={key} />
      ))}
    </div>
  );
}

export function RecentPastesSection() {
  return (
    <section className="mt-12 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Recent Pastes
          </h2>
          <p className="text-xs text-muted-foreground">
            Explore recently shared public pastes
          </p>
        </div>

        <Link
          href="/explore"
          transitionTypes={["nav-forward"]}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-xs",
          })}
        >
          <Compass className="size-3.5" data-icon="inline-start" />
          View all
        </Link>
      </div>

      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <RecentPastesSkeleton />
          </ViewTransition>
        }
      >
        <ViewTransition enter="slide-up" default="none">
          <RecentPastesList />
        </ViewTransition>
      </Suspense>
    </section>
  );
}
