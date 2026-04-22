"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare,
  Clock,
  Plus,
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QUOTE_TYPE_LABEL } from "@/lib/quote-line-schemas";

interface Quote {
  id: number;
  user_id?: number;
  assigned_agent_id?: number;
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  quote_number: string;
  quote_type?: string | null;
  status: 'New' | 'In Review' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submitted_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<Quote['status'], string> = {
  'New': 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  'Quoted': 'bg-purple-100 text-purple-800',
  'Accepted': 'bg-green-100 text-green-800',
  'Declined': 'bg-red-100 text-red-800',
  'Expired': 'bg-gray-100 text-gray-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const STATUS_DESCRIPTIONS: Record<Quote['status'], string> = {
  'New': 'Your quote request has been received and is waiting for review.',
  'In Review': 'Our team is currently reviewing your quote request.',
  'Quoted': 'Your quote is ready! Check your messages for details.',
  'Accepted': 'Quote accepted. Welcome to our insurance family!',
  'Declined': 'Quote was declined. See messages for details.',
  'Expired': 'Quote has expired. Contact us to request a new quote.',
  'Cancelled': 'Quote request was cancelled.',
};

export default function MyQuotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading_quotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/my-quotes");
    }
  }, [loading, user, router]);

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const response = await fetch('/api/quotes', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      setQuotes(data.quotes);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

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

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Quote Requests", href: "/my-quotes" },
        ]}
      />
      
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Quote Requests</h1>
              <Badge variant="secondary">{quotes.length} requests</Badge>
            </div>
            <p className="text-muted-foreground">
              Track the status of your insurance quote requests and communicate with our team.
            </p>
          </div>
          
          <Button asChild>
            <Link href="/get-a-quote">
              <Plus className="h-4 w-4 mr-2" />
              Get New Quote
            </Link>
          </Button>
        </div>

        {/* Quotes List */}
        {loading_quotes ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {quotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex flex-wrap items-center gap-3">
                          {quote.quote_number}
                          <Badge className={STATUS_COLORS[quote.status]}>
                            {quote.status}
                          </Badge>
                          {quote.quote_type ? (
                            <Badge variant="outline" className="font-normal">
                              {QUOTE_TYPE_LABEL[quote.quote_type] ?? quote.quote_type}
                            </Badge>
                          ) : null}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {STATUS_DESCRIPTIONS[quote.status]}
                        </CardDescription>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/my-quotes/${quote.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/my-quotes/${quote.id}/chat`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Messages
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Submitted: {new Date(quote.submitted_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Updated: {new Date(quote.updated_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Priority: {quote.priority}
                      </div>
                    </div>
                    
                    {quote.status === 'Quoted' && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          🎉 Your quote is ready! Click "Messages" to see the details and pricing.
                        </p>
                      </div>
                    )}
                    
                    {quote.status === 'In Review' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">
                          ⏳ We're reviewing your request. You'll hear from us soon!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {quotes.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No quote requests yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't submitted any quote requests yet. Get started by requesting your first quote!
                    </p>
                    <Button asChild>
                      <Link href="/get-a-quote">
                        <Plus className="h-4 w-4 mr-2" />
                        Get Your First Quote
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}