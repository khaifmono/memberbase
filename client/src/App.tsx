import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAdminAuth, useMemberAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import AdminLogin from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Members from "@/pages/admin/Members";
import Lookups from "@/pages/admin/Lookups";
import AuditLogs from "@/pages/admin/Audit";
import MemberProfile from "@/pages/member/Profile";
import NotFound from "@/pages/not-found";

// Protected Admin Route Wrapper
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!admin) return <Redirect to="/admin/login" />;

  return <Component />;
}

// Protected Member Route Wrapper
function MemberRoute({ component: Component }: { component: React.ComponentType }) {
  const { member, isLoading } = useMemberAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!member) return <Redirect to="/" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Protected Routes */}
      <Route path="/admin/dashboard">
        {() => <AdminRoute component={Dashboard} />}
      </Route>
      <Route path="/admin/members">
        {() => <AdminRoute component={Members} />}
      </Route>
      <Route path="/admin/lookups">
        {() => <AdminRoute component={Lookups} />}
      </Route>
      <Route path="/admin/audit">
        {() => <AdminRoute component={AuditLogs} />}
      </Route>

      {/* Member Protected Routes */}
      <Route path="/member/profile">
        {() => <MemberRoute component={MemberProfile} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
