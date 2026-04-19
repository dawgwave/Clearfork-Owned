"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, FileText, Clock, User, Mail, Phone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface QuoteDetails {
  id: number;
  quote_number: string;
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  status: string;
  priority: string;
  submitted_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  'Quoted': 'bg-purple-100 text-purple-800',
  'Accepted': 'bg-green-100 text-green-800',
  'Declined': 'bg-red-100 text-red-800',
  'Expired': 'bg-gray-100 text-gray-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function QuoteDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading_quote, setLoadingQuote] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/my-quotes");
    }
  }, [loading, user, router]);

  const fetchQuote = async () => {
    try {
      setLoadingQuote(true);
      setError(null);
      
      const response = await fetch(`/api/quotes/${params.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Quote not found');
        } else if (response.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load quote');
        }
        return;
      }
      
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setError('Failed to load quote');
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      fetchQuote();
    }
  }, [user, params.id]);

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
            { label: "Request Details", href: "#" },
          ]}
        />
        
        <div className="py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Error Loading Quote</h3>
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
          { label: quote?.quote_number || "Request Details", href: "#" },
        ]}
      />
      
      <div className="py-8">
        {loading_quote ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : quote ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{quote.quote_number}</h1>
                  <Badge className={STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-800'}>
                    {quote.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Your insurance quote request details. Pricing will be communicated via messages.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/my-quotes">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/my-quotes/${quote.id}/chat`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quote Information */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Information</CardTitle>
                <CardDescription>
                  Details about your insurance quote request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Applicant Name
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.first_name} {quote.last_name}</span>
                      </div>
                    </div>
                    
                    {quote.email_address && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{quote.email_address}</span>
                        </div>
                      </div>
                    )}
                    
                    {quote.phone_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Phone Number
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{quote.phone_number}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge className={STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-800'}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Priority
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{quote.priority}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Submitted Date
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(quote.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            {quote.status === 'Quoted' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">Your Quote is Ready!</h4>
                      <p className="text-sm text-green-700">
                        We've prepared your personalized insurance quote. Check your messages to see the details and pricing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {quote.status === 'In Review' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-900">Under Review</h4>
                      <p className="text-sm text-yellow-700">
                        Our team is currently reviewing your quote request. We'll have your personalized quote ready soon!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}