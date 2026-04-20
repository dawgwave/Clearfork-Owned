import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getQuoteById, getQuoteChat, getChatMessages, sendChatMessage } from '@/lib/quotes';
import { jsonStringifySafe } from '@/lib/utils';

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new NextResponse(jsonStringifySafe(data), {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
}

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
      
      // Check if user has access to this quote
      const quote = await getQuoteById(quoteId, false);
      if (!quote) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (!isAdmin && quote.user_id !== req.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      // Get or create chat
      const chat = await getQuoteChat(quoteId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Failed to get chat' },
          { status: 500 }
        );
      }
      
      // Get messages with pagination
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      
      const { messages, hasMore } = await getChatMessages(chat.id, {
        page,
        limit,
        includeInternal: isAdmin // Admins can see internal messages
      });
      
      return jsonResponse({
        success: true,
        chat,
        messages,
        pagination: {
          page,
          limit,
          hasMore
        }
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Chat fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat', detail: process.env.NODE_ENV === 'development' ? msg : undefined },
        { status: 500 }
      );
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(request, async (req) => {
    try {
      const { id } = await params;
      const quoteId = parseInt(id);
      const { message, is_internal } = await request.json();
      
      if (isNaN(quoteId)) {
        return NextResponse.json(
          { error: 'Invalid quote ID' },
          { status: 400 }
        );
      }
      
      if (!message || message.trim() === '') {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        );
      }
      
      if (!req.user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }
      
      // Check if user has access to this quote
      const quote = await getQuoteById(quoteId, false);
      if (!quote) {
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (!isAdmin && quote.user_id !== req.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      // Only admins can send internal messages
      if (is_internal && !isAdmin) {
        return NextResponse.json(
          { error: 'Only admins can send internal messages' },
          { status: 403 }
        );
      }
      
      // Get or create chat
      const chat = await getQuoteChat(quoteId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Failed to get chat' },
          { status: 500 }
        );
      }
      
      // Send message
      const sentMessage = await sendChatMessage(
        chat.id,
        req.user.id,
        message.trim(),
        'text',
        is_internal || false
      );
      
      if (!sentMessage) {
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }
      
      return jsonResponse({
        success: true,
        message: sentMessage
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Chat message send error:', error);
      return NextResponse.json(
        { error: 'Failed to send message', detail: process.env.NODE_ENV === 'development' ? msg : undefined },
        { status: 500 }
      );
    }
  });
}