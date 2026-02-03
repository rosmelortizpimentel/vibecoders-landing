import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Me from "./pages/Me";
import Admin from "./pages/Admin";
import PublicProfile from "./pages/PublicProfile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Projects from "./pages/Projects";
import Tools from "./pages/Tools";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InAppBrowserWarning />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Admin routes - protected by Admin component */}
          <Route path="/admin/*" element={<Admin />} />
          
          {/* Authenticated routes with shared layout (persistent header/footer) */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/startups" element={<Projects />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/me" element={<Navigate to="/me/profile" replace />} />
            <Route path="/me/profile" element={<Me />} />
            <Route path="/me/apps" element={<Me />} />
            <Route path="/me/branding" element={<Me />} />
          </Route>
          
          {/* Legacy redirects */}
          <Route path="/inspiration" element={<Navigate to="/startups" replace />} />
          <Route path="/projects" element={<Navigate to="/startups" replace />} />
          <Route path="/stack" element={<Navigate to="/tools" replace />} />
          
          {/* Public profile route - captures /@username, validated in component */}
          <Route path="/:handle" element={<PublicProfile />} />
          
          {/* Redirect all unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
