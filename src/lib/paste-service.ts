import { getPasteClient, promisifyUnary } from "./grpc/client";
import { PasteStore } from "./paste-store";
import type { CreatePastePayload, Paste, PastesListResponse } from "./types";

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

interface GrpcPasteProto {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  syntax?: string;
  views?: number | string;
  size?: number | string;
  is_public?: boolean;
  is_encrypted?: boolean;
  user_id?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapProtoToPaste(p: GrpcPasteProto): Paste {
  const content = p.content || "";
  return {
    id: String(p.id || ""),
    slug: String(p.slug || ""),
    title: String(p.title || ""),
    content,
    syntax: String(p.syntax || "plaintext"),
    is_public: Boolean(p.is_public),
    is_encrypted: Boolean(p.is_encrypted),
    views: Number(p.views || 0),
    size: Number(p.size || content.length),
    created_at: String(p.created_at || ""),
    updated_at: String(p.updated_at || ""),
    expires_at: p.expires_at || null,
  };
}

export class PasteService {
  /**
   * Fetches the list of public pastes (gRPC -> HTTP -> local fallback).
   */
  static async listPastes(options?: {
    search?: string;
    syntax?: string;
    limit?: number;
    offset?: number;
  }): Promise<PastesListResponse> {
    // 1. Attempt via gRPC
    try {
      const client = getPasteClient();
      const res = await promisifyUnary<
        {
          search?: string;
          syntax?: string;
          is_public_only?: boolean;
          limit?: number;
          offset?: number;
        },
        { pastes?: GrpcPasteProto[]; total?: number }
      >(client, "ListPastes", {
        search: options?.search,
        syntax:
          options?.syntax && options.syntax !== "all"
            ? options.syntax
            : undefined,
        is_public_only: true,
        limit: options?.limit,
        offset: options?.offset,
      });

      if (res && Array.isArray(res.pastes)) {
        return {
          total: Number(res.total || res.pastes.length),
          pastes: res.pastes.map(mapProtoToPaste),
        };
      }
    } catch {
      // gRPC service unreachable or failed -> fall back to HTTP
    }

    // 2. Fallback to HTTP REST Gateway
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

    // 3. Fallback to internal memory store
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
    // 1. Attempt via gRPC
    try {
      const client = getPasteClient();
      const res = await promisifyUnary<
        { slug: string; password?: string },
        GrpcPasteProto
      >(client, "GetPaste", { slug, password: password || undefined });

      if (res?.slug) {
        return { status: 200, paste: mapProtoToPaste(res) };
      }
    } catch (err: unknown) {
      const grpcErr = err as { code?: number };
      if (grpcErr?.code === 5) {
        // NOT_FOUND
        return { status: 404, paste: null };
      }
      if (grpcErr?.code === 16 || grpcErr?.code === 7) {
        // UNAUTHENTICATED or PERMISSION_DENIED
        return { status: 401, paste: null };
      }
      // If server is unavailable (code 14) or other network error, fall through to HTTP
    }

    // 2. Fallback to HTTP REST Gateway
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

    // 3. Fallback to internal memory store
    return PasteStore.get(slug, password);
  }

  /**
   * Creates a new paste snippet.
   */
  static async createPaste(payload: CreatePastePayload): Promise<Paste> {
    // 1. Attempt via gRPC
    try {
      const client = getPasteClient();
      const res = await promisifyUnary<
        {
          content: string;
          title?: string;
          syntax?: string;
          password?: string;
          is_public?: boolean;
          ttl?: string;
        },
        GrpcPasteProto
      >(client, "CreatePaste", {
        content: payload.content,
        title: payload.title,
        syntax: payload.syntax,
        password: payload.password || undefined,
        is_public: payload.is_public !== false,
        ttl: payload.ttl || undefined,
      });

      if (res?.slug) {
        return mapProtoToPaste(res);
      }
    } catch {
      // Fallback to HTTP
    }

    // 2. Fallback to HTTP REST Gateway
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

    // 3. Fallback to internal memory store
    return PasteStore.create(payload);
  }
}
