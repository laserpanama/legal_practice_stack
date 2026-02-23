import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle, Clock, AlertCircle, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";

interface CaseWorkflowItem {
  id: number;
  caseId: number;
  caseName: string;
  client: string;
  currentStatus: "intake" | "review" | "active" | "pending_signature" | "closed" | "archived";
  nextStatus?: string;
  daysInStatus: number;
  lastTransition: string;
}

const STATUS_COLORS: Record<string, string> = {
  intake: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  pending_signature: "bg-purple-100 text-purple-800",
  closed: "bg-gray-100 text-gray-800",
  archived: "bg-slate-100 text-slate-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  intake: <FileText className="w-4 h-4" />,
  review: <Clock className="w-4 h-4" />,
  active: <CheckCircle className="w-4 h-4" />,
  pending_signature: <AlertCircle className="w-4 h-4" />,
  closed: <CheckCircle className="w-4 h-4" />,
  archived: <FileText className="w-4 h-4" />,
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  intake: ["review", "closed"],
  review: ["active", "intake", "closed"],
  active: ["pending_signature", "closed"],
  pending_signature: ["active", "closed"],
  closed: ["archived"],
  archived: [],
};

export default function CaseWorkflow() {
  const [cases, setCases] = useState<CaseWorkflowItem[]>([
    {
      id: 1,
      caseId: 1,
      caseName: "Corporate Restructuring - TechCorp S.A.",
      client: "Juan Pérez",
      currentStatus: "active",
      daysInStatus: 15,
      lastTransition: "2025-01-10",
    },
    {
      id: 2,
      caseId: 2,
      caseName: "Contract Dispute Resolution",
      client: "María García",
      currentStatus: "review",
      daysInStatus: 8,
      lastTransition: "2025-01-05",
    },
    {
      id: 3,
      caseId: 3,
      caseName: "Intellectual Property Matter",
      client: "Carlos López",
      currentStatus: "intake",
      daysInStatus: 3,
      lastTransition: "2025-01-10",
    },
    {
      id: 4,
      caseId: 4,
      caseName: "Employment Dispute",
      client: "Ana Martínez",
      currentStatus: "pending_signature",
      daysInStatus: 2,
      lastTransition: "2025-01-11",
    },
  ]);

  const [selectedCase, setSelectedCase] = useState<CaseWorkflowItem | null>(null);
  const [transitionReason, setTransitionReason] = useState("");
  const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState("");

  const handleTransitionCase = () => {
    if (!selectedCase || !selectedNextStatus || !transitionReason) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    // Update case status
    setCases(
      cases.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              currentStatus: selectedNextStatus as any,
              daysInStatus: 0,
              lastTransition: new Date().toISOString().split("T")[0],
            }
          : c
      )
    );

    toast.success(`Caso "${selectedCase.caseName}" transicionado a ${selectedNextStatus}`);
    setIsTransitionDialogOpen(false);
    setTransitionReason("");
    setSelectedNextStatus("");
    setSelectedCase(null);
  };

  const getValidNextStatuses = (currentStatus: string): string[] => {
    return VALID_TRANSITIONS[currentStatus] || [];
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      intake: "Ingreso",
      review: "Revisión",
      active: "Activo",
      pending_signature: "Pendiente Firma",
      closed: "Cerrado",
      archived: "Archivado",
    };
    return labels[status] || status;
  };

  const casesByStatus = {
    intake: cases.filter((c) => c.currentStatus === "intake").length,
    review: cases.filter((c) => c.currentStatus === "review").length,
    active: cases.filter((c) => c.currentStatus === "active").length,
    pending_signature: cases.filter((c) => c.currentStatus === "pending_signature").length,
    closed: cases.filter((c) => c.currentStatus === "closed").length,
    archived: cases.filter((c) => c.currentStatus === "archived").length,
  };

  const averageDaysInStatus = {
    intake: Math.round(cases.filter((c) => c.currentStatus === "intake").reduce((sum, c) => sum + c.daysInStatus, 0) / Math.max(cases.filter((c) => c.currentStatus === "intake").length, 1)),
    active: Math.round(cases.filter((c) => c.currentStatus === "active").reduce((sum, c) => sum + c.daysInStatus, 0) / Math.max(cases.filter((c) => c.currentStatus === "active").length, 1)),
  };

  return (
    <LegalDashboardLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Automatización de Flujos de Casos</h1>
            <p className="text-muted-foreground mt-2">Gestione transiciones de estado y automatice procesos</p>
          </div>

          {/* Workflow Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Casos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{casesByStatus.active}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Promedio: {averageDaysInStatus.active} días
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">En Revisión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{casesByStatus.review}</div>
                <p className="text-xs text-muted-foreground mt-1">Pendiente de aprobación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pendiente Firma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{casesByStatus.pending_signature}</div>
                <p className="text-xs text-muted-foreground mt-1">Requiere firma electrónica</p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Estados de Casos</CardTitle>
              <CardDescription>Transiciones permitidas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-2">Ingreso</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-yellow-100 text-yellow-800 px-3 py-2">Revisión</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-green-100 text-green-800 px-3 py-2">Activo</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-2">Firma</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-gray-100 text-gray-800 px-3 py-2">Cerrado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cases List */}
          <Card>
            <CardHeader>
              <CardTitle>Casos ({cases.length})</CardTitle>
              <CardDescription>Gestione transiciones de estado de casos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {STATUS_ICONS[caseItem.currentStatus]}
                        <p className="font-medium">{caseItem.caseName}</p>
                      </div>
                      <Badge className={STATUS_COLORS[caseItem.currentStatus]}>
                        {getStatusLabel(caseItem.currentStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {caseItem.client} | {caseItem.daysInStatus} días en este estado
                    </p>
                  </div>

                  <Dialog open={isTransitionDialogOpen && selectedCase?.id === caseItem.id} onOpenChange={setIsTransitionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCase(caseItem)}
                        disabled={getValidNextStatuses(caseItem.currentStatus).length === 0}
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Transicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transicionar Caso</DialogTitle>
                        <DialogDescription>
                          {selectedCase?.caseName}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedCase && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Estado Actual</Label>
                            <div className="p-2 bg-muted rounded-lg">
                              <Badge className={STATUS_COLORS[selectedCase.currentStatus]}>
                                {getStatusLabel(selectedCase.currentStatus)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="next-status">Nuevo Estado</Label>
                            <Select value={selectedNextStatus} onValueChange={setSelectedNextStatus}>
                              <SelectTrigger id="next-status">
                                <SelectValue placeholder="Seleccione nuevo estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {getValidNextStatuses(selectedCase.currentStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {getStatusLabel(status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reason">Razón de la Transición</Label>
                            <Textarea
                              id="reason"
                              value={transitionReason}
                              onChange={(e) => setTransitionReason(e.target.value)}
                              placeholder="Explique por qué se realiza esta transición..."
                              rows={3}
                            />
                          </div>

                          <Button onClick={handleTransitionCase} className="w-full gap-2">
                            <Send className="w-4 h-4" />
                            Confirmar Transición
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Cumplimiento Ley 81 (2019)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900">
              Todas las transiciones de estado son registradas automáticamente en el registro de auditoría para cumplir con los requisitos de protección de datos de Panamá. Los cambios de estado generan notificaciones automáticas a los clientes cuando es apropiado.
            </CardContent>
          </Card>
        </div>
      </div>
    </LegalDashboardLayout>
  );
}
