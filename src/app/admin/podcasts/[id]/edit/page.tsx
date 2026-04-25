"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Headphones, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogFeaturedImageField } from "@/components/admin/blog-featured-image-field";
import type { PodcastShowcaseRow } from "@/types/podcast-showcase";

export default function EditPodcastShowcasePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [row, setRow] = useState<PodcastShowcaseRow | null>(null);
  const [loadingRow, setLoadingRow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    public_slug: "",
    title: "",
    excerpt: "",
    image_url: "",
    avatar_url: "",
    author_name: "",
    author_subtitle: "",
    listen_url: "",
    audio_url: "",
    sort_order: 0,
    is_published: true,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirectTo=/admin/podcasts");
    else if (!loading && user && !user.roles.some((r) => r.name === "admin")) router.push("/");
  }, [loading, user, router]);

  const load = async () => {
    try {
      setLoadingRow(true);
      const res = await fetch(`/api/admin/podcast-showcases/${params.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("load");
      const d = await res.json();
      const s: PodcastShowcaseRow = d.showcase;
      setRow(s);
      setF({
        public_slug: s.public_slug || "",
        title: s.title,
        excerpt: s.excerpt || "",
        image_url: s.image_url,
        avatar_url: s.avatar_url,
        author_name: s.author_name,
        author_subtitle: s.author_subtitle,
        listen_url: s.listen_url,
        audio_url: s.audio_url || "",
        sort_order: s.sort_order,
        is_published: Boolean(s.is_published),
      });
    } catch {
      router.push("/admin/podcasts");
    } finally {
      setLoadingRow(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.some((r) => r.name === "admin") && params.id) void load();
  }, [user, params.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.image_url.trim() || !f.avatar_url.trim() || !f.listen_url.trim()) {
      alert("Title, cover, avatar, and listen URL are required.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/podcast-showcases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          public_slug: f.public_slug.trim() || null,
          title: f.title,
          excerpt: f.excerpt,
          image_url: f.image_url,
          avatar_url: f.avatar_url,
          author_name: f.author_name,
          author_subtitle: f.author_subtitle,
          listen_url: f.listen_url,
          audio_url: f.audio_url,
          is_published: f.is_published,
          sort_order: Number(f.sort_order) || 0,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Update failed");
      router.push("/admin/podcasts");
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
            <Link href="/admin/podcasts">Back</Link>
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
          { label: "Podcasts", href: "/admin/podcasts" },
          { label: f.title, href: `/admin/podcasts/${row.id}/edit` },
        ]}
      />
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit podcast card</h1>
              <Badge variant={f.is_published ? "default" : "secondary"}>
                {f.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">ID {row.id}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/podcasts">
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
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ps">Public slug (optional, unique)</Label>
                    <Input
                      id="ps"
                      value={f.public_slug}
                      onChange={(e) => setF((p) => ({ ...p, public_slug: e.target.value }))}
                    />
                  </div>
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
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      rows={4}
                      value={f.excerpt}
                      onChange={(e) => setF((p) => ({ ...p, excerpt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Cover image *</Label>
                    <BlogFeaturedImageField
                      value={f.image_url}
                      onChange={(url) => setF((p) => ({ ...p, image_url: url }))}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label>Avatar *</Label>
                    <BlogFeaturedImageField
                      value={f.avatar_url}
                      onChange={(url) => setF((p) => ({ ...p, avatar_url: url }))}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Listen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="listen">Listen URL *</Label>
                    <Input
                      id="listen"
                      value={f.listen_url}
                      onChange={(e) => setF((p) => ({ ...p, listen_url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="audio">MP3 (optional)</Label>
                    <Input
                      id="audio"
                      value={f.audio_url}
                      onChange={(e) => setF((p) => ({ ...p, audio_url: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Byline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="an">Author name *</Label>
                    <Input
                      id="an"
                      value={f.author_name}
                      onChange={(e) => setF((p) => ({ ...p, author_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="as">Subtitle *</Label>
                    <Input
                      id="as"
                      value={f.author_subtitle}
                      onChange={(e) => setF((p) => ({ ...p, author_subtitle: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
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
