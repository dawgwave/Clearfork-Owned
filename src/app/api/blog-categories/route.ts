import { NextRequest, NextResponse } from 'next/server';
import { getBlogCategories } from '@/lib/blog';

// GET /api/blog-categories - Get all blog categories with post counts
export async function GET(request: NextRequest) {
  try {
    const categories = await getBlogCategories();
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Blog categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}