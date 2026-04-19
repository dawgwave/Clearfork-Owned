"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Send,
  User,
  Clock,
  MessageSquare
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  message_type: 'text' | 'system' | 'quote_update';
  message: string;
  is_internal: boolean;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
}

interface ChatData {
  success: boolean;
  chat: {
    id: number;
    quote_id: number;
    status: string;
  };
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export default function UserQuoteChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading_chat, setLoadingChat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/my-quotes");
    }
  }, [loading, user, router]);

  const fetchChat = async () => {
    try {
      setLoadingChat(true);
      setError(null);
      
      const response = await fetch(`/api/quotes/${params.id}/chat`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Quote not found');
        } else if (response.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load chat');
        }
        return;
      }
      
      const data = await response.json();
      setChatData(data);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      setError('Failed to load chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      const response = await fetch(`/api/quotes/${params.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: newMessage.trim(),
          is_internal: false // Users can't send internal messages
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      setNewMessage('');
      await fetchChat(); // Refresh chat
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      fetchChat();
    }
  }, [user, params.id]);

  useEffect(() => {
    // Scroll to bottom when new messages are loaded
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.messages]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <PageShell>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "My Quote Requests", href: "/my-quotes" },
            { label: "Messages", href: "#" },
          ]}
        />
        
        <div className="py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Error Loading Messages</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/my-quotes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Quote Requests
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Quotes", href: "/my-quotes" },
          { label: "Messages", href: "#" },
        ]}
      />
      
      <div className="py-8">
        {loading_chat ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chatData ? (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Quote Messages</h1>
                <p className="text-muted-foreground">
                  Communicate with our team about your quote request
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/my-quotes">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Quote Requests
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/my-quotes/${params.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>

            {/* Chat Interface */}
            <Card className="min-h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                  <Badge variant="secondary">{chatData.messages.filter(m => !m.is_internal).length}</Badge>
                </CardTitle>
                <CardDescription>
                  Chat with our team about your quote request
                </CardDescription>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4 mb-6 max-h-[400px] overflow-y-auto border rounded-md p-4">
                  {chatData.messages.filter(m => !m.is_internal).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet. Our team will be in touch soon!</p>
                    </div>
                  ) : (
                    chatData.messages
                      .filter(m => !m.is_internal) // Hide internal messages from users
                      .map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.message_type === 'system' ? 'justify-center' : ''}`}>
                          {message.message_type === 'system' ? (
                            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                              {message.message}
                            </div>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm">
                                    {message.sender_name || 'Team Member'}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(message.created_at).toLocaleString()}
                                  </div>
                                </div>
                                <p className="text-sm">{message.message}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}