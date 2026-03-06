import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import { LanguageProvider } from "@/contexts/LanguageContext";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

import { detectedSubdomain, isCustomDomain } from '@/utils/domain';

const isCustom = isCustomDomain(window.location.hostname);

// On load, if subdomain detected and at root, redirect to /roadmap
if ((detectedSubdomain || isCustom) && window.location.pathname === '/') {
  window.history.replaceState(null, '', '/roadmap');
}
// import Index from "./pages/Index";
import NewLanding from "./pages/NewLanding";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Me from "./pages/Me";
import BuildLog from "./pages/BuildLog";
import AppsDirectory from "./pages/AppsDirectory";
import BuildLogOgDynamic from "./pages/BuildLogOgDynamic";
import Admin from "./pages/Admin";
import PublicProfile from "./pages/PublicProfile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
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
import Settings from "./pages/Settings";
import TestAnalytics from "./pages/TestAnalytics";
import Analytics from "./pages/Analytics";
import Chat from "./pages/Chat";

import ChoosePlan from "./pages/ChoosePlan";
import PaymentSuccess from "./pages/PaymentSuccess";
import { NotificationsPage } from "./pages/Notifications";
import { InAppBrowserWarning } from "./components/InAppBrowserWarning";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { MenuRouteGuard } from "./components/layout/MenuRouteGuard";
import { SurveyPopup } from "./components/beta/SurveyPopup";
import { CookieBanner } from "./components/layout/CookieBanner";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";



// queryClient is now imported from @/lib/react-query

const App = () => {



  return (
    <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InAppBrowserWarning />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsProvider>
            <CookieBanner />
            <SurveyPopup />
            <Routes>
              {/* Public routes */}
              {/* Subdomain or Custom Domain mode: clean /roadmap and /feedback routes (no slug in URL) */}
              {(detectedSubdomain || isCustom) && (
                <>
                  <Route path="/roadmap" element={<PublicRoadmap />} />
                  <Route path="/feedback" element={<PublicRoadmap />} />
                </>
              )}
              {/* Public routes - New Landing is now Official */}
              <Route path="/" element={detectedSubdomain || isCustom ? <Navigate to="/roadmap" replace /> : <NewLanding />} />
              {/* Public roadmap & feedback: /@username/app-slug/roadmap */}
              <Route path="/:handle/:appSlug/roadmap" element={<PublicRoadmap />} />
              <Route path="/:handle/:appSlug/feedback" element={<PublicRoadmap />} />
              {/* Legacy redirect */}
              <Route path="/roadmap/:appName" element={<PublicRoadmap />} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
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
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/buildlog" element={<BuildLog />} />
                  <Route path="/buildlog/og-dynamic" element={<BuildLogOgDynamic />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/connections" element={<Vibers />} />
                  <Route path="/me" element={<Navigate to="/me/profile" replace />} />
                  <Route path="/me/profile" element={<Me />} />
                  <Route path="/me/branding" element={<Me />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Private Apps Management - Moved to /me/apps */}
                  <Route path="/me/apps" element={<MyApps />} />
                  <Route path="/me/apps/:appId" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/roadmap" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/feedback" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/squad" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/founders" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/banners" element={<MyAppHub />} />
                  <Route path="/me/apps/:appId/banners/:bannerId" element={<MyAppHub />} />

                  {/* Public Apps Discovery - New /apps route */}
                  <Route path="/apps" element={<AppsDirectory />} />
                  <Route path="/apps/:filter" element={<AppsDirectory />} />
                  
                  {/* Redirects for legacy app management and partnerships */}
                  <Route path="/partnerships" element={<Navigate to="/apps/open-to-partnerships" replace />} />
                  <Route path="/public-beta-testing" element={<BetaSquads />} />

                  <Route path="/my-apps" element={<Navigate to="/me/apps" replace />} />
                  <Route path="/my-apps/:appId" element={<Navigate to="/me/apps" replace />} />
                  <Route path="/beta-testing" element={<Navigate to="/me/apps" replace />} />
                  <Route path="/beta-testing/:appId" element={<Navigate to="/me/apps" replace />} />
                  <Route path="/ideas" element={<Ideas />} />
                  <Route path="/ideas/new" element={<Ideas />} />
                  <Route path="/ideas/:ideaId" element={<Ideas />} />
                  <Route path="/roadmap" element={<Navigate to="/me/apps" replace />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/prompts/new" element={<PromptStudio />} />
                  <Route path="/prompts/:id" element={<PromptViewer />} />
                  <Route path="/prompts/:id/edit" element={<PromptStudio />} />
                  <Route path="/app/:appId" element={<AppDetail />} />
                  <Route path="/roadmap-editor/:appId" element={<RoadmapEditor />} />
                  <Route path="/test-sdk" element={<TestAnalytics />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/:appId" element={<Analytics />} />
                  {/* Chat — hidden from menu */}
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:conversationId" element={<Chat />} />
                  {/* Legacy redirect */}
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
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;
