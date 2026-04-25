"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, PlusIcon, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PodcastShowcaseRow } from "@/types/podcast-showcase";

export default function AdminPodcastsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<PodcastShowcaseRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [showUnpublished, setShowUnpublished] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin/podcasts");
    } else if (!loading && user && !user.roles.some((r) => r.name === "admin")) {
      router.push("/");
    }
  }, [loading, user, router]);

  const load = async () => {
    try {
      setLoadingList(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        published_only: showUnpublished ? "false" : "true",
      });
      if (search) params.append("search", search);
      const res = await fetch(`/api/admin/podcast-showcases?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("fetch");
      const d = await res.json();
      setRows(d.showcases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.some((r) => r.name === "admin")) void load();
  }, [user, search, showUnpublished]);

  const remove = async (id: number) => {
    if (!confirm("Delete this podcast card? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/podcast-showcases/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete");
      void load();
    } catch {
      alert("Delete failed");
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
          { label: "Podcasts (curated)", href: "/admin/podcasts" },
        ]}
      />
      <div className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Curated podcast cards</h1>
              <Badge variant="secondary">{rows.length} items</Badge>
            </div>
            <p className="text-muted-foreground">
              Featured shows on the podcast page (alongside RSS episodes). RSS feeds are still
              configured in the environment, not here.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/podcasts/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New card
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
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
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
            {rows.map((r) => (
              <Card key={r.id} className="hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{r.title}</CardTitle>
                        <Badge variant={r.is_published ? "default" : "secondary"}>
                          {r.is_published ? "Published" : "Draft"}
                        </Badge>
                        {r.public_slug && (
                          <Badge variant="outline" className="text-xs">
                            {r.public_slug}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">order {r.sort_order}</span>
                      </div>
                      {r.excerpt && <CardDescription className="line-clamp-2">{r.excerpt}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                      {r.is_published && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/podcast" target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/podcasts/${r.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => remove(r.id)}
                        className="text-red-600 hover:border-red-300 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {rows.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Headphones className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No cards yet</h3>
                  <p className="mb-6 text-muted-foreground">Create a curated podcast card for the site.</p>
                  <Button asChild>
                    <Link href="/admin/podcasts/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New card
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
