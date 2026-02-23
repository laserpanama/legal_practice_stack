import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Calendar from "./pages/Calendar";
import ClientIntake from "./pages/ClientIntake";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import TimeTracking from "./pages/TimeTracking";
import AdminUsers from "./pages/AdminUsers";
import DocumentPreview from "./pages/DocumentPreview";
import CaseWorkflow from "./pages/CaseWorkflow";
import LexIA from "./pages/LexIA";
import DigitalSignature from "./pages/DigitalSignature";
import SignatureAuditDashboard from "./pages/SignatureAuditDashboard";
import SignatureAuditDetail from "./pages/SignatureAuditDetail";
import PaymentManagement from "./pages/PaymentManagement";
import CaseVisualization from "./pages/CaseVisualization";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/clients"} component={Clients} />
          <Route path={"/cases"} component={Cases} />
          <Route path={"/documents"} component={Documents} />
          <Route path={"/billing"} component={Billing} />
          <Route path={"/calendar"} component={Calendar} />
          <Route path={"/intake"} component={ClientIntake} />
          <Route path={"/analytics"} component={Analytics} />
          <Route path={"/settings"} component={Settings} />
          <Route path={"/time-tracking"} component={TimeTracking} />
          <Route path={"/admin/users"} component={AdminUsers} />
          <Route path={"/documents/preview"} component={DocumentPreview} />
          <Route path={"/case-workflow"} component={CaseWorkflow} />
          <Route path={"/lexia"} component={LexIA} />
          <Route path={"/digital-signature"} component={DigitalSignature} />
          <Route path={"/audit"} component={SignatureAuditDashboard} />
          <Route path={"/audit/:id"} component={SignatureAuditDetail} />
          <Route path={"/payments"} component={PaymentManagement} />
          <Route path={"/cases/visualization"} component={CaseVisualization} />
          <Route path={"/"} component={Dashboard} />
        </>
      ) : (
        <Route path={"/"} component={Home} />
      )}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
