import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "./pages/StartScreen";
import OfflineSetup from "./pages/OfflineSetup";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import OnlineLobby from "./pages/OnlineLobby";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/offline-setup" element={<OfflineSetup />} />
          <Route path="/game" element={<Game />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/online-lobby" element={<OnlineLobby />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
