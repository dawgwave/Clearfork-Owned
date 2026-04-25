import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { getQuoteById, updateQuoteStatus, assignQuote, deleteQuoteRequest } from '@/lib/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async (req) => {
    try {
      const { id } = await params;
      const quoteId = parseInt(id);
      
      if (isNaN(quoteId)) {
        return NextResponse.json(
          { error: 'Invalid quote ID' },
          { status: 400 }
        );
      }
      
      const quote = await getQuoteById(quoteId, true); // Include personal data for admins
      
      if (!quote) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, quote });
    } catch (error) {
      console.error('Admin quote fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quote' },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async (req) => {
    try {
      const { id } = await params;
      const quoteId = parseInt(id);
      const { action, ...data } = await request.json();
      
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
      
      let success = false;
      
      switch (action) {
        case 'update_status':
          if (!data.status) {
            return NextResponse.json(
              { error: 'Status is required' },
              { status: 400 }
            );
          }
          success = await updateQuoteStatus(
            quoteId,
            data.status,
            req.user.id,
            data.notes
          );
          break;
          
        case 'assign_agent':
          if (!data.agent_id) {
            return NextResponse.json(
              { error: 'Agent ID is required' },
              { status: 400 }
            );
          }
          success = await assignQuote(
            quoteId,
            data.agent_id,
            req.user.id
          );
          break;
          
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update quote' },
          { status: 500 }
        );
      }
      
      // Return updated quote
      const updatedQuote = await getQuoteById(quoteId, true);
      
      return NextResponse.json({
        success: true,
        quote: updatedQuote
      });
    } catch (error) {
      console.error('Admin quote update error:', error);
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAdmin(request, async () => {
    try {
      const { id } = await params;
      const quoteId = parseInt(id, 10);

      if (Number.isNaN(quoteId)) {
        return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
      }

      const ok = await deleteQuoteRequest(quoteId);
      if (!ok) {
        return NextResponse.json(
          { error: 'Quote not found or could not be deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Admin quote delete error:', error);
      return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
    }
  });
}