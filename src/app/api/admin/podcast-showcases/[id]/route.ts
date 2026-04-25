import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  deletePodcastShowcase,
  getShowcaseById,
  updatePodcastShowcase,
} from "@/lib/podcast-showcases";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireAdmin(request, async () => {
    try {
      const { id } = await params;
      const n = parseInt(id, 10);
      if (Number.isNaN(n)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      const row = await getShowcaseById(n, true);
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, showcase: row });
    } catch (e) {
      console.error("admin podcast-showcase GET", e);
      return NextResponse.json(
        { error: "Failed to load" },
        { status: 500 },
      );
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireAdmin(request, async () => {
    try {
      const { id } = await params;
      const n = parseInt(id, 10);
      if (Number.isNaN(n)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      const body = await request.json();
      await updatePodcastShowcase(n, {
        public_slug: body.public_slug,
        title: body.title,
        excerpt: body.excerpt,
        image_url: body.image_url,
        avatar_url: body.avatar_url,
        author_name: body.author_name,
        author_subtitle: body.author_subtitle,
        listen_url: body.listen_url,
        audio_url: body.audio_url,
        is_published: body.is_published,
        sort_order: body.sort_order,
      });
      const showcase = await getShowcaseById(n, true);
      return NextResponse.json({ success: true, showcase });
    } catch (e) {
      console.error("admin podcast-showcase PUT", e);
      if (e instanceof Error) {
        if (e.message.includes("not found")) {
          return NextResponse.json({ error: e.message }, { status: 404 });
        }
        if (e.message.includes("already exists")) {
          return NextResponse.json({ error: e.message }, { status: 409 });
        }
      }
      return NextResponse.json(
        { error: "Failed to update" },
        { status: 500 },
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireAdmin(request, async () => {
    try {
      const { id } = await params;
      const n = parseInt(id, 10);
      if (Number.isNaN(n)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      const ok = await deletePodcastShowcase(n);
      if (!ok) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error("admin podcast-showcase DELETE", e);
      return NextResponse.json(
        { error: "Failed to delete" },
        { status: 500 },
      );
    }
  });
}
