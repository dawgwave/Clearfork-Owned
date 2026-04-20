import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getQuoteById } from '@/lib/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(request, async (req) => {
    try {
      const { id } = await params;
      const quoteId = parseInt(id);
      
      if (isNaN(quoteId)) {
        return NextResponse.json(
          { error: 'Invalid quote ID' },
          { status: 400 }
        );
      }
      
      if (!req.user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }
      
      const quote = await getQuoteById(quoteId, false); // Don't include sensitive personal data
      
      if (!quote) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      
      // Ensure user owns this quote or is an admin
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (!isAdmin && quote.user_id !== req.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      return NextResponse.json({ success: true, quote });
    } catch (error) {
      console.error('Quote fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quote' },
        { status: 500 }
      );
    }
  });
}