import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Me from "./pages/Me";
import PublicProfile from "./pages/PublicProfile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Inspiration from "./pages/Inspiration";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InAppBrowserWarning />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          {/* Me dashboard routes with sub-paths */}
          <Route path="/me" element={<Navigate to="/me/profile" replace />} />
          <Route path="/me/profile" element={<Me />} />
          <Route path="/me/apps" element={<Me />} />
          <Route path="/me/branding" element={<Me />} />
          {/* Legal pages - must be before /:handle to avoid conflicts */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          {/* Community Showcase */}
          <Route path="/inspiration" element={<Inspiration />} />
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
