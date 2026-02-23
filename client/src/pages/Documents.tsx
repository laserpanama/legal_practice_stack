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
import {
  FileText,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Lock,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const documentTemplates = [
  {
    id: 1,
    name: "Power of Attorney",
    category: "Powers of Attorney",
    description: "General power of attorney document",
    fields: ["grantor_name", "grantor_cedula", "attorney_name", "attorney_cedula", "scope"],
  },
  {
    id: 2,
    name: "Service Contract",
    category: "Contracts",
    description: "Professional services agreement",
    fields: ["service_provider", "client_name", "service_description", "rate", "term"],
  },
  {
    id: 3,
    name: "Employment Agreement",
    category: "Contracts",
    description: "Employment contract template",
    fields: ["employer_name", "employee_name", "position", "salary", "start_date"],
  },
  {
    id: 4,
    name: "Complaint/Pleading",
    category: "Pleadings",
    description: "Legal complaint template",
    fields: ["plaintiff_name", "defendant_name", "cause_of_action", "relief_sought"],
  },
  {
    id: 5,
    name: "Motion",
    category: "Pleadings",
    description: "Motion to court template",
    fields: ["case_number", "motion_type", "grounds", "relief_requested"],
  },
];

const recentDocuments = [
  {
    id: 1,
    title: "Power of Attorney - Juan Pérez",
    type: "Power of Attorney",
    caseNumber: "CASE-2025-001",
    status: "signed",
    signedBy: "Juan Pérez",
    signedAt: "2025-01-15",
    size: "245 KB",
  },
  {
    id: 2,
    title: "Service Contract - TechCorp",
    type: "Contract",
    caseNumber: "CASE-2025-001",
    status: "pending_signature",
    signedBy: null,
    signedAt: null,
    size: "189 KB",
  },
  {
    id: 3,
    title: "Employment Agreement - Maria García",
    type: "Employment Agreement",
    caseNumber: "CASE-2025-002",
    status: "draft",
    signedBy: null,
    signedAt: null,
    size: "156 KB",
  },
  {
    id: 4,
    title: "Complaint - vs. Defendant Corp",
    type: "Pleading",
    caseNumber: "CASE-2025-003",
    status: "signed",
    signedBy: "Lawyer Name",
    signedAt: "2025-01-10",
    size: "312 KB",
  },
];

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof documentTemplates[0] | null>(
    null
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const filteredDocuments = recentDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "pending_signature":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "pending_signature":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "draft":
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
      default:
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
    }
  };

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
            <p className="mt-1 text-muted-foreground">
              Manage documents, templates, and electronic signatures.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to your case files.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="document-file">Select File</Label>
                    <Input id="document-file" type="file" accept=".pdf,.doc,.docx" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document-title">Document Title</Label>
                    <Input id="document-title" placeholder="Enter document title" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document-case">Case (Optional)</Label>
                    <Input id="document-case" placeholder="CASE-2025-001" />
                  </div>
                  <Button className="w-full" onClick={() => {
                    toast.success("Document uploaded successfully");
                    setIsUploadDialogOpen(false);
                  }}>
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Document Template</DialogTitle>
                  <DialogDescription>
                    Choose a template to create a new document.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {documentTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-lg border border-border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedTemplate(template);
                        toast.success(`Selected template: ${template.name}`);
                        setIsTemplateDialogOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.category}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Recent Documents</TabsTrigger>
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Search */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by document title or case number..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signed By</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id} className="border-border hover:bg-accent/50">
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                          <TableCell className="font-mono text-sm">{doc.caseNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(doc.status)}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  doc.status
                                )}`}
                              >
                                {doc.status.replace("_", " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {doc.signedBy ? (
                              <div>
                                <p className="text-sm">{doc.signedBy}</p>
                                <p className="text-xs text-muted-foreground">{doc.signedAt}</p>
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              {doc.status === "draft" && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documentTemplates.map((template) => (
                <Card key={template.id} className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                      </div>
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field) => (
                          <span
                            key={field}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {field.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedTemplate(template);
                        toast.success(`Selected template: ${template.name}`);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LegalDashboardLayout>
  );
}
