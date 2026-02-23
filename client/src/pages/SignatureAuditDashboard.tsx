/**
 * Signature Audit Dashboard
 * Admin-only page for tracking all signature activities and compliance data
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, RefreshCw, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function SignatureAuditDashboard() {
  const { user } = useAuth();
  const [_match, params] = useRoute("/audit/:id");
  const navigate = (path: string) => {
    window.location.href = path;
  };

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

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days">(
    "30days"
  );
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate date range
  const endDate = new Date();
  const startDate = useMemo(() => {
    const days =
      dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
    return new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  }, [dateRange]);

  // Fetch dashboard summary
  const { data: summaryData, isLoading: summaryLoading } =
    trpc.audit.getDashboardSummary.useQuery({
      days: dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90,
    });

  // Fetch signature requests
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } =
    trpc.audit.getSignatureRequests.useQuery({
      status: (statusFilter as any) || undefined,
      signerEmail: emailFilter || undefined,
      startDate,
      endDate,
      limit: 50,
      offset: currentPage * 50,
    });

  // Fetch compliance statistics
  const { data: complianceData } =
    trpc.audit.getComplianceStatistics.useQuery({
      startDate,
      endDate,
    });

  // Export CSV mutation
  const { mutate: exportCSV, isPending: isExporting } =
    trpc.audit.exportAuditTrailToCSV.useMutation({
      onSuccess: (result) => {
        // Create a blob and download
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
    });

  // Generate report mutation
  const { mutate: generateReport, isPending: isGeneratingReport } =
    trpc.audit.generateComplianceReport.useMutation({
      onSuccess: (result) => {
        alert(
          `Compliance report generated successfully:\n${result.data.reportName}`
        );
      },
    });

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

  const requests = requestsData?.data || [];
  const totalRequests = requestsData?.count || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signature Audit Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track all signature activities and compliance data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRequests()}
            disabled={requestsLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportCSV({
                startDate,
                endDate,
              })
            }
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() =>
              generateReport({
                startDate,
                endDate,
              })
            }
            disabled={isGeneratingReport}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData?.data.totalRequests || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summaryData?.data.statusBreakdown?.signed || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(summaryData?.data.statusBreakdown?.pending || 0) +
                  (summaryData?.data.statusBreakdown?.sent || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(summaryData?.data.compliancePercentage || 0)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Signer Email</label>
              <Input
                placeholder="Filter by email..."
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Requests</CardTitle>
          <CardDescription>
            Showing {requests.length} of {totalRequests} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No signature requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Signer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Signed</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.signerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.signerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(request.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.signedDate
                          ? format(new Date(request.signedDate), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {request.signatureType}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.location.href = `/audit/${request.id}`
                          }
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalRequests > 50 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalRequests / 50)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(totalRequests / 50) - 1,
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalRequests / 50) - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Statistics */}
      {complianceData && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Ley 81 Compliant
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {complianceData.data.complianceBreakdown?.ley81Compliant || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Non-Repudiation
                </div>
                <div className="text-2xl font-bold">
                  {complianceData.data.complianceBreakdown?.nonRepudiationVerified || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Certificate Valid
                </div>
                <div className="text-2xl font-bold">
                  {complianceData.data.complianceBreakdown?.certificateValid || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Timestamp Valid
                </div>
                <div className="text-2xl font-bold">
                  {complianceData.data.complianceBreakdown?.timestampValid || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Document Integrity
                </div>
                <div className="text-2xl font-bold">
                  {complianceData.data.complianceBreakdown?.documentIntegrityVerified || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
