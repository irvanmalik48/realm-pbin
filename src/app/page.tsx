import { Sparkles } from "lucide-react";
import { Suspense, ViewTransition } from "react";
import { PasteEditor } from "@/components/paste-editor";
import { RecentPastesSection } from "@/components/recent-pastes-section";
import { Skeleton } from "@/components/ui/skeleton";

interface HomePageProps {
  searchParams?: Promise<{
    title?: string;
    syntax?: string;
    content?: string;
  }>;
}

async function PasteEditorContainer({
  searchParams,
}: {
  searchParams?: Promise<{
    title?: string;
    syntax?: string;
    content?: string;
  }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  return (
    <PasteEditor
      initialTitle={resolved.title || ""}
      initialSyntax={resolved.syntax || "plaintext"}
      initialContent={resolved.content || ""}
    />
  );
}

function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border/80 bg-card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-8 flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="sm:col-span-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/80 bg-card min-h-[460px] p-6 flex flex-col gap-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

export default function HomePage(props: HomePageProps) {
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
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Pastebin
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            New Paste
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste your code or text below to share it instantly with a simple
            link.
          </p>
        </div>

        {/* Main Editor Component with Suspense Boundary */}
        <Suspense
          fallback={
            <ViewTransition exit="slide-down" default="none">
              <EditorSkeleton />
            </ViewTransition>
          }
        >
          <ViewTransition enter="slide-up" default="none">
            <PasteEditorContainer searchParams={props.searchParams} />
          </ViewTransition>
        </Suspense>

        {/* Community Public Snippets Feed */}
        <RecentPastesSection />
      </div>
    </ViewTransition>
  );
}
