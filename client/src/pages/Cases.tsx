import { useState } from "react";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Calendar, DollarSign, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const caseFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(1, "Case title is required"),
  description: z.string().optional(),
  caseType: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  budget: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

export default function Cases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
  });

  const clientsQuery = trpc.clients.list.useQuery();
  const casesQuery = trpc.cases.listByLawyer.useQuery();

  const createCaseMutation = trpc.cases.create.useMutation({
    onSuccess: () => {
      toast.success("Case created successfully");
      reset();
      setIsDialogOpen(false);
      casesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create case");
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    const budgetInCents = data.budget ? Math.round(parseFloat(data.budget) * 100) : undefined;

    await createCaseMutation.mutateAsync({
      clientId: parseInt(data.clientId),
      caseNumber: data.caseNumber,
      title: data.title,
      description: data.description,
      caseType: data.caseType,
      priority: (data.priority || "medium") as "low" | "medium" | "high" | "urgent",
      budget: budgetInCents,
    });
  };

  const cases = casesQuery.data || [];
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || caseItem.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "—";
    return `B/.${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "closed":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "high":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
      case "medium":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      default:
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
    }
  };

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cases</h1>
            <p className="mt-1 text-muted-foreground">Manage your active cases and matters.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Case</DialogTitle>
                <DialogDescription>
                  Enter the case details. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <select
                    id="clientId"
                    {...register("clientId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select a client</option>
                    {clientsQuery.data?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <span className="text-sm text-red-600">{errors.clientId.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="caseNumber">Case Number *</Label>
                  <Input
                    id="caseNumber"
                    placeholder="CASE-2025-001"
                    {...register("caseNumber")}
                  />
                  {errors.caseNumber && (
                    <span className="text-sm text-red-600">{errors.caseNumber.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    placeholder="Corporate Restructuring"
                    {...register("title")}
                  />
                  {errors.title && (
                    <span className="text-sm text-red-600">{errors.title.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="Case details and background..."
                    {...register("description")}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="caseType">Case Type</Label>
                  <Input
                    id="caseType"
                    placeholder="Corporate, Family, Criminal, etc."
                    {...register("caseType")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    {...register("priority")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget (B/.)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    {...register("budget")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createCaseMutation.isPending}
                >
                  {createCaseMutation.isPending ? "Creating..." : "Create Case"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by case number or title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
            <CardDescription>
              {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {casesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading cases...</div>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                <div className="mt-2 text-muted-foreground">No cases found</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create your first case
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Case Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((caseItem) => (
                      <TableRow key={caseItem.id} className="border-border hover:bg-accent/50">
                        <TableCell className="font-mono text-sm font-medium">
                          {caseItem.caseNumber}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{caseItem.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {caseItem.caseType || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              caseItem.status || "open"
                            )}`}
                          >
                            {caseItem.status || "open"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(
                              caseItem.priority || "medium"
                            )}`}
                          >
                            {caseItem.priority || "medium"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {formatCurrency(caseItem.budget)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {caseItem.openDate ? new Date(caseItem.openDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
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
    </LegalDashboardLayout>
  );
}
