import { type NextRequest, NextResponse } from "next/server";
import { resolveSlugAndSyntaxOverride } from "@/lib/language-detector";
import { PasteService } from "@/lib/paste-service";

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ slug: string }> },
) {
  const { slug: rawSlug } = await segmentData.params;
  const { baseSlug, syntaxOverride } = resolveSlugAndSyntaxOverride(rawSlug);
  const password =
    request.headers.get("X-Paste-Password") ||
    request.nextUrl.searchParams.get("password") ||
    undefined;

  let result = await PasteService.getPaste(baseSlug, password);

  if (result.status === 404 && baseSlug !== rawSlug) {
    result = await PasteService.getPaste(rawSlug, password);
  }

  if (result.status === 404) {
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  if (result.status === 410) {
    return NextResponse.json({ error: "Paste has expired" }, { status: 410 });
  }

  if (result.status === 401) {
    return NextResponse.json(
      {
        error:
          "Unauthorized: Invalid or missing passphrase for encrypted paste",
      },
      { status: 401 },
    );
  }

  const paste = result.paste
    ? {
        ...result.paste,
        ...(syntaxOverride ? { syntax: syntaxOverride } : {}),
      }
    : null;

  return NextResponse.json(paste, { status: 200 });
}
