import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Kanban, 
  CalendarDays, 
  Plus, 
  Search,
  Filter,
  Eye,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";

interface Case {
  id: string;
  title: string;
  caseNumber: string;
  clientName: string;
  lawyerName: string;
  status: 'open' | 'in-progress' | 'pending-review' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  description: string;
}

export default function CaseVisualization() {
  const [, setLocation] = useLocation();
  
  // Mock data - in real implementation, this would come from tRPC
  const [cases] = useState<Case[]>([
    {
      id: 'case-001',
      title: 'Divorcio Contencioso',
      caseNumber: 'EXP-2025-001',
      clientName: 'María González',
      lawyerName: 'Pío López',
      status: 'in-progress',
      priority: 'high',
      type: 'Familiar',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z',
      dueDate: '2025-02-15T00:00:00Z',
      description: 'Procedimiento de divorcio con disputa de bienes'
    },
    {
      id: 'case-002',
      title: 'Contrato de Compraventa',
      caseNumber: 'EXP-2025-002',
      clientName: 'Carlos Mendoza',
      lawyerName: 'Ana Rodríguez',
      status: 'pending-review',
      priority: 'medium',
      type: 'Civil',
      createdAt: '2025-01-05T09:15:00Z',
      updatedAt: '2025-01-14T16:45:00Z',
      description: 'Redacción y revisión de contrato de compraventa inmobiliaria'
    },
    {
      id: 'case-003',
      title: 'Juicio Laboral',
      caseNumber: 'EXP-2025-003',
      clientName: 'Pedro Herrera',
      lawyerName: 'María García',
      status: 'open',
      priority: 'urgent',
      type: 'Laboral',
      createdAt: '2025-01-10T11:30:00Z',
      updatedAt: '2025-01-10T11:30:00Z',
      dueDate: '2025-01-25T00:00:00Z',
      description: 'Demanda por despido injustificado'
    },
    {
      id: 'case-004',
      title: 'Sucesión Testamentaria',
      caseNumber: 'EXP-2025-004',
      clientName: 'Ana Rodríguez',
      lawyerName: 'Pío López',
      status: 'closed',
      priority: 'low',
      type: 'Civil',
      createdAt: '2024-12-15T14:20:00Z',
      updatedAt: '2025-01-12T09:15:00Z',
      description: 'Trámite de sucesión por testamento'
    },
    {
      id: 'case-005',
      title: 'Contrato de Servicios',
      caseNumber: 'EXP-2025-005',
      clientName: 'Empresa ABC S.A.',
      lawyerName: 'Carlos Mendoza',
      status: 'in-progress',
      priority: 'medium',
      type: 'Mercantil',
      createdAt: '2025-01-08T13:45:00Z',
      updatedAt: '2025-01-13T11:20:00Z',
      dueDate: '2025-02-08T00:00:00Z',
      description: 'Elaboración de contrato de servicios profesionales'
    }
  ]);
  
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Group cases by status for Kanban view
  const kanbanColumns = [
    { id: 'open', title: 'Abierto', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { id: 'in-progress', title: 'En Progreso', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { id: 'pending-review', title: 'Pendiente Revisión', color: 'text-orange-100', textColor: 'text-orange-800' },
    { id: 'closed', title: 'Cerrado', color: 'bg-green-100', textColor: 'text-green-800' }
  ];
  
  // Filter cases based on search term
  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending-review': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get cases for each column
  const getColumnCases = (columnId: string) => {
    return filteredCases.filter(c => c.status === columnId);
  };
  
  // Format date for Panama
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PA');
  };
  
  return (
    <LegalDashboardLayout>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/cases')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Casos
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Visualización de Casos</h1>
              <p className="text-muted-foreground">Gestione sus casos con vistas Kanban o Timeline</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={viewMode === 'kanban' ? 'default' : 'outline'} 
                onClick={() => setViewMode('kanban')}
                className="gap-2"
              >
                <Kanban className="w-4 h-4" />
                Kanban
              </Button>
              <Button 
                variant={viewMode === 'timeline' ? 'default' : 'outline'} 
                onClick={() => setViewMode('timeline')}
                className="gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Timeline
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Caso
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por título, número de caso o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Más Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kanbanColumns.map(column => (
                <div key={column.id} className="space-y-4">
                  <div className={`p-3 rounded-lg ${column.color}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${column.textColor}`}>
                        {column.title}
                      </h3>
                      <Badge variant="secondary">
                        {getColumnCases(column.id).length}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {getColumnCases(column.id).map(caseItem => (
                      <Card 
                        key={caseItem.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setLocation(`/cases/${caseItem.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base line-clamp-1">
                                {caseItem.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {caseItem.caseNumber}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">{caseItem.clientName}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge className={getPriorityColor(caseItem.priority)} variant="secondary">
                                {caseItem.priority === 'low' ? 'Baja' :
                                 caseItem.priority === 'medium' ? 'Media' :
                                 caseItem.priority === 'high' ? 'Alta' : 'Urgente'}
                              </Badge>
                              <Badge className={getStatusColor(caseItem.status)} variant="outline">
                                {caseItem.status === 'open' ? 'Abierto' :
                                 caseItem.status === 'in-progress' ? 'En Progreso' :
                                 caseItem.status === 'pending-review' ? 'Revisión' : 'Cerrado'}
                              </Badge>
                            </div>
                            
                            {caseItem.dueDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Vence: {formatDate(caseItem.dueDate)}</span>
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Actualizado: {formatDate(caseItem.updatedAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {getColumnCases(column.id).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No hay casos en esta columna</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Timeline de Casos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredCases
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((caseItem, index) => (
                      <div key={caseItem.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="w-0.5 h-full bg-border"></div>
                        </div>
                        
                        <div className="flex-1 pb-8">
                          <Card 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setLocation(`/cases/${caseItem.id}`)}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle>{caseItem.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {caseItem.caseNumber} • {caseItem.clientName}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge className={getPriorityColor(caseItem.priority)} variant="secondary">
                                    {caseItem.priority === 'low' ? 'Baja' :
                                     caseItem.priority === 'medium' ? 'Media' :
                                     caseItem.priority === 'high' ? 'Alta' : 'Urgente'}
                                  </Badge>
                                  <Badge className={getStatusColor(caseItem.status)}>
                                    {caseItem.status === 'open' ? 'Abierto' :
                                     caseItem.status === 'in-progress' ? 'En Progreso' :
                                     caseItem.status === 'pending-review' ? 'Revisión' : 'Cerrado'}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4">
                                {caseItem.description}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span>Abogado: {caseItem.lawyerName}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>Creado: {formatDate(caseItem.createdAt)}</span>
                                </div>
                                
                                {caseItem.dueDate && (
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                    <span>Vence: {formatDate(caseItem.dueDate)}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  
                  {filteredCases.length === 0 && (
                    <div className="text-center py-12">
                      <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No se encontraron casos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Casos Abiertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.status === 'open').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">En espera de acción</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  En Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.status === 'in-progress').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Activamente trabajando</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Cerrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.status === 'closed').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completados este mes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Urgentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.priority === 'urgent').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requieren atención inmediata</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LegalDashboardLayout>
  );
}
