"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search,
  Eye,
  MessageSquare,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Trash2,
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
  internal_notes?: string;
  submitted_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  agent_name?: string;
}

interface QuotesResponse {
  success: boolean;
  quotes: Quote[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
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

const PRIORITY_COLORS: Record<Quote['priority'], string> = {
  'low': 'bg-gray-100 text-gray-600',
  'normal': 'bg-blue-100 text-blue-600',
  'high': 'bg-orange-100 text-orange-600',
  'urgent': 'bg-red-100 text-red-600',
};

export default function AdminQuotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [loading_quotes, setLoadingQuotes] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [quoteTypeFilter, setQuoteTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin/quotes");
    } else if (!loading && user && !user.roles.some(role => role.name === 'admin')) {
      router.push("/");
    }
  }, [loading, user, router]);

  const fetchQuotes = async (page = 1) => {
    try {
      setLoadingQuotes(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (quoteTypeFilter) params.append('quote_type', quoteTypeFilter);
      
      const response = await fetch(`/api/admin/quotes?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data: QuotesResponse = await response.json();
      setQuotes(data.quotes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.some(role => role.name === 'admin')) {
      fetchQuotes();
    }
  }, [user, search, statusFilter, priorityFilter, quoteTypeFilter]);

  const handlePageChange = (newPage: number) => {
    fetchQuotes(newPage);
  };

  const handleDeleteQuote = async (quoteId: number, quoteNumber: string) => {
    if (
      !window.confirm(
        `Permanently delete quote ${quoteNumber}? Related chat and history will be removed. This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setDeletingId(quoteId);
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      await fetchQuotes(pagination.page);
    } catch {
      window.alert("Failed to delete quote. Check the console or try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  if (!user || !user.roles.some(role => role.name === 'admin')) {
    return null;
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Quote Requests", href: "/admin/quotes" },
        ]}
      />
      
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Quote Requests</h1>
            <Badge variant="secondary">{pagination.total} total</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage and review all insurance quote requests.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Quoted">Quoted</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={quoteTypeFilter}
                onChange={(e) => setQuoteTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All quote types</option>
                <option value="auto">Auto & home (full form)</option>
                <option value="home">Homeowners / renters</option>
                <option value="umbrella">Umbrella</option>
                <option value="boat">Boat</option>
                <option value="rv">RV</option>
                <option value="atv">ATV / off-road</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="commercial">Commercial</option>
                <option value="life">Life</option>
                <option value="cyber">Cyber</option>
                <option value="performance_and_bid_bonds">Performance & bid bonds</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        {loading_quotes ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {quotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {quote.quote_number}
                          </h3>
                          <Badge className={STATUS_COLORS[quote.status]}>
                            {quote.status}
                          </Badge>
                          <Badge variant="outline" className={PRIORITY_COLORS[quote.priority]}>
                            {quote.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {quote.first_name} {quote.last_name}
                          </div>
                          
                          {quote.email_address && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {quote.email_address}
                            </div>
                          )}
                          
                          {quote.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {quote.phone_number}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(quote.submitted_at).toLocaleDateString()}
                          </div>
                          
                          {quote.agent_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Agent: {quote.agent_name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/quotes/${quote.id}/chat`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={deletingId === quote.id}
                          onClick={() => handleDeleteQuote(quote.id, quote.quote_number)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === quote.id ? "…" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {quotes.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No quote requests found</h3>
                    <p className="text-muted-foreground">
                      {search || statusFilter || priorityFilter || quoteTypeFilter
                        ? "No quote requests match your current filters."
                        : "No quote requests have been submitted yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} quotes
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}