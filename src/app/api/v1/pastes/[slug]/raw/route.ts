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
    return new NextResponse("404: Paste not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (result.status === 410) {
    return new NextResponse("410: Paste has expired", {
      status: 410,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (result.status === 401) {
    return new NextResponse(
      "401: Unauthorized - Password required or incorrect",
      {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  return new NextResponse(result.paste?.content ?? "", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60",
    },
  });
}
