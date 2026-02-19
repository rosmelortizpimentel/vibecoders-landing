import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Subdomain detection: if user visits scalein.vibecoders.la, redirect to /roadmap/scalein
const BASE_DOMAINS = ['vibecoders.la', 'vibecoders-la.lovable.app', 'localhost'];
function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  for (const base of BASE_DOMAINS) {
    if (hostname.endsWith(base) && hostname !== base && hostname !== `www.${base}`) {
      const sub = hostname.replace(`.${base}`, '');
      if (sub && !sub.includes('.')) return sub;
    }
  }
  return null;
}

// On load, if subdomain detected, rewrite URL to /roadmap/:slug
const detectedSubdomain = getSubdomain();
if (detectedSubdomain && !window.location.pathname.startsWith('/roadmap/')) {
  window.history.replaceState(null, '', `/roadmap/${detectedSubdomain}`);
}
// import Index from "./pages/Index";
import NewLanding from "./pages/NewLanding";
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
import Roadmap from "./pages/Roadmap";
import Prompts from "./pages/Prompts";
import PromptStudio from "./pages/prompts/PromptStudio";
import PromptViewer from "./pages/prompts/PromptViewer";
import Beta from "./pages/Beta";
import Vibers from "./pages/Vibers";
import RoadmapEditor from "./pages/RoadmapEditor";
import PublicRoadmap from "./pages/PublicRoadmap";
import MyApps from "./pages/MyApps";
import MyAppHub from "./pages/MyAppHub";

import ChoosePlan from "./pages/ChoosePlan";
import PaymentSuccess from "./pages/PaymentSuccess";
import { NotificationsPage } from "./pages/Notifications";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { MenuRouteGuard } from "./components/layout/MenuRouteGuard";
import { SurveyPopup } from "./components/beta/SurveyPopup";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InAppBrowserWarning />
        <SurveyPopup />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          {/* Public routes - New Landing is now Official */}
          <Route path="/" element={<NewLanding />} />
          {/* Public roadmap & feedback: /@username/app-slug/roadmap */}
          <Route path="/:handle/:appSlug/roadmap" element={<PublicRoadmap />} />
          <Route path="/:handle/:appSlug/feedback" element={<PublicRoadmap />} />
          {/* Legacy redirect */}
          <Route path="/roadmap/:appName" element={<PublicRoadmap />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/post/:slug" element={<Post />} />
          
          
          
          {/* Plan selection & payment */}
          <Route path="/choose-plan" element={<ChoosePlan />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Admin routes - protected by Admin component */}
          <Route path="/admin/*" element={<Admin />} />
          


          

          {/* Authenticated routes with shared layout (persistent header/footer) */}
          <Route element={<DashboardLayout />}>
            <Route element={<MenuRouteGuard />}>
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Projects />} />
              <Route path="/public-beta-testing" element={<BetaSquads />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/buildlog" element={<BuildLog />} />
              <Route path="/buildlog/og-dynamic" element={<BuildLogOgDynamic />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/connections" element={<Vibers />} />
              <Route path="/me" element={<Navigate to="/me/profile" replace />} />
              <Route path="/me/profile" element={<Me />} />
              <Route path="/me/branding" element={<Me />} />
              {/* New: Apps hub */}
              <Route path="/apps" element={<MyApps />} />
              <Route path="/apps/:appId" element={<MyAppHub />} />
              <Route path="/apps/:appId/roadmap" element={<MyAppHub />} />
              <Route path="/apps/:appId/feedback" element={<MyAppHub />} />
              <Route path="/apps/:appId/squad" element={<MyAppHub />} />
              {/* Legacy routes kept for backward compat */}
              <Route path="/my-apps" element={<Navigate to="/apps" replace />} />
              <Route path="/my-apps/:appId" element={<Navigate to="/apps" replace />} />
              <Route path="/beta-testing" element={<Navigate to="/apps" replace />} />
              <Route path="/beta-testing/:appId" element={<Navigate to="/apps" replace />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/ideas/new" element={<Ideas />} />
              <Route path="/ideas/:ideaId" element={<Ideas />} />
              <Route path="/roadmap" element={<Navigate to="/apps" replace />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/prompts/new" element={<PromptStudio />} />
              <Route path="/prompts/:id" element={<PromptViewer />} />
              <Route path="/prompts/:id/edit" element={<PromptStudio />} />
              <Route path="/app/:appId" element={<AppDetail />} />
              <Route path="/roadmap-editor/:appId" element={<RoadmapEditor />} />
              {/* Legacy redirect */}
              <Route path="/me/apps" element={<Navigate to="/apps" replace />} />
            </Route>
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
