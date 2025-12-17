import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/mock-data";
import NotFound from "@/pages/not-found";

// Pages
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import PropertyEditorPage from "@/pages/property-editor-page";
import PropertyDetailPage from "@/pages/property-detail-page"; // New Import
import LeadsPage from "@/pages/leads-page";
import LayoutShell from "@/components/layout-shell";
import AdminPropertiesPage from "@/pages/admin-properties-page";
import AdminUsersPage from "@/pages/admin-users-page";
import ProfilePage from "@/pages/profile-page";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  
  if (!user) return <Redirect to="/auth" />;

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Public Property Detail */}
      <Route path="/properties/:id" component={PropertyDetailPage} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      
      {/* Property Management */}
      <Route path="/dashboard/properties">
        {/* For now reusing dashboard or a simple list page. Let's redirect to dashboard for list view context */}
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/dashboard/properties/new">
        <ProtectedRoute component={PropertyEditorPage} />
      </Route>
      <Route path="/dashboard/properties/:id">
        <ProtectedRoute component={PropertyEditorPage} />
      </Route>

      <Route path="/dashboard/leads">
        <ProtectedRoute component={LeadsPage} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/admin/properties">
        <ProtectedRoute component={AdminPropertiesPage} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} />
      </Route>
      <Route path="/admin/leads">
        <ProtectedRoute component={LeadsPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
