import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { extname, join, resolve, sep } from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function uploadRoot(): string {
  const env = process.env.UPLOAD_DIR?.trim();
  if (env) return env;
  return join(/* turbopackIgnore: true */ process.cwd(), "uploads");
}

function safeResolvedPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (segments.some((s) => s === ".." || s.includes("/") || s.includes("\\"))) {
    return null;
  }
  const base = resolve(uploadRoot());
  const full = resolve(base, ...segments);
  if (full !== base && !full.startsWith(base + sep)) {
    return null;
  }
  return full;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const fullPath = safeResolvedPath(segments);
  if (!fullPath || !existsSync(fullPath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const buf = await readFile(fullPath);
    const ext = extname(fullPath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
