import { mkdir, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { getBlogUploadDir, publicUrlForBlogFile } from "@/lib/upload-paths";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Missing file field" }, { status: 400 });
      }

      const blob = file as File;
      const type = blob.type || "";
      const ext = MIME_TO_EXT[type];
      if (!ext) {
        return NextResponse.json(
          { error: "Allowed types: JPEG, PNG, WebP, GIF" },
          { status: 400 },
        );
      }

      const size = blob.size;
      if (size > MAX_BYTES) {
        return NextResponse.json(
          { error: "File too large (max 5 MB)" },
          { status: 400 },
        );
      }

      const buf = Buffer.from(await blob.arrayBuffer());
      const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
      const dir = getBlogUploadDir();
      await mkdir(dir, { recursive: true });
      await writeFile(`${dir}/${name}`, buf);

      const url = publicUrlForBlogFile(name);
      return NextResponse.json({ success: true, url });
    } catch (e) {
      console.error("[upload-image]", e);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  });
}
