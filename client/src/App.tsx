import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import UserManagement from "@/pages/user-management";
import ContentModeration from "@/pages/content-moderation";
import SystemAnalytics from "@/pages/system-analytics";
import FeatureConfiguration from "@/pages/feature-configuration";
import ComplianceReporting from "@/pages/compliance-reporting";
import Market from "@/pages/market";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/users" component={UserManagement} />
      <ProtectedRoute path="/content" component={ContentModeration} />
      <ProtectedRoute path="/analytics" component={SystemAnalytics} />
      <ProtectedRoute path="/features" component={FeatureConfiguration} />
      <ProtectedRoute path="/compliance" component={ComplianceReporting} />
      <ProtectedRoute path="/market" component={Market} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
