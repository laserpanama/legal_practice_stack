import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Plus, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";

interface TimeEntry {
  id: number;
  caseId: number;
  caseName: string;
  description: string;
  duration: number; // in minutes
  billableRate: number; // in cents (Balboa)
  isBillable: boolean;
  date: string;
  status: "draft" | "submitted" | "approved";
}

export default function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: 1,
      caseId: 1,
      caseName: "Corporate Restructuring - TechCorp S.A.",
      description: "Initial consultation and case review",
      duration: 120,
      billableRate: 10000, // B/.100.00 per hour
      isBillable: true,
      date: "2025-01-10",
      status: "approved",
    },
    {
      id: 2,
      caseId: 2,
      caseName: "Contract Dispute Resolution",
      description: "Document review and legal research",
      duration: 90,
      billableRate: 10000,
      isBillable: true,
      date: "2025-01-10",
      status: "submitted",
    },
    {
      id: 3,
      caseId: 1,
      caseName: "Corporate Restructuring - TechCorp S.A.",
      description: "Client meeting preparation",
      duration: 60,
      billableRate: 10000,
      isBillable: false,
      date: "2025-01-09",
      status: "draft",
    },
  ]);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [newEntry, setNewEntry] = useState({
    caseId: "1",
    description: "",
    duration: 0,
    billableRate: 10000,
    isBillable: true,
  });

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    toast.success("Timer started");
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    toast.info("Timer paused");
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setTimerDuration(0);
    toast.success("Timer stopped");
  };

  const handleAddEntry = () => {
    if (!newEntry.description) {
      toast.error("Please enter a description");
      return;
    }

    if (newEntry.duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    const entry: TimeEntry = {
      id: Math.max(...timeEntries.map((e) => e.id), 0) + 1,
      caseId: parseInt(newEntry.caseId),
      caseName: "Case Name",
      description: newEntry.description,
      duration: newEntry.duration,
      billableRate: newEntry.billableRate,
      isBillable: newEntry.isBillable,
      date: new Date().toISOString().split("T")[0],
      status: "draft",
    };

    setTimeEntries([entry, ...timeEntries]);
    setNewEntry({
      caseId: "1",
      description: "",
      duration: 0,
      billableRate: 10000,
      isBillable: true,
    });
    toast.success("Time entry added");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (cents: number) => {
    return `B/.${(cents / 100).toFixed(2)}`;
  };

  const calculateAmount = (duration: number, rate: number) => {
    const hours = duration / 60;
    return Math.round(hours * rate);
  };

  const totalBillableHours = timeEntries
    .filter((e) => e.isBillable && e.status === "approved")
    .reduce((sum, e) => sum + e.duration, 0);

  const totalBillableAmount = timeEntries
    .filter((e) => e.isBillable && e.status === "approved")
    .reduce((sum, e) => sum + calculateAmount(e.duration, e.billableRate), 0);

  const totalPendingAmount = timeEntries
    .filter((e) => e.isBillable && e.status === "submitted")
    .reduce((sum, e) => sum + calculateAmount(e.duration, e.billableRate), 0);

  return (
    <LegalDashboardLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
            <p className="text-muted-foreground mt-2">Log billable hours and track time entries</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Billable Hours (Approved)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(totalBillableHours)}</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Billable Amount (Approved)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBillableAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to invoice</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  Pending Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Timer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Timer</CardTitle>
              <CardDescription>Start a timer for current work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-6 bg-muted rounded-lg">
                <div className="text-4xl font-mono font-bold text-foreground">
                  {formatDuration(timerDuration)}
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning ? (
                    <Button onClick={handleStartTimer} className="gap-2">
                      <Play className="w-4 h-4" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={handlePauseTimer} variant="outline" className="gap-2">
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={handleStopTimer} variant="outline" className="gap-2">
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Time Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Add Time Entry</CardTitle>
              <CardDescription>Log a new time entry manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case">Case</Label>
                  <Select value={newEntry.caseId} onValueChange={(value) => setNewEntry({ ...newEntry, caseId: value })}>
                    <SelectTrigger id="case">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Corporate Restructuring - TechCorp S.A.</SelectItem>
                      <SelectItem value="2">Contract Dispute Resolution</SelectItem>
                      <SelectItem value="3">Intellectual Property Matter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={newEntry.duration}
                    onChange={(e) => setNewEntry({ ...newEntry, duration: parseInt(e.target.value) || 0 })}
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Describe the work performed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Billable Rate (B/. per hour)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    value={newEntry.billableRate / 100}
                    onChange={(e) => setNewEntry({ ...newEntry, billableRate: Math.round(parseFloat(e.target.value) * 100) })}
                    placeholder="100.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billable">Billable</Label>
                  <Select value={newEntry.isBillable ? "yes" : "no"} onValueChange={(value) => setNewEntry({ ...newEntry, isBillable: value === "yes" })}>
                    <SelectTrigger id="billable">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes (Billable)</SelectItem>
                      <SelectItem value="no">No (Non-billable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddEntry} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            </CardContent>
          </Card>

          {/* Time Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>Recent time entries and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{entry.caseName}</p>
                        <Badge variant={entry.isBillable ? "default" : "secondary"}>
                          {entry.isBillable ? "Billable" : "Non-billable"}
                        </Badge>
                        <Badge
                          variant={
                            entry.status === "approved"
                              ? "default"
                              : entry.status === "submitted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">{formatDuration(entry.duration)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(calculateAmount(entry.duration, entry.billableRate))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LegalDashboardLayout>
  );
}
