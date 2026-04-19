import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { getAllQuotes } from '@/lib/quotes';

export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const options = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        status: searchParams.get('status') || undefined,
        priority: searchParams.get('priority') || undefined,
        search: searchParams.get('search') || undefined,
        assigned_agent_id: searchParams.get('assigned_agent_id') ? 
          parseInt(searchParams.get('assigned_agent_id')!) : undefined,
      };
      
      const result = await getAllQuotes(options);
      
      return NextResponse.json({
        success: true,
        ...result,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / options.limit),
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      console.error('Admin quotes fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      );
    }
  });
}