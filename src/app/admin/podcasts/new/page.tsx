"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Headphones, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogFeaturedImageField } from "@/components/admin/blog-featured-image-field";

const initial = {
  public_slug: "",
  title: "",
  excerpt: "",
  image_url: "/images/group photo 1 (1)_1761008519000.jpg",
  avatar_url: "/images/david hargrove head shot_1761004385331.jpg",
  author_name: "",
  author_subtitle: "",
  listen_url: "",
  audio_url: "",
  sort_order: 0,
  is_published: true,
};

export default function NewPodcastShowcasePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState(initial);

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirectTo=/admin/podcasts");
    else if (!loading && user && !user.roles.some((r) => r.name === "admin")) router.push("/");
  }, [loading, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.image_url.trim() || !f.avatar_url.trim() || !f.listen_url.trim()) {
      alert("Title, cover image, avatar, and listen URL are required.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/admin/podcast-showcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...f,
          public_slug: f.public_slug.trim() || undefined,
          sort_order: Number(f.sort_order) || 0,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to create");
      router.push("/admin/podcasts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || !user.roles.some((r) => r.name === "admin")) {
    return (
      <PageShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
          { label: "New", href: "/admin/podcasts/new" },
        ]}
      />
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">New podcast card</h1>
            </div>
            <p className="text-muted-foreground">Curated episode or show (Apple/Spotify link, optional direct MP3).</p>
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
                      placeholder="e.g. cyber-101"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Used as the public id; leave blank to use the numeric id.</p>
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
                    <Label htmlFor="listen">Listen / subscribe URL *</Label>
                    <Input
                      id="listen"
                      value={f.listen_url}
                      onChange={(e) => setF((p) => ({ ...p, listen_url: e.target.value }))}
                      placeholder="https://open.spotify.com/... or /podcast/…"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audio">Direct MP3 URL (optional, enables player)</Label>
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
                      placeholder="e.g. David Hargrove"
                    />
                  </div>
                  <div>
                    <Label htmlFor="as">Subtitle *</Label>
                    <Input
                      id="as"
                      value={f.author_subtitle}
                      onChange={(e) => setF((p) => ({ ...p, author_subtitle: e.target.value }))}
                      placeholder="e.g. Owner"
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
                    <p className="mt-1 text-xs text-muted-foreground">Lower first.</p>
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Create
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
