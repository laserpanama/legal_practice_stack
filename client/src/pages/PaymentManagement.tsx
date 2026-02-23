import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Banknote, 
  Wallet, 
  Calendar, 
  User, 
  Search,
  Filter,
  Download,
  Plus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";

interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: 'PAB' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check';
  invoiceNumber: string;
  description: string;
  createdAt: string;
  paidAt?: string;
  dueDate?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

export default function PaymentManagement() {
  const [, setLocation] = useLocation();
  
  // Mock data - in real implementation, this would come from tRPC
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay-001',
      clientId: 'client-1',
      clientName: 'María González',
      amount: 1500.00,
      currency: 'PAB',
      status: 'completed',
      method: 'credit_card',
      invoiceNumber: 'INV-2025-001',
      description: 'Servicios legales - Contrato de compraventa',
      createdAt: '2025-01-10T14:30:00Z',
      paidAt: '2025-01-10T14:30:00Z'
    },
    {
      id: 'pay-002',
      clientId: 'client-2',
      clientName: 'Carlos Mendoza',
      amount: 750.50,
      currency: 'PAB',
      status: 'pending',
      method: 'bank_transfer',
      invoiceNumber: 'INV-2025-002',
      description: 'Consulta legal inicial',
      createdAt: '2025-01-12T09:15:00Z',
      dueDate: '2025-01-19T09:15:00Z'
    },
    {
      id: 'pay-003',
      clientId: 'client-3',
      clientName: 'Ana Rodríguez',
      amount: 3200.00,
      currency: 'PAB',
      status: 'completed',
      method: 'cash',
      invoiceNumber: 'INV-2025-003',
      description: 'Procedimiento judicial - Divorcio',
      createdAt: '2025-01-08T16:45:00Z',
      paidAt: '2025-01-08T16:45:00Z'
    }
  ]);
  
  const [clients] = useState<Client[]>([
    { id: 'client-1', name: 'María González', email: 'maria@example.com', phone: '6XXX-XXXX', balance: 0 },
    { id: 'client-2', name: 'Carlos Mendoza', email: 'carlos@example.com', phone: '6XXX-XXXX', balance: 750.50 },
    { id: 'client-3', name: 'Ana Rodríguez', email: 'ana@example.com', phone: '6XXX-XXXX', balance: 0 },
    { id: 'client-4', name: 'Pedro Herrera', email: 'pedro@example.com', phone: '6XXX-XXXX', balance: 0 }
  ]);
  
  // Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    clientId: '',
    amount: '',
    currency: 'PAB' as 'PAB' | 'USD',
    method: 'credit_card' as 'credit_card' | 'bank_transfer' | 'cash' | 'check',
    invoiceNumber: '',
    description: '',
    dueDate: ''
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  
  // Stats
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => 
    p.status === 'pending' && p.dueDate && new Date(p.dueDate) < new Date()
  ).length;
  
  // Filtered payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });
  
  // Handle form input changes
  const handleInputChange = (field: keyof typeof paymentForm, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle create payment
  const handleCreatePayment = () => {
    if (!paymentForm.clientId || !paymentForm.amount || !paymentForm.invoiceNumber) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    
    const client = clients.find(c => c.id === paymentForm.clientId);
    if (!client) {
      toast.error('Cliente no encontrado');
      return;
    }
    
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      clientId: paymentForm.clientId,
      clientName: client.name,
      amount: parseFloat(paymentForm.amount),
      currency: paymentForm.currency,
      status: 'pending',
      method: paymentForm.method,
      invoiceNumber: paymentForm.invoiceNumber,
      description: paymentForm.description,
      createdAt: new Date().toISOString(),
      dueDate: paymentForm.dueDate || undefined
    };
    
    setPayments([newPayment, ...payments]);
    setPaymentForm({
      clientId: '',
      amount: '',
      currency: 'PAB',
      method: 'credit_card',
      invoiceNumber: '',
      description: '',
      dueDate: ''
    });
    setShowPaymentForm(false);
    toast.success('Pago creado exitosamente');
  };
  
  // Handle payment status change
  const handlePaymentStatusChange = (paymentId: string, newStatus: Payment['status']) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: newStatus,
            paidAt: newStatus === 'completed' ? new Date().toISOString() : payment.paidAt
          }
        : payment
    ));
    toast.success(`Estado del pago actualizado a ${newStatus}`);
  };
  
  // Format currency for Panama
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get method icon
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer': return <Banknote className="w-4 h-4" />;
      case 'cash': return <Wallet className="w-4 h-4" />;
      case 'check': return <Banknote className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
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
                onClick={() => setLocation('/billing')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Facturación
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Pagos</h1>
              <p className="text-muted-foreground">Administre pagos, facturas y seguimiento de cobros</p>
            </div>
            
            <Button onClick={() => setShowPaymentForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Pago
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue, 'PAB')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Pagos Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'pending')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'PAB'
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Pagos Vencidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overduePayments}</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren seguimiento</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Clientes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Con cuentas abiertas</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Pagos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por cliente o factura..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Filtrar por Estado</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="method-filter">Filtrar por Método</Label>
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger id="method-filter">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Historial de Pagos
                </span>
                <span className="text-sm text-muted-foreground">
                  {filteredPayments.length} pagos encontrados
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No se encontraron pagos</p>
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {payment.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{payment.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                              Factura: {payment.invoiceNumber}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground ml-13">
                          {payment.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4 md:mb-0">
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {getMethodIcon(payment.method)}
                            <span className="capitalize">
                              {payment.method === 'credit_card' ? 'Tarjeta' :
                               payment.method === 'bank_transfer' ? 'Transferencia' :
                               payment.method === 'cash' ? 'Efectivo' : 'Cheque'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status === 'completed' ? 'Completado' :
                             payment.status === 'pending' ? 'Pendiente' :
                             payment.status === 'failed' ? 'Fallido' : 'Reembolsado'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(payment.createdAt).toLocaleDateString('es-PA')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatusChange(payment.id, 'completed')}
                              className="gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Marcar Pagado
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatusChange(payment.id, 'failed')}
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Marcar Fallido
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          Detalles
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Crear Nuevo Pago</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select 
                      value={paymentForm.clientId} 
                      onValueChange={(value) => handleInputChange('clientId', value)}
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Número de Factura *</Label>
                    <Input
                      id="invoiceNumber"
                      value={paymentForm.invoiceNumber}
                      onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                      placeholder="INV-2025-XXX"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto (B/.) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select 
                        value={paymentForm.currency} 
                        onValueChange={(value) => handleInputChange('currency', value as 'PAB' | 'USD')}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAB">Balboa (B/.)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Método de Pago</Label>
                    <Select 
                      value={paymentForm.method} 
                      onValueChange={(value) => handleInputChange('method', value as any)}
                    >
                      <SelectTrigger id="method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={paymentForm.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={paymentForm.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descripción del servicio o producto"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreatePayment}
                      className="flex-1"
                    >
                      Crear Pago
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LegalDashboardLayout>
  );
}
