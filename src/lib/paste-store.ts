import crypto from "node:crypto";
import type { CreatePastePayload, Paste, PastesListResponse } from "./types";

const SLUG_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SLUG_LENGTH = 7;

export function generate7LetterSlug(): string {
  let result = "";
  const randomBytes = crypto.randomBytes(SLUG_LENGTH);
  for (let i = 0; i < SLUG_LENGTH; i++) {
    const byte = randomBytes[i] ?? 0;
    result += SLUG_LETTERS[byte % SLUG_LETTERS.length];
  }
  return result;
}

interface StoredPaste extends Paste {
  password_hash?: string | null;
}

// Global in-memory storage to survive hot reloads in development
const globalForPastes = globalThis as unknown as {
  __pasteStore?: Map<string, StoredPaste>;
};

function initStore(): Map<string, StoredPaste> {
  if (globalForPastes.__pasteStore) {
    return globalForPastes.__pasteStore;
  }

  const store = new Map<string, StoredPaste>();

  // Initial seed pastes
  const seeds: StoredPaste[] = [
    {
      id: "7b35f62e-3d84-4b53-a5c3-2d2745cfd39c",
      slug: "K9xQm2v",
      title: "Nginx Reverse Proxy & HTTP/3 Config",
      syntax: "nginx",
      is_public: true,
      is_encrypted: false,
      views: 42,
      size: 582,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      content: `server {
    listen 443 quic reuseport;
    listen 443 ssl;
    server_name paste.realm.dev;

    ssl_certificate /etc/letsencrypt/live/realm.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/realm.dev/privkey.pem;
    ssl_protocols TLSv1.3;

    # HTTP/3 QUIC Header
    add_header Alt-Svc 'h3=":443"; ma=86400';
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`,
    },
    {
      id: "9c45a71f-5e82-4f11-b1e2-6d3389ac3f01",
      slug: "X7wLk9p",
      title: "Go High-Performance Rate Limiter",
      syntax: "go",
      is_public: true,
      is_encrypted: false,
      views: 89,
      size: 724,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      content: `package ratelimit

import (
	"sync"
	"time"
)

type TokenBucket struct {
	rate       float64
	capacity   float64
	tokens     float64
	lastRefill time.Time
	mu         sync.Mutex
}

func NewTokenBucket(rate, capacity float64) *TokenBucket {
	return &TokenBucket{
		rate:       rate,
		capacity:   capacity,
		tokens:     capacity,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.lastRefill = now

	tb.tokens = min(tb.capacity, tb.tokens+elapsed*tb.rate)

	if tb.tokens >= 1.0 {
		tb.tokens -= 1.0
		return true
	}
	return false
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}`,
    },
    {
      id: "1a89c20d-88f3-4672-91ef-00cd77ea53bc",
      slug: "M4tRy1a",
      title: "React 19 View Transition + Suspense Hook",
      syntax: "typescript",
      is_public: true,
      is_encrypted: false,
      views: 124,
      size: 615,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      content: `import { ViewTransition } from 'react';
import { Suspense } from 'react';

interface TransitionProps {
  slug: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function ContentTransition({ slug, children, fallback }: TransitionProps) {
  return (
    <Suspense
      fallback={
        <ViewTransition exit="slide-down" default="none">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition
        key={slug}
        name={\`content-\${slug}\`}
        enter="slide-up"
        share="auto"
        default="none"
      >
        {children}
      </ViewTransition>
    </Suspense>
  );
}`,
    },
  ];

  for (const seed of seeds) {
    store.set(seed.slug, seed);
  }

  globalForPastes.__pasteStore = store;
  return store;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function calculateTTL(ttl?: string): Date | null {
  if (!ttl || ttl === "never") return null;
  const now = Date.now();
  switch (ttl) {
    case "10m":
      return new Date(now + 10 * 60 * 1000);
    case "1h":
      return new Date(now + 60 * 60 * 1000);
    case "1d":
      return new Date(now + 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export class PasteStore {
  private static store = initStore();

  static list(options?: {
    search?: string;
    syntax?: string;
    isPublicOnly?: boolean;
    limit?: number;
    offset?: number;
  }): PastesListResponse {
    const now = new Date();
    const search = options?.search?.toLowerCase().trim();
    const syntax = options?.syntax?.toLowerCase().trim();
    const isPublicOnly = options?.isPublicOnly ?? true;
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const allPastes = Array.from(PasteStore.store.values());

    const filtered = allPastes.filter((p) => {
      // Check expiration
      if (p.expires_at && new Date(p.expires_at) < now) {
        return false;
      }
      if (isPublicOnly && !p.is_public) {
        return false;
      }
      if (syntax && p.syntax.toLowerCase() !== syntax) {
        return false;
      }
      if (search) {
        const titleMatch = p.title.toLowerCase().includes(search);
        const slugMatch = p.slug.toLowerCase().includes(search);
        if (!titleMatch && !slugMatch) return false;
      }
      return true;
    });

    // Sort newest first
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const paginated = filtered.slice(offset, offset + limit);

    return {
      total: filtered.length,
      pastes: paginated.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.is_encrypted ? "" : p.content,
        syntax: p.syntax,
        is_public: p.is_public,
        is_encrypted: p.is_encrypted,
        views: p.views,
        size: p.size,
        created_at: p.created_at,
        updated_at: p.updated_at,
        expires_at: p.expires_at,
      })),
    };
  }

  static get(
    slug: string,
    password?: string,
  ): { status: 200 | 401 | 404 | 410; paste: Paste | null } {
    const item = PasteStore.store.get(slug);
    if (!item) {
      return { status: 404, paste: null };
    }

    const now = new Date();
    if (item.expires_at && new Date(item.expires_at) < now) {
      return { status: 410, paste: null };
    }

    if (item.is_encrypted) {
      if (!password) {
        return {
          status: 200,
          paste: {
            ...item,
            content: "",
          },
        };
      }

      const inputHash = hashPassword(password);
      if (inputHash !== item.password_hash) {
        return { status: 401, paste: null };
      }
    }

    // Increment view count
    item.views++;

    return {
      status: 200,
      paste: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        content: item.content,
        syntax: item.syntax,
        is_public: item.is_public,
        is_encrypted: item.is_encrypted,
        views: item.views,
        size: item.size,
        created_at: item.created_at,
        updated_at: item.updated_at,
        expires_at: item.expires_at,
      },
    };
  }

  static create(payload: CreatePastePayload): Paste {
    let slug = generate7LetterSlug();
    while (PasteStore.store.has(slug)) {
      slug = generate7LetterSlug();
    }

    const content = payload.content.trim();
    const size = new TextEncoder().encode(content).length;
    const now = new Date().toISOString();
    const expiresAt = calculateTTL(payload.ttl);

    const isEncrypted = Boolean(
      payload.password && payload.password.trim().length > 0,
    );
    const passwordHash =
      isEncrypted && payload.password
        ? hashPassword(payload.password.trim())
        : null;

    const newPaste: StoredPaste = {
      id: crypto.randomUUID(),
      slug,
      title: payload.title?.trim() || "Untitled Paste",
      content,
      syntax: payload.syntax || "plaintext",
      is_public: payload.is_public ?? true,
      is_encrypted: isEncrypted,
      password_hash: passwordHash,
      views: 0,
      size,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    };

    PasteStore.store.set(slug, newPaste);

    return {
      id: newPaste.id,
      slug: newPaste.slug,
      title: newPaste.title,
      content: newPaste.content,
      syntax: newPaste.syntax,
      is_public: newPaste.is_public,
      is_encrypted: newPaste.is_encrypted,
      views: newPaste.views,
      size: newPaste.size,
      created_at: newPaste.created_at,
      updated_at: newPaste.updated_at,
      expires_at: newPaste.expires_at,
    };
  }
}
