import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { getAllBlogPosts, createBlogPost } from '@/lib/blog';

// GET /api/admin/blogs - Get all blog posts (including unpublished)
export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || undefined;
      const category = searchParams.get('category') || undefined;
      const published_only = searchParams.get('published_only') === 'true';
      
      const result = await getAllBlogPosts(
        {
          search,
          category,
          published_only
        },
        {
          page,
          limit
        }
      );
      
      return NextResponse.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Admin blog fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      );
    }
  });
}

// POST /api/admin/blogs - Create new blog post
export async function POST(request: NextRequest) {
  return requireAdmin(request, async (req) => {
    try {
      const postData = await request.json();
      
      // Validate required fields
      if (!postData.title || !postData.content) {
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }
      
      // Set author_id to current user if not provided
      if (!postData.author_id && req.user) {
        postData.author_id = req.user.id;
      }
      
      const blogPostId = await createBlogPost(postData);
      
      return NextResponse.json({
        success: true,
        id: blogPostId,
        message: 'Blog post created successfully'
      });
    } catch (error) {
      console.error('Blog creation error:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      );
    }
  });
}