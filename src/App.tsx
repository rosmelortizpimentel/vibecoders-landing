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
import Ideas from "./pages/Ideas";
import Beta from "./pages/Beta";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";
import { DashboardLayout } from "./layouts/DashboardLayout";

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

          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/app/:appId" element={<AppDetail />} />
          
          {/* Admin routes - protected by Admin component */}
          <Route path="/admin/*" element={<Admin />} />
          


          {/* Authenticated routes with shared layout (persistent header/footer) */}
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Projects />} />
            <Route path="/public-beta-testing" element={<BetaSquads />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/buildlog" element={<BuildLog />} />
            <Route path="/buildlog/og-dynamic" element={<BuildLogOgDynamic />} />
            <Route path="/hablemos" element={<Feedback />} />
            <Route path="/me" element={<Navigate to="/me/profile" replace />} />
            <Route path="/me/profile" element={<Me />} />
            <Route path="/me/apps" element={<Me />} />
            <Route path="/me/branding" element={<Me />} />
            {/* Cleaner routes for Ideas and Beta Management */}
            <Route path="/beta-testing" element={<Beta />} />
            <Route path="/beta-testing/:appId" element={<Beta />} />
            <Route path="/ideas" element={<Ideas />} />
          </Route>
          
          {/* Legacy redirects */}
          <Route path="/inspiration" element={<Navigate to="/explore" replace />} />
          <Route path="/projects" element={<Navigate to="/explore" replace />} />
          <Route path="/startups" element={<Navigate to="/explore" replace />} />
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
