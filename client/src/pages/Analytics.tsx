import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Briefcase, DollarSign, Clock } from "lucide-react";

// Mock data for charts
const caseMetricsData = [
  { month: "Jan", active: 8, closed: 2, pending: 3 },
  { month: "Feb", active: 10, closed: 3, pending: 4 },
  { month: "Mar", active: 12, closed: 4, pending: 5 },
  { month: "Apr", active: 11, closed: 5, pending: 6 },
  { month: "May", active: 13, closed: 6, pending: 4 },
  { month: "Jun", active: 12, closed: 7, pending: 3 },
];

const billingData = [
  { month: "Jan", invoiced: 45000, paid: 42000, pending: 3000 },
  { month: "Feb", invoiced: 52000, paid: 50000, pending: 2000 },
  { month: "Mar", invoiced: 48000, paid: 48000, pending: 0 },
  { month: "Apr", invoiced: 61000, paid: 58000, pending: 3000 },
  { month: "May", invoiced: 55000, paid: 52000, pending: 3000 },
  { month: "Jun", invoiced: 67000, paid: 65000, pending: 2000 },
];

const timeTrackingData = [
  { month: "Jan", billable: 140, nonBillable: 20 },
  { month: "Feb", billable: 155, nonBillable: 25 },
  { month: "Mar", billable: 150, nonBillable: 30 },
  { month: "Apr", billable: 165, nonBillable: 20 },
  { month: "May", billable: 158, nonBillable: 22 },
  { month: "Jun", billable: 170, nonBillable: 18 },
];

const caseTypeDistribution = [
  { name: "Corporate Law", value: 35, color: "#3b82f6" },
  { name: "Family Law", value: 25, color: "#8b5cf6" },
  { name: "Criminal Law", value: 20, color: "#ef4444" },
  { name: "Real Estate", value: 15, color: "#10b981" },
  { name: "Other", value: 5, color: "#6b7280" },
];

const lawyerProductivity: Array<{ lawyer: string; cases: number; hours: number; billable: number }> = [
  { lawyer: "Juan Pérez", cases: 12, hours: 156, billable: 145 },
  { lawyer: "María García", cases: 10, hours: 142, billable: 135 },
  { lawyer: "Carlos López", cases: 8, hours: 128, billable: 120 },
  { lawyer: "Ana Rodríguez", cases: 9, hours: 135, billable: 128 },
];

export default function Analytics() {
  const totalCases = 12;
  const activeCases = 12;
  const totalClients = 48;
  const totalBilled = 328000; // in cents, so 3,280 Balboas
  const totalHours = 760;
  const billableRate = 95.5; // percentage

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="mt-1 text-muted-foreground">
            Comprehensive insights into practice performance, billing, and case management metrics.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Total Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCases}</div>
              <p className="text-xs text-green-600 mt-1">↑ 2 this month</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Active Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeCases}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalClients}</div>
              <p className="text-xs text-green-600 mt-1">↑ 5 this month</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Billed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">B/.{(totalBilled / 100).toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">↑ 8% vs last month</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Billable Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{billableRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of total hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Case Metrics (6 Months)</CardTitle>
                <CardDescription>
                  Track active, closed, and pending cases over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={caseMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="active" stroke="#3b82f6" name="Active" />
                    <Line type="monotone" dataKey="closed" stroke="#10b981" name="Closed" />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Billing Revenue (6 Months)</CardTitle>
                <CardDescription>
                  Invoiced, paid, and pending amounts in Panamanian Balboas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={billingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `B/.${((value as number) / 100).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="invoiced" fill="#3b82f6" name="Invoiced" />
                    <Bar dataKey="paid" fill="#10b981" name="Paid" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Tracking Tab */}
          <TabsContent value="time">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Time Tracking (6 Months)</CardTitle>
                <CardDescription>
                  Billable vs non-billable hours tracked.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeTrackingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="billable" fill="#3b82f6" name="Billable Hours" />
                    <Bar dataKey="nonBillable" fill="#e5e7eb" name="Non-Billable Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Case Type Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of cases by legal practice area.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={caseTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {caseTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Lawyer Productivity</CardTitle>
                  <CardDescription>
                    Cases, hours, and billable hours per lawyer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lawyerProductivity.map((lawyer) => (
                      <div key={lawyer.lawyer} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{lawyer.lawyer}</span>
                          <span className="text-xs text-muted-foreground">{lawyer.cases} cases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${((lawyer.billable as number) / (lawyer.hours as number)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(((lawyer.billable as number) / (lawyer.hours as number)) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Compliance Report */}
        <Card className="border-border bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Ley 81 Compliance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              ✓ <strong>Data Processing Activities:</strong> 1,247 recorded and audited
            </p>
            <p>
              ✓ <strong>Consent Records:</strong> 48 clients with documented consent
            </p>
            <p>
              ✓ <strong>Audit Trail Entries:</strong> 5,892 logged for compliance
            </p>
            <p>
              ✓ <strong>Data Breaches:</strong> 0 incidents reported
            </p>
            <p>
              ✓ <strong>Security Measures:</strong> AES-256 encryption, role-based access control, automated backups
            </p>
          </CardContent>
        </Card>
      </div>
    </LegalDashboardLayout>
  );
}
