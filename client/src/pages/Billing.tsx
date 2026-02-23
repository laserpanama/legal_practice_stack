import { useState } from "react";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Plus, Download, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const invoices = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    client: "Juan Pérez",
    caseNumber: "CASE-2025-001",
    amount: 500000, // in cents
    status: "paid",
    issueDate: "2025-01-10",
    dueDate: "2025-02-10",
    paidDate: "2025-01-25",
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    client: "Maria García",
    caseNumber: "CASE-2025-002",
    amount: 350000,
    status: "sent",
    issueDate: "2025-01-15",
    dueDate: "2025-02-15",
    paidDate: null,
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    client: "Carlos López",
    caseNumber: "CASE-2025-003",
    amount: 275000,
    status: "overdue",
    issueDate: "2025-01-05",
    dueDate: "2025-02-05",
    paidDate: null,
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-004",
    client: "TechCorp S.A.",
    caseNumber: "CASE-2025-001",
    amount: 450000,
    status: "draft",
    issueDate: "2025-01-20",
    dueDate: "2025-02-20",
    paidDate: null,
  },
];

const timeEntries = [
  {
    id: 1,
    date: "2025-01-20",
    caseNumber: "CASE-2025-001",
    description: "Legal research and document review",
    hours: 120, // in minutes
    hourlyRate: 15000, // B/.150 in cents
    totalAmount: 30000,
    billable: true,
  },
  {
    id: 2,
    date: "2025-01-20",
    caseNumber: "CASE-2025-002",
    description: "Client consultation",
    hours: 60,
    hourlyRate: 15000,
    totalAmount: 15000,
    billable: true,
  },
  {
    id: 3,
    date: "2025-01-19",
    caseNumber: "CASE-2025-001",
    description: "Court appearance preparation",
    hours: 180,
    hourlyRate: 15000,
    totalAmount: 45000,
    billable: true,
  },
  {
    id: 4,
    date: "2025-01-19",
    caseNumber: "CASE-2025-003",
    description: "Internal meeting",
    hours: 30,
    hourlyRate: 15000,
    totalAmount: 7500,
    billable: false,
  },
];

export default function Billing() {
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const formatCurrency = (cents: number) => {
    return `B/.${(cents / 100).toFixed(2)}`;
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "sent":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "overdue":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "draft":
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const totalBillable = timeEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.totalAmount, 0);

  const totalNonBillable = timeEntries
    .filter((entry) => !entry.billable)
    .reduce((sum, entry) => sum + entry.totalAmount, 0);

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing & Time Tracking</h1>
            <p className="mt-1 text-muted-foreground">
              Manage invoices, time entries, and billing in Panamanian Balboas.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Log Time
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Time Entry</DialogTitle>
                  <DialogDescription>
                    Record billable hours for a case.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time-case">Case Number</Label>
                    <Input id="time-case" placeholder="CASE-2025-001" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time-description">Description</Label>
                    <textarea
                      id="time-description"
                      placeholder="What work did you perform?"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="time-hours">Hours</Label>
                      <Input id="time-hours" type="number" placeholder="2.5" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time-rate">Rate (B/.)</Label>
                      <Input id="time-rate" type="number" placeholder="150.00" />
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => {
                    toast.success("Time entry logged successfully");
                    setIsTimeDialogOpen(false);
                  }}>
                    Log Time
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for a client.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-client">Client</Label>
                    <Input id="invoice-client" placeholder="Select client" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-case">Case Number</Label>
                    <Input id="invoice-case" placeholder="CASE-2025-001" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-amount">Amount (B/.)</Label>
                    <Input id="invoice-amount" type="number" placeholder="5000.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-description">Description</Label>
                    <textarea
                      id="invoice-description"
                      placeholder="Invoice description..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <Button className="w-full" onClick={() => {
                    toast.success("Invoice created successfully");
                    setIsInvoiceDialogOpen(false);
                  }}>
                    Create Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Paid invoices</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(totalOutstanding)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Billable Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBillable)}</div>
              <p className="mt-1 text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Non-Billable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(totalNonBillable)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Internal time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-border hover:bg-accent/50">
                          <TableCell className="font-mono text-sm font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{invoice.client}</TableCell>
                          <TableCell className="font-mono text-sm">{invoice.caseNumber}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getInvoiceStatusIcon(invoice.status)}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getInvoiceStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {invoice.dueDate}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Entries Tab */}
          <TabsContent value="time-entries" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
                <CardDescription>
                  {timeEntries.length} time entr{timeEntries.length !== 1 ? "ies" : "y"} logged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Billable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry) => (
                        <TableRow key={entry.id} className="border-border hover:bg-accent/50">
                          <TableCell className="text-muted-foreground">{entry.date}</TableCell>
                          <TableCell className="font-mono text-sm">{entry.caseNumber}</TableCell>
                          <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                          <TableCell>{formatHours(entry.hours)}</TableCell>
                          <TableCell>{formatCurrency(entry.hourlyRate)}/hr</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(entry.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                entry.billable
                                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                  : "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                              }`}
                            >
                              {entry.billable ? "Yes" : "No"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LegalDashboardLayout>
  );
}
