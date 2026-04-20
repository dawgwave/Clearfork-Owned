import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getUserQuotes } from '@/lib/quotes';

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req) => {
    try {
      if (!req.user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }
      
      const quotes = await getUserQuotes(req.user.id);
      
      return NextResponse.json({
        success: true,
        quotes
      });
    } catch (error) {
      console.error('User quotes fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      );
    }
  });
}