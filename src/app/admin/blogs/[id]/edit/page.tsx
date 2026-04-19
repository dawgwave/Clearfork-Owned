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
import { 
  ArrowLeft,
  Save,
  Eye,
  FileText
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags: string[];
  featured_image_url?: string;
  meta_description?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export default function EditBlogPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading_post, setLoadingPost] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured_image_url: '',
    meta_description: '',
    is_published: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin/blogs");
    } else if (!loading && user && !user.roles.some(role => role.name === 'admin')) {
      router.push("/");
    }
  }, [loading, user, router]);

  // Fetch existing post data
  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      
      const response = await fetch(`/api/admin/blogs/${params.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      const postData = data.post;
      
      setPost(postData);
      setFormData({
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        category: postData.category || '',
        tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : '',
        featured_image_url: postData.featured_image_url || '',
        meta_description: postData.meta_description || '',
        is_published: postData.is_published || false
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
      router.push('/admin/blogs');
    } finally {
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.some(role => role.name === 'admin') && params.id) {
      fetchPost();
    }
  }, [user, params.id]);

  const handleSubmit = async (e: React.FormEvent, publishNow: boolean = false) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required.');
      return;
    }
    
    try {
      setSaving(true);
      
      const postData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        is_published: publishNow || formData.is_published
      };
      
      const response = await fetch(`/api/admin/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog post');
      }
      
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert(`Failed to update blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loading_post || !user || !user.roles.some(role => role.name === 'admin')) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  if (!post) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <Button asChild>
            <Link href="/admin/blogs">Back to Posts</Link>
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
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Blog Posts", href: "/admin/blogs" },
          { label: post.title, href: `/admin/blogs/${post.id}/edit` },
        ]}
      />
      
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit Blog Post</h1>
              <Badge variant={post.is_published ? "default" : "secondary"}>
                {post.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date(post.updated_at).toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/blogs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
            
            {post.is_published && (
              <Button variant="outline" asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Live
                </Link>
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Slug */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter post title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the post..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Content *</CardTitle>
                  <CardDescription>
                    Write your blog post content in Markdown format.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here..."
                    className="min-h-[400px]"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    />
                    <Label htmlFor="is_published">Published</Label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    
                    {!formData.is_published && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => handleSubmit(e as any, true)}
                        disabled={saving}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publish Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Categories & Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Insurance Tips"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SEO & Media */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="featured_image_url">Featured Image URL</Label>
                    <Input
                      id="featured_image_url"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description for search engines..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Post Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(post.updated_at).toLocaleDateString()}
                  </div>
                  {post.published_at && (
                    <div>
                      <span className="font-medium">Published:</span> {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Author:</span> {post.author_name || 'Unknown'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
}