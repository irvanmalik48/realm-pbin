import { formatDistanceToNow } from "date-fns";
import { Clock, Eye, FileCode2, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Paste } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface PasteCardProps {
  paste: Paste;
}

export function PasteCard({ paste }: PasteCardProps) {
  const timeAgo = formatDistanceToNow(new Date(paste.created_at), {
    addSuffix: true,
  });

  return (
    <Link
      href={`/p/${encodeURIComponent(paste.slug)}`}
      transitionTypes={["nav-forward"]}
      className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border hover:shadow-md hover:-translate-y-0.5"
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
              Encrypted
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
