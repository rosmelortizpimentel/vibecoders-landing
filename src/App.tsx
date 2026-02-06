import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Me from "./pages/Me";
import BuildLog from "./pages/BuildLog";
import BuildLogOgDynamic from "./pages/BuildLogOgDynamic";
import Admin from "./pages/Admin";
import PublicProfile from "./pages/PublicProfile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Projects from "./pages/Projects";
import Tools from "./pages/Tools";
import Feedback from "./pages/Feedback";
import AppDetail from "./pages/AppDetail";
import Post from "./pages/Post";
import BetaSquads from "./pages/BetaSquads";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InAppBrowserWarning />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/app/:appId" element={<AppDetail />} />
          
          {/* Admin routes - protected by Admin component */}
          <Route path="/admin/*" element={<Admin />} />
          
          {/* Authenticated routes with shared layout (persistent header/footer) */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/startups" element={<Projects />} />
            <Route path="/beta-squads" element={<BetaSquads />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/buildlog" element={<BuildLog />} />
            <Route path="/buildlog/og-dynamic" element={<BuildLogOgDynamic />} />
            <Route path="/hablemos" element={<Feedback />} />
            <Route path="/me" element={<Navigate to="/me/profile" replace />} />
            <Route path="/me/profile" element={<Me />} />
            <Route path="/me/apps" element={<Me />} />
            <Route path="/me/branding" element={<Me />} />
            <Route path="/me/beta" element={<Me />} />
            <Route path="/me/ideas" element={<Me />} />
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
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
