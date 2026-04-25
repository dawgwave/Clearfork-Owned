import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { createPodcastShowcase, getAllPodcastShowcases } from "@/lib/podcast-showcases";

export async function GET(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const search = searchParams.get("search") || undefined;
      const published_only = searchParams.get("published_only") === "true";
      const result = await getAllPodcastShowcases(
        { search, published_only },
        { page, limit },
      );
      return NextResponse.json({ success: true, ...result });
    } catch (e) {
      console.error("admin podcast-showcases GET", e);
      return NextResponse.json(
        { error: "Failed to fetch podcast showcases" },
        { status: 500 },
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const body = await request.json();
      if (
        !body.title?.trim() ||
        !body.image_url?.trim() ||
        !body.avatar_url?.trim() ||
        !body.listen_url?.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Title, image URL, avatar URL, and listen URL are required",
          },
          { status: 400 },
        );
      }
      const id = await createPodcastShowcase({
        public_slug: body.public_slug,
        title: body.title,
        excerpt: body.excerpt,
        image_url: body.image_url,
        avatar_url: body.avatar_url,
        author_name: body.author_name || "Host",
        author_subtitle: body.author_subtitle || "Podcast",
        listen_url: body.listen_url,
        audio_url: body.audio_url,
        is_published: body.is_published,
        sort_order: body.sort_order,
      });
      return NextResponse.json({ success: true, id, message: "Created" });
    } catch (e) {
      console.error("admin podcast-showcases POST", e);
      if (e instanceof Error && e.message.includes("already exists")) {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      return NextResponse.json(
        { error: "Failed to create podcast showcase" },
        { status: 500 },
      );
    }
  });
}
