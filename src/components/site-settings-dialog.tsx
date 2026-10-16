"use client";

import { useAtom } from "jotai";
import {
  ExternalLink,
  Laptop,
  Moon,
  RotateCcw,
  Settings2,
  Sliders,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  customScrollbarEnabledAtom,
  scrollDurationAtom,
  scrollLerpAtom,
  smoothScrollAtom,
} from "@/lib/atoms/scroll";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function SiteSettingsDialog() {
  const [open, setOpen] = React.useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  const [smoothScroll, setSmoothScroll] = useAtom(smoothScrollAtom);
  const [scrollLerp, setScrollLerp] = useAtom(scrollLerpAtom);
  const [scrollDuration, setScrollDuration] = useAtom(scrollDurationAtom);
  const [customScrollbar, setCustomScrollbar] = useAtom(
    customScrollbarEnabledAtom,
  );

  const handleResetDefaults = () => {
    setSmoothScroll(true);
    setScrollLerp(0.1);
    setScrollDuration(1.2);
    setCustomScrollbar(true);
    toast("Scroll settings restored", {
      description: "Default inertia physics and custom scrollbar enabled.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "ghost",
          size: "icon",
          className:
            "w-8 h-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground",
        })}
        aria-label="Open site settings"
        title="Site Settings"
      >
        <Settings2 className="size-4" />
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Settings2 className="size-4" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Site Settings
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Personalize smooth scrolling, scroll physics, scrollbar, and display
            preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Section: Scrolling & Physics */}
          <div className="rounded-lg border border-border/70 bg-card p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <span className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">
                  Scrolling & Physics
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetDefaults}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="size-3" />
                Reset Defaults
              </Button>
            </div>

            {/* Smooth Scroll toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  Smooth Scrolling
                </span>
                <p className="text-xs text-muted-foreground">
                  Inertia-based smooth wheel scrolling powered by Lenis.
                </p>
              </div>
              <Switch
                checked={smoothScroll}
                onCheckedChange={(checked) => {
                  setSmoothScroll(checked);
                  toast(
                    checked
                      ? "Smooth Scrolling Enabled"
                      : "Smooth Scrolling Disabled",
                    {
                      description: checked
                        ? "Lenis inertia physics is active."
                        : "Native browser scrolling restored.",
                    },
                  );
                }}
                aria-label="Toggle smooth scrolling"
              />
            </div>

            {/* Sub-controls when smooth scroll is active */}
            {smoothScroll && (
              <div className="space-y-3.5 pl-3 border-l-2 border-border/60">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">
                      Scroll Velocity (Lerp)
                    </span>
                    <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded font-semibold text-primary">
                      {scrollLerp.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Responsiveness of input tracking (lower is smoother).
                  </p>
                  <input
                    type="range"
                    min="0.01"
                    max="0.4"
                    step="0.01"
                    value={scrollLerp}
                    onChange={(e) =>
                      setScrollLerp(Number.parseFloat(e.target.value))
                    }
                    aria-label="Scroll Velocity (Lerp)"
                    className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">
                      Scroll Duration (Acceleration)
                    </span>
                    <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded font-semibold text-primary">
                      {scrollDuration.toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Animation deceleration curve time.
                  </p>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={scrollDuration}
                    onChange={(e) =>
                      setScrollDuration(Number.parseFloat(e.target.value))
                    }
                    aria-label="Scroll Duration (Acceleration)"
                    className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer accent-primary focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Custom scrollbar toggle */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  Custom Scrollbar
                </span>
                <p className="text-xs text-muted-foreground">
                  Display floating indicator instead of the native browser bar.
                </p>
              </div>
              <Switch
                checked={customScrollbar}
                onCheckedChange={(checked) => {
                  setCustomScrollbar(checked);
                  toast(
                    checked
                      ? "Custom Scrollbar Enabled"
                      : "Custom Scrollbar Disabled",
                    {
                      description: checked
                        ? "Stylized floating scrollbar is active."
                        : "Native scrollbar restored.",
                    },
                  );
                }}
                aria-label="Toggle custom scrollbar"
              />
            </div>
          </div>

          {/* Section: Theme Preference */}
          {mounted && (
            <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
              <span className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">
                Theme Appearance
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="size-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="size-4" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                    theme === "system"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Laptop className="size-4" />
                  System
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full pt-2">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            <span>Open Dedicated Settings Page</span>
            <ExternalLink className="size-3" />
          </Link>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Done
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
