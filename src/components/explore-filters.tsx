"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/types";

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentSyntax = searchParams.get("syntax") || "all";

  const [search, setSearch] = React.useState(currentSearch);
  const [syntax, setSyntax] = React.useState(currentSyntax);

  const applyFilters = (newSearch: string, newSyntax: string) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("search", newSearch.trim());
    if (newSyntax && newSyntax !== "all") params.set("syntax", newSyntax);

    const query = params.toString();
    router.replace(`/explore${query ? `?${query}` : ""}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, syntax);
  };

  const handleSyntaxChange = (val: string | null) => {
    const nextSyntax = val || "all";
    setSyntax(nextSyntax);
    applyFilters(search, nextSyntax);
  };

  const handleClear = () => {
    setSearch("");
    setSyntax("all");
    router.replace("/explore");
  };

  const hasActiveFilters = Boolean(
    search.trim() || (syntax && syntax !== "all"),
  );

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search pastes by title or ID..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              applyFilters("", syntax);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Syntax Dropdown */}
      <div className="w-full sm:w-56">
        <Select value={syntax} onValueChange={handleSyntaxChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Language</SelectLabel>
              <SelectItem value="all">All Languages</SelectItem>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs"
        >
          Clear Filters
        </Button>
      )}
    </form>
  );
}
