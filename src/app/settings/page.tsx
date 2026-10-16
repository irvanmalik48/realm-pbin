"use client";

import { Info, Search, Settings2, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { AppearanceSettingsCard } from "@/components/appearance-settings-card";
import { ScrollSettingsCard } from "@/components/scroll-settings-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header with Realtime Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings2 className="size-6 text-primary" />
            Site Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure smooth scrolling physics, stylized floating scrollbars,
            and interface preferences.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            aria-label="Search settings"
            placeholder="Search settings (scroll, lerp, theme)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-muted/40 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        <ScrollSettingsCard searchQuery={searchQuery} />
        <AppearanceSettingsCard searchQuery={searchQuery} />

        {/* System & Runtime Info */}
        {(!searchQuery ||
          "system info architecture gRPC rest storage".includes(
            searchQuery.toLowerCase(),
          )) && (
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="size-5 text-primary" />
                <CardTitle>Architecture & Persistence</CardTitle>
              </div>
              <CardDescription>
                Details on state persistence and runtime communication
                protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
                  <span className="font-semibold text-foreground block mb-1">
                    State Persistence
                  </span>
                  Settings are saved in local browser storage using Jotai atoms
                  and synchronised across sessions instantly.
                </div>
                <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
                  <span className="font-semibold text-foreground block mb-1">
                    Transport Pipeline
                  </span>
                  Data synchronization leverages resilient gRPC binary channels
                  with automated HTTP/REST fallback hierarchy.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
