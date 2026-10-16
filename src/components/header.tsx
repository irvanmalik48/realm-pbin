import { Code2, Compass, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { SiteSettingsDialog } from "@/components/site-settings-dialog";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

export function Header() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors"
    >
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="flex items-center gap-2.5 font-semibold text-foreground tracking-tight transition-opacity hover:opacity-85"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Code2 className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Realm{" "}
              <span className="text-muted-foreground font-normal">
                / Pastebin
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 sm:flex"
            aria-label="Main Navigation"
          >
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Plus className="size-3.5" data-icon="inline-start" />
              New Paste
            </Link>
            <Link
              href="/explore"
              transitionTypes={["nav-forward"]}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Compass className="size-3.5" data-icon="inline-start" />
              Explore
            </Link>
            <Link
              href="/settings"
              transitionTypes={["nav-forward"]}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Settings2 className="size-3.5" data-icon="inline-start" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href="/explore"
            transitionTypes={["nav-forward"]}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "sm:hidden",
            })}
          >
            <Compass className="size-3.5" data-icon="inline-start" />
            Explore
          </Link>
          <SiteSettingsDialog />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
