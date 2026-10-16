"use client";

import { Laptop, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function AppearanceSettingsCard({
  searchQuery = "",
}: {
  searchQuery?: string;
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const matchQuery = (text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const themeMatches =
    matchQuery("Theme") ||
    matchQuery("Dark Mode") ||
    matchQuery("Light Mode") ||
    matchQuery("System Theme") ||
    matchQuery("appearance");

  if (!themeMatches) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="size-5 text-primary" />
          <CardTitle>Appearance & Theme</CardTitle>
        </div>
        <CardDescription>
          Customize theme palette and display preferences across the
          application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-foreground">
              Interface Theme
            </span>
            <p className="text-xs text-muted-foreground">
              Choose the color scheme for syntax highlighting and interface
              elements.
            </p>
          </div>

          {mounted && (
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={theme === "light" ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-10"
                onClick={() => {
                  setTheme("light");
                  toast("Theme set to Light");
                }}
              >
                <Sun className="size-4" />
                <span>Light</span>
              </Button>
              <Button
                type="button"
                variant={theme === "dark" ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-10"
                onClick={() => {
                  setTheme("dark");
                  toast("Theme set to Dark");
                }}
              >
                <Moon className="size-4" />
                <span>Dark</span>
              </Button>
              <Button
                type="button"
                variant={theme === "system" ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-10"
                onClick={() => {
                  setTheme("system");
                  toast("Theme set to System default");
                }}
              >
                <Laptop className="size-4" />
                <span>System</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
