import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Eye, 
  FileText, 
  History, 
  Printer, 
  Share2, 
  Edit3, 
  Save, 
  ArrowLeft,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { trpc } from "@/lib/trpc";

interface DocumentVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'review' | 'approved' | 'signed';
}

interface DocumentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea';
  required: boolean;
  value: string;
}

export default function DocumentPreview() {
  const [, setLocation] = useLocation();
  const { id } = useParams(); // Document ID from URL
  
  // Mock document data - in real implementation, this would come from tRPC
  const [document, setDocument] = useState({
    id: id || 'doc-123',
    title: 'Contrato de Servicios Legales',
    type: 'contract',
    status: 'draft',
    createdAt: '2025-01-10',
    createdBy: 'Pío López',
    clientId: 'client-456',
    caseId: 'case-789',
  });
  
  const [versions, setVersions] = useState<DocumentVersion[]>([
    {
      id: 'v3',
      versionNumber: 3,
      title: 'Contrato de Servicios Legales v3',
      content: `<h1>CONTRATO DE SERVICIOS LEGALES</h1>
                <p><strong>Entre:</strong> [NOMBRE DEL CLIENTE] con cédula [NÚMERO DE CÉDULA]</p>
                <p><strong>Y:</strong> [NOMBRE DEL ABOGADO/FIRMA] con licencia [NÚMERO DE LICENCIA]</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PA')}</p>
                
                <h2>1. OBJETO DEL CONTRATO</h2>
                <p>El presente contrato tiene por objeto la prestación de servicios legales profesionales...</p>
                
                <h2>2. ÁMBITO DE LOS SERVICIOS</h2>
                <p>Los servicios incluirán, pero no se limitarán a:</p>
                <ul>
                  <li>Asesoría legal en derecho civil</li>
                  <li>Representación en procedimientos judiciales</li>
                  <li>Redacción y revisión de documentos legales</li>
                </ul>
                
                <h2>3. HONORARIOS Y FORMA DE PAGO</h2>
                <p>Los honorarios serán de B/. [MONTO] pagaderos de la siguiente forma...</p>`,
      createdBy: 'Pío López',
      createdAt: '2025-01-13T14:30:00Z',
      status: 'approved'
    },
    {
      id: 'v2',
      versionNumber: 2,
      title: 'Contrato de Servicios Legales v2',
      content: '<p>Versión anterior del contrato con modificaciones menores...</p>',
      createdBy: 'María García',
      createdAt: '2025-01-12T10:15:00Z',
      status: 'review'
    },
    {
      id: 'v1',
      versionNumber: 1,
      title: 'Contrato de Servicios Legales v1',
      content: '<p>Documento inicial del contrato...</p>',
      createdBy: 'Pío López',
      createdAt: '2025-01-10T09:00:00Z',
      status: 'draft'
    }
  ]);
  
  const [fields, setFields] = useState<DocumentField[]>([
    { id: 'clientName', name: 'clientName', label: 'Nombre del Cliente', type: 'text', required: true, value: '' },
    { id: 'clientId', name: 'clientId', label: 'Cédula del Cliente', type: 'text', required: true, value: '' },
    { id: 'lawyerName', name: 'lawyerName', label: 'Nombre del Abogado', type: 'text', required: true, value: '' },
    { id: 'startDate', name: 'startDate', label: 'Fecha de Inicio', type: 'date', required: true, value: '' },
    { id: 'amount', name: 'amount', label: 'Monto (B/.)', type: 'number', required: true, value: '' },
    { id: 'services', name: 'services', label: 'Descripción de Servicios', type: 'textarea', required: true, value: '' }
  ]);
  
  const [selectedVersion, setSelectedVersion] = useState<string>('v3');
  const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  // Get selected version content
  const selectedVersionData = versions.find(v => v.id === selectedVersion);
  
  // Generate document content based on fields
  const generateDocumentContent = () => {
    const fieldValues = fields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, string>);
    
    // Simple template replacement - in reality, you'd use a proper templating engine
    let content = `<h1>CONTRATO DE SERVICIOS LEGALES</h1>
                   <p><strong>Entre:</strong> ${fieldValues.clientName || '[NOMBRE DEL CLIENTE]'} con cédula ${fieldValues.clientId || '[NÚMERO DE CÉDULA]'}</p>
                   <p><strong>Y:</strong> ${fieldValues.lawyerName || '[NOMBRE DEL ABOGADO/FIRMA]'}</p>
                   <p><strong>Fecha:</strong> ${fieldValues.startDate || new Date().toLocaleDateString('es-PA')}</p>
                   
                   <h2>OBJETO DEL CONTRATO</h2>
                   <p>${fieldValues.services || 'Descripción de los servicios...'}</p>
                   
                   <h2>HONORARIOS</h2>
                   <p>Los honorarios serán de B/. ${fieldValues.amount || '[MONTO]'} pagaderos según acuerdo.</p>`;
                   
    setGeneratedContent(content);
    return content;
  };
  
  // Handle field changes
  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, value } : field
    ));
  };
  
  // Handle save document
  const handleSaveDocument = () => {
    const content = generateDocumentContent();
    // In a real implementation, this would save to your backend
    console.log('Saving document with content:', content);
    toast.success('Documento guardado exitosamente');
  };
  
  // Handle generate preview
  const handleGeneratePreview = () => {
    generateDocumentContent();
    setPreviewMode('preview');
    toast.success('Vista previa generada');
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <LegalDashboardLayout>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/documents')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Documentos
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{document.title}</h1>
              <p className="text-muted-foreground">Vista previa y gestión del documento</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              <Button size="sm" onClick={handleSaveDocument}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Document Fields Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Document Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <Badge variant="secondary">{document.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {document.createdBy}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(document.createdAt).toLocaleDateString('es-PA')}
                  </div>
                </CardContent>
              </Card>
              
              {/* Version History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historial de Versiones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {versions.map((version) => (
                    <div 
                      key={version.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedVersion === version.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVersion(version.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Versión {version.versionNumber}</span>
                        <Badge className={getStatusColor(version.status)} variant="secondary">
                          {version.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        por {version.createdBy}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString('es-PA')}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Nueva Versión
                  </Button>
                </CardContent>
              </Card>
              
              {/* Document Fields Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Campos del Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.id}
                          value={field.value}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.label}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type}
                          value={field.value}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.label}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPreviewMode('edit')}
                      className={previewMode === 'edit' ? 'bg-primary/10' : ''}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleGeneratePreview}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Document Preview */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Vista Previa del Documento
                    </span>
                    <Badge variant="outline">
                      {selectedVersionData?.title || 'Documento Actual'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                  {previewMode === 'preview' ? (
                    <div className="prose prose-gray max-w-none border border-dashed border-muted rounded-lg p-6 bg-background">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: generatedContent || selectedVersionData?.content || '<p>Seleccione una versión o genere una vista previa</p>' 
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <div className="text-center">
                        <Edit3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>Modo edición activo</p>
                        <p className="text-sm">Complete los campos y haga clic en "Vista Previa"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Document Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline">
              Enviar para Revisión
            </Button>
            <Button variant="outline">
              Solicitar Firma
            </Button>
            <Button>
              Aprobar Documento
            </Button>
          </div>
        </div>
      </div>
    </LegalDashboardLayout>
  );
}
