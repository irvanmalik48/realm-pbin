import { type NextRequest, NextResponse } from "next/server";
import { PasteService } from "@/lib/paste-service";
import type { CreatePastePayload } from "@/lib/types";

// In-memory rate limiting: 20 paste creations per minute per client IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_PASTES_PER_WINDOW = 20;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Periodically clean up expired entries when map gets large
  if (rateLimitMap.size > 5000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_PASTES_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const syntax = searchParams.get("syntax") || undefined;
  const limit = searchParams.has("limit")
    ? Number(searchParams.get("limit"))
    : undefined;
  const offset = searchParams.has("offset")
    ? Number(searchParams.get("offset"))
    : undefined;

  const result = await PasteService.listPastes({
    search,
    syntax,
    limit,
    offset,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(clientIp);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many pastes created. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter ?? 60),
        },
      },
    );
  }

  try {
    const body: CreatePastePayload = await request.json();

    if (
      !body.content ||
      typeof body.content !== "string" ||
      body.content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Content is required and cannot be empty" },
        { status: 400 },
      );
    }

    const paste = await PasteService.createPaste(body);
    return NextResponse.json(paste, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid JSON payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
