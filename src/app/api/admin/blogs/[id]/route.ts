import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/blog';

// GET /api/admin/blogs/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async (req) => {
    try {
      const { id } = await params;
      const blogPostId = parseInt(id);
      
      if (isNaN(blogPostId)) {
        return NextResponse.json(
          { error: 'Invalid blog post ID' },
          { status: 400 }
        );
      }
      
      const blogPost = await getBlogPostById(blogPostId, true); // Include unpublished
      
      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        post: blogPost
      });
    } catch (error) {
      console.error('Admin blog fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/admin/blogs/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async (req) => {
    try {
      const { id } = await params;
      const blogPostId = parseInt(id);
      const updateData = await request.json();
      
      if (isNaN(blogPostId)) {
        return NextResponse.json(
          { error: 'Invalid blog post ID' },
          { status: 400 }
        );
      }
      
      const success = await updateBlogPost(blogPostId, updateData);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update blog post' },
          { status: 500 }
        );
      }
      
      // Return updated post
      const updatedPost = await getBlogPostById(blogPostId, true);
      
      return NextResponse.json({
        success: true,
        post: updatedPost,
        message: 'Blog post updated successfully'
      });
    } catch (error) {
      console.error('Blog update error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          );
        }
        if (error.message.includes('already exists')) {
          return NextResponse.json(
            { error: error.message },
            { status: 409 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/admin/blogs/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async (req) => {
    try {
      const { id } = await params;
      const blogPostId = parseInt(id);
      
      if (isNaN(blogPostId)) {
        return NextResponse.json(
          { error: 'Invalid blog post ID' },
          { status: 400 }
        );
      }
      
      const success = await deleteBlogPost(blogPostId);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Blog post not found or already deleted' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Blog deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }
  });
}