import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminImages from "./pages/admin/AdminImages";
import AdminContent from "./pages/admin/AdminContent";
import AdminAchievements from "./pages/admin/AdminAchievements";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminPrograms from "./pages/admin/AdminPrograms";
import AdminInfrastructure from "./pages/admin/AdminInfrastructure";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/images" element={<AdminImages />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/achievements" element={<AdminAchievements />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/faculty" element={<AdminFaculty />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/infrastructure" element={<AdminInfrastructure />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
