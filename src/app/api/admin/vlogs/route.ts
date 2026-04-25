import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { getAllVlogs, createVlog } from "@/lib/vlogs";
import { normalizeYouTubeId } from "@/lib/youtube-embed";

export async function GET(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const search = searchParams.get("search") || undefined;
      const published_only = searchParams.get("published_only") === "true";

      const result = await getAllVlogs(
        { search, published_only },
        { page, limit },
      );
      return NextResponse.json({ success: true, ...result });
    } catch (e) {
      console.error("admin vlogs GET", e);
      return NextResponse.json(
        { error: "Failed to fetch vlogs" },
        { status: 500 },
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const body = await request.json() as {
        title?: string;
        video_embed_id?: string;
        excerpt?: string;
        image_url?: string;
        author_name?: string;
        author_subtitle?: string;
        author_avatar_url?: string;
        external_href?: string;
        is_published?: boolean;
        sort_order?: number;
      };
      const id = normalizeYouTubeId(String(body.video_embed_id || ""));
      if (!body.title?.trim() || !id) {
        return NextResponse.json(
          { error: "Title and a valid YouTube video ID or URL are required" },
          { status: 400 },
        );
      }
      const vlogId = await createVlog({
        title: body.title,
        excerpt: body.excerpt,
        video_embed_id: id,
        image_url: body.image_url,
        author_name: body.author_name,
        author_subtitle: body.author_subtitle,
        author_avatar_url: body.author_avatar_url,
        external_href: body.external_href,
        is_published: body.is_published,
        sort_order: body.sort_order,
      });
      return NextResponse.json({
        success: true,
        id: vlogId,
        message: "Vlog created",
      });
    } catch (e) {
      console.error("admin vlogs POST", e);
      return NextResponse.json(
        { error: "Failed to create vlog" },
        { status: 500 },
      );
    }
  });
}
