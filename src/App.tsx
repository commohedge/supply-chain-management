import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import OverviewPage from "./pages/OverviewPage";
import SupplyPage from "./pages/SupplyPage";
import PipelinePage from "./pages/PipelinePage";
import MarketPage from "./pages/MarketPage";
import OptionalityPage from "./pages/OptionalityPage";
import FlowsPage from "./pages/FlowsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DashboardDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/supply" element={<SupplyPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/optionality" element={<OptionalityPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DashboardDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
