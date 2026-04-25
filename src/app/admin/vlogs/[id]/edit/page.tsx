"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Video } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogFeaturedImageField } from "@/components/admin/blog-featured-image-field";
import { normalizeYouTubeId } from "@/lib/youtube-embed";
import type { VlogEntry } from "@/types/vlog";

export default function EditVlogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [row, setRow] = useState<VlogEntry | null>(null);
  const [loadingRow, setLoadingRow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    title: "",
    video_embed_id: "",
    excerpt: "",
    image_url: "",
    author_name: "",
    author_subtitle: "",
    author_avatar_url: "",
    external_href: "",
    sort_order: 0,
    is_published: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirectTo=/admin/vlogs");
    else if (!loading && user && !user.roles.some((r) => r.name === "admin")) router.push("/");
  }, [loading, user, router]);

  const load = async () => {
    try {
      setLoadingRow(true);
      const res = await fetch(`/api/admin/vlogs/${params.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("load");
      const d = await res.json();
      const v: VlogEntry = d.vlog;
      setRow(v);
      setF({
        title: v.title,
        video_embed_id: v.video_embed_id,
        excerpt: v.excerpt || "",
        image_url: v.image_url || "",
        author_name: v.author_name,
        author_subtitle: v.author_subtitle,
        author_avatar_url: v.author_avatar_url,
        external_href: v.external_href || "",
        sort_order: v.sort_order,
        is_published: Boolean(v.is_published),
      });
    } catch {
      router.push("/admin/vlogs");
    } finally {
      setLoadingRow(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.some((r) => r.name === "admin") && params.id) void load();
  }, [user, params.id]);

  const onVideoBlur = () => {
    const n = normalizeYouTubeId(f.video_embed_id);
    if (n) setF((p) => ({ ...p, video_embed_id: n }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = normalizeYouTubeId(f.video_embed_id);
    if (!f.title.trim() || !id) {
      alert("Title and a valid YouTube video ID or URL are required.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/vlogs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...f,
          video_embed_id: id,
          sort_order: Number(f.sort_order) || 0,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Update failed");
      router.push("/admin/vlogs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingRow || !user || !user.roles.some((r) => r.name === "admin")) {
    return (
      <PageShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </PageShell>
    );
  }

  if (!row) {
    return (
      <PageShell>
        <div className="py-12 text-center">
          <p className="mb-4">Not found</p>
          <Button asChild>
            <Link href="/admin/vlogs">Back</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Vlogs", href: "/admin/vlogs" },
          { label: f.title, href: `/admin/vlogs/${row.id}/edit` },
        ]}
      />
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit vlog</h1>
              <Badge variant={f.is_published ? "default" : "secondary"}>
                {f.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">ID {row.id}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/vlogs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={f.title}
                      onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="video">YouTube video ID or full URL *</Label>
                    <Input
                      id="video"
                      value={f.video_embed_id}
                      onChange={(e) => setF((p) => ({ ...p, video_embed_id: e.target.value }))}
                      onBlur={onVideoBlur}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      rows={3}
                      value={f.excerpt}
                      onChange={(e) => setF((p) => ({ ...p, excerpt: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Presentation</CardTitle>
                  <CardDescription>Optional thumbnail and author line.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="image_url">Thumbnail image URL (optional)</Label>
                    <Input
                      id="image_url"
                      value={f.image_url}
                      onChange={(e) => setF((p) => ({ ...p, image_url: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="an">Author name</Label>
                      <Input
                        id="an"
                        value={f.author_name}
                        onChange={(e) => setF((p) => ({ ...p, author_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="asub">Author line</Label>
                      <Input
                        id="asub"
                        value={f.author_subtitle}
                        onChange={(e) => setF((p) => ({ ...p, author_subtitle: e.target.value }))}
                      />
                    </div>
                  </div>
                  <BlogFeaturedImageField
                    value={f.author_avatar_url}
                    onChange={(url) => setF((p) => ({ ...p, author_avatar_url: url }))}
                    disabled={saving}
                  />
                  <div>
                    <Label htmlFor="href">External watch link (optional)</Label>
                    <Input
                      id="href"
                      value={f.external_href}
                      onChange={(e) => setF((p) => ({ ...p, external_href: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pub"
                      checked={f.is_published}
                      onChange={(e) => setF((p) => ({ ...p, is_published: e.target.checked }))}
                    />
                    <Label htmlFor="pub">Published</Label>
                  </div>
                  <div>
                    <Label htmlFor="ord">Sort order</Label>
                    <Input
                      id="ord"
                      type="number"
                      value={f.sort_order}
                      onChange={(e) => setF((p) => ({ ...p, sort_order: +e.target.value }))}
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
