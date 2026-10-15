import { PasteStore } from "./paste-store";
import type { CreatePastePayload, Paste, PastesListResponse } from "./types";

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export class PasteService {
  /**
   * Fetches the list of public pastes.
   */
  static async listPastes(options?: {
    search?: string;
    syntax?: string;
    limit?: number;
    offset?: number;
  }): Promise<PastesListResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.search) params.set("search", options.search);
      if (options?.syntax && options.syntax !== "all")
        params.set("syntax", options.syntax);
      if (options?.limit) params.set("limit", options.limit.toString());
      if (options?.offset) params.set("offset", options.offset.toString());
      params.set("public", "true");

      const res = await fetch(
        `${API_BASE_URL}/v1/pastes?${params.toString()}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(1500),
        },
      );

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running or unreachable -> fall back to internal store
    }

    return PasteStore.list({
      search: options?.search,
      syntax: options?.syntax === "all" ? undefined : options?.syntax,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Fetches a single paste by slug, with optional password.
   */
  static async getPaste(
    slug: string,
    password?: string,
  ): Promise<{ status: 200 | 401 | 404 | 410; paste: Paste | null }> {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (password) {
        headers["X-Paste-Password"] = password;
      }

      const res = await fetch(
        `${API_BASE_URL}/v1/pastes/${encodeURIComponent(slug)}`,
        {
          cache: "no-store",
          headers,
          signal: AbortSignal.timeout(1500),
        },
      );

      if (res.status === 200) {
        const data = await res.json();
        return { status: 200, paste: data };
      }
      if (res.status === 401) {
        return { status: 401, paste: null };
      }
      if (res.status === 404) {
        return { status: 404, paste: null };
      }
      if (res.status === 410) {
        return { status: 410, paste: null };
      }
    } catch {
      // Backend not running or unreachable -> fall back to internal store
    }

    return PasteStore.get(slug, password);
  }

  /**
   * Creates a new paste snippet.
   */
  static async createPaste(payload: CreatePastePayload): Promise<Paste> {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/pastes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running or unreachable -> fall back to internal store
    }

    return PasteStore.create(payload);
  }
}
