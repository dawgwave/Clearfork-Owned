"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Edit, Trash2, Eye, EyeOff, Search, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { VlogEntry } from "@/types/vlog";
import { youtubeThumbFromId } from "@/lib/youtube-embed";

export default function AdminVlogsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vlogs, setVlogs] = useState<VlogEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [showUnpublished, setShowUnpublished] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin/vlogs");
    } else if (!loading && user && !user.roles.some((r) => r.name === "admin")) {
      router.push("/");
    }
  }, [loading, user, router]);

  const fetchVlogs = async () => {
    try {
      setLoadingList(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        published_only: showUnpublished ? "false" : "true",
      });
      if (search) params.append("search", search);
      const res = await fetch(`/api/admin/vlogs?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vlogs");
      const data = await res.json();
      setVlogs(data.vlogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this vlog entry? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/vlogs/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      fetchVlogs();
    } catch {
      alert("Failed to delete. Try again.");
    }
  };

  useEffect(() => {
    if (user && user.roles.some((r) => r.name === "admin")) fetchVlogs();
  }, [user, search, showUnpublished]);

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
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Vlogs", href: "/admin/vlogs" },
        ]}
      />
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Vlog (YouTube) entries</h1>
              <Badge variant="secondary">{vlogs.length} items</Badge>
            </div>
            <p className="text-muted-foreground">
              Create and manage videos shown on the home vlog column and the videos page.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/vlogs/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New vlog
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant={showUnpublished ? "default" : "outline"}
                onClick={() => setShowUnpublished(!showUnpublished)}
              >
                {showUnpublished ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show all
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Published only
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loadingList ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {vlogs.map((v) => {
              const thumb = v.image_url?.trim() || youtubeThumbFromId(v.video_embed_id);
              return (
                <Card key={v.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">{v.title}</CardTitle>
                          <Badge variant={v.is_published ? "default" : "secondary"}>
                            {v.is_published ? "Published" : "Draft"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Order {v.sort_order}</span>
                        </div>
                        {v.excerpt && (
                          <CardDescription className="line-clamp-2">{v.excerpt}</CardDescription>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                          YouTube: {v.video_embed_id} ·{" "}
                          {thumb.startsWith("http") ? "Custom / default thumb" : "Local image"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {v.is_published && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/videos" target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/vlogs/${v.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => remove(v.id)}
                          className="text-red-600 hover:border-red-300 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
            {vlogs.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No vlog entries</h3>
                  <p className="mb-6 text-muted-foreground">
                    {search ? "Nothing matches that search." : "Create a vlog to get started."}
                  </p>
                  <Button asChild>
                    <Link href="/admin/vlogs/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New vlog
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
