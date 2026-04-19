"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusIcon,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export default function AdminBlogsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading_posts, setLoadingPosts] = useState(true);
  const [search, setSearch] = useState('');
  const [showUnpublished, setShowUnpublished] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin/blogs");
    } else if (!loading && user && !user.roles.some(role => role.name === 'admin')) {
      router.push("/");
    }
  }, [loading, user, router]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        published_only: showUnpublished ? 'false' : 'true'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/admin/blogs?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const deleteBlogPost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      // Refresh the posts list
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete the blog post. Please try again.');
    }
  };

  useEffect(() => {
    if (user && user.roles.some(role => role.name === 'admin')) {
      fetchPosts();
    }
  }, [user, search, showUnpublished]);

  if (loading || !user || !user.roles.some(role => role.name === 'admin')) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          { label: "Blog Posts", href: "/admin/blogs" },
        ]}
      />
      
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Blog Posts</h1>
              <Badge variant="secondary">{posts.length} posts</Badge>
            </div>
            <p className="text-muted-foreground">
              Create and manage blog posts for your website.
            </p>
          </div>
          
          <Button asChild>
            <Link href="/admin/blogs/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts..."
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
                    <EyeOff className="h-4 w-4 mr-2" />
                    Show All
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Published Only
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {loading_posts ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline">{post.category}</Badge>
                        )}
                      </div>
                      
                      {post.excerpt && (
                        <CardDescription className="line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>By {post.author_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>
                          {post.is_published && post.published_at
                            ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                            : `Created ${new Date(post.created_at).toLocaleDateString()}`
                          }
                        </span>
                        <span>•</span>
                        <span>Slug: /{post.slug}</span>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {post.is_published && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/blogs/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteBlogPost(post.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
            
            {posts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No blog posts found</h3>
                  <p className="text-muted-foreground mb-6">
                    {search 
                      ? "No posts match your search criteria."
                      : "Get started by creating your first blog post."
                    }
                  </p>
                  <Button asChild>
                    <Link href="/admin/blogs/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Post
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