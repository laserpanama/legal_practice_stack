/**
 * Signature Audit Detail Page
 * Shows detailed information about a specific signature request and its audit trail
 */

import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function SignatureAuditDetail() {
  const { user } = useAuth();
  const [match, params] = useRoute("/audit/:id");
  const signatureRequestId = params?.id ? parseInt(params.id) : null;

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!signatureRequestId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid signature request ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch signature request details
  const { data: detailsData, isLoading: detailsLoading } =
    trpc.audit.getSignatureRequestDetails.useQuery({
      signatureRequestId,
    });

  // Fetch audit trail
  const { data: auditData, isLoading: auditLoading } =
    trpc.audit.getAuditTrail.useQuery({
      signatureRequestId,
    });

  const request = detailsData?.data?.request;
  const auditTrail = auditData?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      sent: "secondary",
      viewed: "secondary",
      signed: "default",
      rejected: "destructive",
      expired: "destructive",
      cancelled: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getEventBadge = (eventType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      request_created: "secondary",
      signature_sent: "secondary",
      signature_viewed: "secondary",
      signature_completed: "default",
      signature_rejected: "destructive",
      signature_expired: "destructive",
    };
    return (
      <Badge variant={variants[eventType] || "secondary"} className="capitalize">
        {eventType.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = "/audit")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signature Request #{signatureRequestId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed audit trail and compliance information
          </p>
        </div>
      </div>

      {/* Request Details */}
      {detailsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
        </div>
      ) : request ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Signer Name</div>
                <div className="font-medium">{request.signerName}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Signer Email</div>
                <div className="font-medium">{request.signerEmail}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Signature Type
                </div>
                <div className="font-medium capitalize">
                  {request.signatureType}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Created Date</div>
                <div className="font-medium">
                  {format(new Date(request.createdAt), "PPpp")}
                </div>
              </div>

              {request.signedDate && (
                <div>
                  <div className="text-sm text-muted-foreground">Signed Date</div>
                  <div className="font-medium">
                    {format(new Date(request.signedDate), "PPpp")}
                  </div>
                </div>
              )}

              {request.expiryDate && (
                <div>
                  <div className="text-sm text-muted-foreground">Expiry Date</div>
                  <div className="font-medium">
                    {format(new Date(request.expiryDate), "PPpp")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.documentName && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Document Name
                  </div>
                  <div className="font-medium">{request.documentName}</div>
                </div>
              )}

              {request.documentHash && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Document Hash
                  </div>
                  <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                    {request.documentHash}
                  </div>
                </div>
              )}

              {request.signatureHash && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Signature Hash
                  </div>
                  <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                    {request.signatureHash}
                  </div>
                </div>
              )}

              {request.certificateId && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Certificate ID
                  </div>
                  <div className="font-mono text-xs break-all">
                    {request.certificateId}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Signature request not found</AlertDescription>
        </Alert>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Complete history of all events for this signature request
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : auditTrail.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit events found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((event: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {getEventBadge(event.eventType)}
                      </TableCell>
                      <TableCell>
                        {event.actorEmail ? (
                          <div className="text-sm">{event.actorEmail}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            System
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(event.createdAt), "PPpp")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.details ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600">
                              View Details
                            </summary>
                            <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(JSON.parse(event.details), null, 2)}
                            </pre>
                          </details>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
