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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

const appointments = [
  {
    id: 1,
    title: "Client Meeting - TechCorp",
    type: "Meeting",
    date: "2025-01-22",
    startTime: "14:00",
    endTime: "15:00",
    location: "Law Office, Panama City",
    client: "Juan Pérez",
    caseNumber: "CASE-2025-001",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Court Hearing",
    type: "Court Hearing",
    date: "2025-01-23",
    startTime: "10:00",
    endTime: "11:30",
    location: "Supreme Court of Panama",
    client: "Maria García",
    caseNumber: "CASE-2025-002",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Document Review",
    type: "Review",
    date: "2025-01-24",
    startTime: "15:30",
    endTime: "16:30",
    location: "Law Office, Panama City",
    client: "Carlos López",
    caseNumber: "CASE-2025-003",
    status: "scheduled",
  },
  {
    id: 4,
    title: "Deposition - Witness Interview",
    type: "Deposition",
    date: "2025-01-25",
    startTime: "09:00",
    endTime: "11:00",
    location: "Conference Room B",
    client: "TechCorp S.A.",
    caseNumber: "CASE-2025-001",
    status: "scheduled",
  },
  {
    id: 5,
    title: "Settlement Negotiation",
    type: "Negotiation",
    date: "2025-01-26",
    startTime: "13:00",
    endTime: "14:30",
    location: "Neutral Location",
    client: "Maria García",
    caseNumber: "CASE-2025-002",
    status: "scheduled",
  },
];

export default function Calendar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Court Hearing":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "Meeting":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "Deposition":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "Negotiation":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today;
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today;
  });

  return (
    <LegalDashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="mt-1 text-muted-foreground">
              Schedule and manage appointments, hearings, and events.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>
                  Create a new appointment or event.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="apt-title">Title *</Label>
                  <Input id="apt-title" placeholder="Client Meeting" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apt-type">Type</Label>
                  <select
                    id="apt-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select type</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Court Hearing">Court Hearing</option>
                    <option value="Deposition">Deposition</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="apt-date">Date *</Label>
                    <Input id="apt-date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apt-time">Time *</Label>
                    <Input id="apt-time" type="time" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apt-location">Location</Label>
                  <Input id="apt-location" placeholder="Law Office, Panama City" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apt-client">Client/Party</Label>
                  <Input id="apt-client" placeholder="Client name" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apt-case">Case Number</Label>
                  <Input id="apt-case" placeholder="CASE-2025-001" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apt-description">Description</Label>
                  <textarea
                    id="apt-description"
                    placeholder="Additional details..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>

                <Button className="w-full" onClick={() => {
                  toast.success("Appointment scheduled successfully");
                  setIsDialogOpen(false);
                }}>
                  Schedule Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                <div className="mt-2 text-muted-foreground">No upcoming appointments</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Schedule an appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-border/50 p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{apt.title}</h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(
                              apt.type
                            )}`}
                          >
                            {apt.type}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(apt.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {apt.startTime} - {apt.endTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {apt.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {apt.client} • {apt.caseNumber}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>
                {pastAppointments.length} past appointment{pastAppointments.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastAppointments.map((apt) => (
                      <TableRow key={apt.id} className="border-border hover:bg-accent/50 opacity-75">
                        <TableCell className="text-muted-foreground">
                          {formatDate(apt.date)}
                        </TableCell>
                        <TableCell className="font-medium">{apt.title}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(
                              apt.type
                            )}`}
                          >
                            {apt.type}
                          </span>
                        </TableCell>
                        <TableCell>{apt.client}</TableCell>
                        <TableCell className="font-mono text-sm">{apt.caseNumber}</TableCell>
                        <TableCell className="text-muted-foreground">{apt.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LegalDashboardLayout>
  );
}
