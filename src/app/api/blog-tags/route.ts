import { NextRequest, NextResponse } from 'next/server';
import { getBlogTags } from '@/lib/blog';

// GET /api/blog-tags - Get all blog tags with usage counts
export async function GET(request: NextRequest) {
  try {
    const tags = await getBlogTags();
    
    return NextResponse.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Blog tags fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog tags' },
      { status: 500 }
    );
  }
}