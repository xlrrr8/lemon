import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Play from "./pages/Play";
import DailyPuzzle from "./pages/DailyPuzzle";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme-provider";

const App = () => (
  <ThemeProvider defaultTheme="standard" storageKey="chess-theme">
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/play" element={<Play />} />
          <Route path="/puzzle" element={<DailyPuzzle />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
