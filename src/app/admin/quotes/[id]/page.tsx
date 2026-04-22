"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Car,
  Briefcase,
  Clock,
  Edit
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QUOTE_TYPE_LABEL } from "@/lib/quote-line-schemas";

function parseDetailsJson(raw: unknown): Record<string, string> | null {
  if (raw == null || raw === "") return null;
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  return Object.keys(out).length ? out : null;
}

function humanFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

interface QuoteDetails {
  id: number;
  user_id?: number;
  assigned_agent_id?: number;
  quote_type?: string | null;
  details_json?: unknown;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  marital_status?: string;
  gender?: string;
  street_address?: string;
  state?: string;
  zip_code?: string;
  phone_number?: string;
  can_receive_texts?: boolean;
  email_address?: string;
  driver_license_number?: string;
  social_security_number?: string;
  additional_driver_first_name?: string;
  additional_driver_last_name?: string;
  additional_driver_dob?: string;
  additional_driver_license?: string;
  vin_number?: string;
  vehicle_use?: string;
  estimated_annual_mileage?: number;
  occupation?: string;
  military_service?: string;
  is_student?: boolean;
  quote_number: string;
  status: string;
  priority: string;
  internal_notes?: string;
  submitted_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  agent_name?: string;
  extra_drivers?: Array<{
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    marital_status: string | null;
    gender: string | null;
    driver_license_number: string | null;
  }>;
  extra_vehicles?: Array<{
    id: number;
    vin_number: string;
    vehicle_use: string | null;
    estimated_annual_mileage: number | null;
  }>;
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

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-600',
  'normal': 'bg-blue-100 text-blue-600',
  'high': 'bg-orange-100 text-orange-600',
  'urgent': 'bg-red-100 text-red-600',
};

export default function AdminQuoteDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading_quote, setLoadingQuote] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/admin");
    } else if (!loading && user && !user.roles.some(role => role.name === 'admin')) {
      router.push("/");
    }
  }, [loading, user, router]);

  const fetchQuote = async () => {
    try {
      setLoadingQuote(true);
      setError(null);
      
      const response = await fetch(`/api/admin/quotes/${params.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Quote not found');
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
    if (user && user.roles.some(role => role.name === 'admin') && params.id) {
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

  if (!user || !user.roles.some(role => role.name === 'admin')) {
    return null;
  }

  if (error) {
    return (
      <PageShell>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Quote Requests", href: "/admin/quotes" },
            { label: "Quote Details", href: "#" },
          ]}
        />
        
        <div className="py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Error Loading Quote</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/admin/quotes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quote Requests
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
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Quote Requests", href: "/admin/quotes" },
          { label: quote?.quote_number || "Quote Details", href: "#" },
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
                  <Badge variant="outline" className={PRIORITY_COLORS[quote.priority] || 'bg-gray-100 text-gray-600'}>
                    {quote.priority}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Submitted on {new Date(quote.submitted_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/quotes">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Status
                </Button>
                <Button asChild>
                  <Link href={`/admin/quotes/${quote.id}/chat`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{quote.first_name} {quote.last_name}</p>
                  </div>
                  
                  {quote.date_of_birth && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(quote.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {quote.marital_status && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                      <p>{quote.marital_status}</p>
                    </div>
                  )}
                  
                  {quote.gender && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p>{quote.gender}</p>
                    </div>
                  )}
                  
                  {quote.is_student !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Student Status</label>
                      <p>{quote.is_student ? 'Student' : 'Not a student'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.email_address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.email_address}</span>
                      </div>
                    </div>
                  )}
                  
                  {quote.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.phone_number}</span>
                        {quote.can_receive_texts && (
                          <Badge variant="outline" className="text-xs">Can receive texts</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(quote.street_address || quote.state || quote.zip_code) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          {quote.street_address && <div>{quote.street_address}</div>}
                          <div>
                            {quote.state && <span>{quote.state}</span>}
                            {quote.state && quote.zip_code && <span>, </span>}
                            {quote.zip_code && <span>{quote.zip_code}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(() => {
                const details = parseDetailsJson(quote.details_json);
                if (!details) return null;
                return (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Line-specific answers
                      </CardTitle>
                      <CardDescription>
                        Submitted on the {QUOTE_TYPE_LABEL[quote.quote_type ?? ""] ?? quote.quote_type ?? "—"} form.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid gap-4 sm:grid-cols-2">
                        {Object.entries(details).map(([key, val]) => (
                          <div key={key}>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {humanFieldKey(key)}
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap text-sm">{val}</dd>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Vehicle Information */}
              {(quote.vin_number || quote.vehicle_use || quote.estimated_annual_mileage) &&
                quote.vin_number !== "LINEQUOTE-PENDING" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quote.vin_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">VIN Number</label>
                        <p className="font-mono text-sm">{quote.vin_number}</p>
                      </div>
                    )}
                    
                    {quote.vehicle_use && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Vehicle Use</label>
                        <p>{quote.vehicle_use}</p>
                      </div>
                    )}
                    
                    {quote.estimated_annual_mileage && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Annual Mileage</label>
                        <p>{quote.estimated_annual_mileage.toLocaleString()} miles</p>
                      </div>
                    )}
                    {quote.extra_vehicles && quote.extra_vehicles.length > 0 && (
                      <div className="pt-2 border-t space-y-4">
                        {quote.extra_vehicles.map((ev, idx) => (
                          <div key={ev.id} className="rounded-md border p-3 bg-muted/30">
                            <p className="text-sm font-semibold mb-2">Additional vehicle {idx + 1}</p>
                            {ev.vin_number && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">VIN</label>
                                <p className="font-mono text-sm">{ev.vin_number}</p>
                              </div>
                            )}
                            {ev.vehicle_use && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Use</label>
                                <p>{ev.vehicle_use}</p>
                              </div>
                            )}
                            {ev.estimated_annual_mileage != null && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Annual mileage</label>
                                <p>{Number(ev.estimated_annual_mileage).toLocaleString()} miles</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Employment Information */}
              {(quote.occupation || quote.military_service) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Employment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quote.occupation && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                        <p>{quote.occupation}</p>
                      </div>
                    )}
                    
                    {quote.military_service && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Military Service</label>
                        <p>{quote.military_service}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional drivers (legacy single row or new many) */}
            {((quote.additional_driver_first_name || quote.additional_driver_last_name) ||
              (quote.extra_drivers && quote.extra_drivers.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional drivers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(quote.additional_driver_first_name || quote.additional_driver_last_name) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md border p-3">
                      <p className="text-sm font-medium col-span-2">Legacy single additional driver (older quotes)</p>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p>{quote.additional_driver_first_name} {quote.additional_driver_last_name}</p>
                      </div>
                      {quote.additional_driver_dob && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                          <p>{new Date(quote.additional_driver_dob).toLocaleDateString()}</p>
                        </div>
                      )}
                      {quote.additional_driver_license && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">License Number</label>
                          <p className="font-mono text-sm">{quote.additional_driver_license}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {quote.extra_drivers?.map((ed, idx) => (
                    <div key={ed.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md border p-3 bg-muted/30">
                      <p className="text-sm font-semibold col-span-2">Driver {idx + 2} (additional)</p>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p>{ed.first_name} {ed.last_name}</p>
                      </div>
                      {ed.date_of_birth && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                          <p>{new Date(ed.date_of_birth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {ed.marital_status && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Marital status</label>
                          <p>{ed.marital_status}</p>
                        </div>
                      )}
                      {ed.gender && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Gender</label>
                          <p>{ed.gender}</p>
                        </div>
                      )}
                      {ed.driver_license_number && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">License</label>
                          <p className="font-mono text-sm">{ed.driver_license_number}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Internal Notes */}
            {quote.internal_notes && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-900">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-800">{quote.internal_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Quote Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quote.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quote.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}