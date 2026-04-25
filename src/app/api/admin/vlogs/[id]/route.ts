import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { getVlogById, updateVlog, deleteVlog, type VlogInput } from "@/lib/vlogs";
import { normalizeYouTubeId } from "@/lib/youtube-embed";

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
      const vlog = await getVlogById(n, true);
      if (!vlog) {
        return NextResponse.json({ error: "Vlog not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, vlog });
    } catch (e) {
      console.error("admin vlog GET", e);
      return NextResponse.json(
        { error: "Failed to fetch vlog" },
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
      const body = await request.json() as VlogInput & { video_embed_id?: string };
      const payload: Partial<VlogInput> = {};
      if (body.title !== undefined) payload.title = body.title;
      if (body.excerpt !== undefined) payload.excerpt = body.excerpt;
      if (body.image_url !== undefined) payload.image_url = body.image_url;
      if (body.author_name !== undefined) payload.author_name = body.author_name;
      if (body.author_subtitle !== undefined) payload.author_subtitle = body.author_subtitle;
      if (body.author_avatar_url !== undefined) payload.author_avatar_url = body.author_avatar_url;
      if (body.external_href !== undefined) payload.external_href = body.external_href;
      if (body.sort_order !== undefined) payload.sort_order = body.sort_order;
      if (body.is_published !== undefined) payload.is_published = body.is_published;
      if (body.video_embed_id != null) {
        const parsed = normalizeYouTubeId(String(body.video_embed_id));
        if (!parsed) {
          return NextResponse.json(
            { error: "Invalid YouTube video ID or URL" },
            { status: 400 },
          );
        }
        payload.video_embed_id = parsed;
      }
      await updateVlog(n, payload);
      const vlog = await getVlogById(n, true);
      return NextResponse.json({ success: true, vlog });
    } catch (e) {
      console.error("admin vlog PUT", e);
      if (e instanceof Error && e.message.includes("not found")) {
        return NextResponse.json({ error: e.message }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to update vlog" },
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
      const ok = await deleteVlog(n);
      if (!ok) {
        return NextResponse.json(
          { error: "Vlog not found or already deleted" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, message: "Deleted" });
    } catch (e) {
      console.error("admin vlog DELETE", e);
      return NextResponse.json(
        { error: "Failed to delete vlog" },
        { status: 500 },
      );
    }
  });
}
