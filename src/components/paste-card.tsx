import { formatDistanceToNow } from "date-fns";
import { Clock, Eye, FileCode2, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Paste } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

export function PasteCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

interface PasteCardProps {
  paste: Paste;
}

export function PasteCard({ paste }: PasteCardProps) {
  const timeAgo = formatDistanceToNow(new Date(paste.created_at), {
    addSuffix: true,
  });

  return (
    <Link
      href={`/${encodeURIComponent(paste.slug)}`}
      transitionTypes={["nav-forward"]}
      className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-colors duration-150 hover:border-border hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="font-mono text-[11px] uppercase tracking-wider"
          >
            {paste.syntax}
          </Badge>
          {paste.is_encrypted && (
            <Badge
              variant="outline"
              className="text-amber-500 border-amber-500/30 gap-1 text-[11px]"
            >
              <Lock className="size-3" />
              Password Protected
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-1 font-semibold text-foreground text-sm tracking-tight transition-colors group-hover:text-primary">
          {paste.title}
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-mono text-[11px]">
          <FileCode2 className="size-3 text-muted-foreground/70" />
          {formatBytes(paste.size)}
        </span>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Eye className="size-3 text-muted-foreground/70" />
            {paste.views}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Clock className="size-3 text-muted-foreground/70" />
            {timeAgo}
          </span>
        </div>
      </div>
    </Link>
  );
}
