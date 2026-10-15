import { type NextRequest, NextResponse } from "next/server";
import { PasteService } from "@/lib/paste-service";

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ slug: string }> },
) {
  const { slug } = await segmentData.params;
  const password =
    request.headers.get("X-Paste-Password") ||
    request.nextUrl.searchParams.get("password") ||
    undefined;

  const result = await PasteService.getPaste(slug, password);

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

  return NextResponse.json(result.paste, { status: 200 });
}
