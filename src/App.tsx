import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import LessonView from "./pages/LessonView";
import ShortVideos from "./pages/ShortVideos";
import Certificates from "./pages/Certificates";
import Checklists from "./pages/Checklists";
import Library from "./pages/Library";
import Reports from "./pages/Reports";
import Incidents from "./pages/Incidents";
import Admin from "./pages/Admin";
import Gamification from "./pages/Gamification";
import NotFound from "./pages/NotFound";
import CourseDetails from "./pages/CourseDetails";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071a3f' }}>
        <div style={{ color: '#f2f2f2' }} className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      
      {/* Redirect /lessons to /courses */}
      <Route path="/lessons" element={<Navigate to="/courses" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/courses" element={
        <ProtectedRoute>
          <Layout><Courses /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/course-details/:courseId" element={
        <ProtectedRoute>
          <Layout><CourseDetails /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/lesson/:lessonId" element={
        <ProtectedRoute>
          <Layout><LessonView /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/short-videos" element={
        <ProtectedRoute>
          <Layout><ShortVideos /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/certificates" element={
        <ProtectedRoute>
          <Layout><Certificates /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/checklists" element={
        <ProtectedRoute>
          <Layout><Checklists /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/library" element={
        <ProtectedRoute>
          <Layout><Library /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/incidents" element={
        <ProtectedRoute>
          <Layout><Incidents /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/gamification" element={
        <ProtectedRoute>
          <Layout><Gamification /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout><Admin /></Layout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
