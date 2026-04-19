import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug, recordBlogPostView } from '@/lib/blog';
import { getCurrentUser } from '@/lib/auth-middleware';

// GET /api/blogs/[slug] - Get single blog post by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const blogPost = await getBlogPostBySlug(slug, false); // Only published posts
    
    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Record view for analytics (optional, don't fail if it errors)
    try {
      const { user } = await getCurrentUser(request);
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await recordBlogPostView(
        blogPost.id,
        user?.id,
        clientIP,
        userAgent
      );
    } catch (viewError) {
      // Don't fail the request if view tracking fails
      console.error('Failed to record blog post view:', viewError);
    }
    
    return NextResponse.json({
      success: true,
      post: blogPost
    });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}