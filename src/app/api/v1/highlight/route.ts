import { type NextRequest, NextResponse } from "next/server";
import { highlightCodeToLines } from "@/lib/syntax-highlighter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;
    const syntax = body.syntax || "plaintext";

    if (typeof code !== "string") {
      return NextResponse.json(
        { error: "Code content must be a string" },
        { status: 400 },
      );
    }

    const lines = await highlightCodeToLines(code, syntax);
    return NextResponse.json({ lines }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to highlight code" },
      { status: 500 },
    );
  }
}
