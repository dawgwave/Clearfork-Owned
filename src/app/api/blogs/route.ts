import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

// GET /api/blogs - Get published blog posts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    
    const result = await getAllBlogPosts(
      {
        search,
        category,
        tag,
        published_only: true
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
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}