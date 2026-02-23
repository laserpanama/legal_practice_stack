import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const metrics = [
    {
      title: "Active Cases",
      value: "12",
      description: "Cases in progress",
      icon: Briefcase,
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Clients",
      value: "48",
      description: "Active clients",
      icon: Users,
      color: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Hours This Month",
      value: "156",
      description: "Billable hours",
      icon: Clock,
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Outstanding Invoices",
      value: "B/.45,200",
      description: "Awaiting payment",
      icon: DollarSign,
      color: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  const recentCases = [
    {
      id: 1,
      caseNumber: "CASE-2025-001",
      title: "Corporate Restructuring - TechCorp S.A.",
      client: "Juan Pérez",
      status: "In Progress",
      priority: "High",
    },
    {
      id: 2,
      caseNumber: "CASE-2025-002",
      title: "Contract Dispute Resolution",
      client: "Maria García",
      status: "Pending Review",
      priority: "Medium",
    },
    {
      id: 3,
      caseNumber: "CASE-2025-003",
      title: "Employment Law Matter",
      client: "Carlos López",
      status: "In Progress",
      priority: "Medium",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      title: "Client Meeting - TechCorp",
      time: "Today at 2:00 PM",
      client: "Juan Pérez",
    },
    {
      id: 2,
      title: "Court Hearing",
      time: "Tomorrow at 10:00 AM",
      client: "Maria García",
    },
    {
      id: 3,
      title: "Document Review",
      time: "Friday at 3:30 PM",
      client: "Carlos López",
    },
  ];

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back! Here's your practice overview.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/clients")}>
              New Client
            </Button>
            <Button onClick={() => navigate("/cases")}>
              New Case
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <div className={`rounded-lg p-2 ${metric.color}`}>
                      <Icon className={`h-4 w-4 ${metric.iconColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Cases */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>Your active cases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="flex items-start justify-between rounded-lg border border-border/50 p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {caseItem.caseNumber}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            caseItem.priority === "High"
                              ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                          }`}
                        >
                          {caseItem.priority}
                        </span>
                      </div>
                      <h3 className="mt-1 font-semibold text-foreground">{caseItem.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{caseItem.client}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          caseItem.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => navigate("/cases")}
              >
                View All Cases
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Next 3 scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-border/50 p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {appointment.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        <p className="text-xs text-muted-foreground">{appointment.client}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => navigate("/calendar")}
              >
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Pending Actions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
              <li>• 3 invoices pending payment (B/.45,200)</li>
              <li>• 2 documents awaiting client signature</li>
              <li>• 1 court filing deadline in 5 days</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </LegalDashboardLayout>
  );
}
