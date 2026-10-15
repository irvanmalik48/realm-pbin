import { type NextRequest, NextResponse } from "next/server";
import { PasteService } from "@/lib/paste-service";
import type { CreatePastePayload } from "@/lib/types";

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
