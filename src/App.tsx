import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BudgetProvider } from "@/contexts/BudgetContext";
import Index from "./pages/Index";
import LearningPath from "./pages/LearningPath";
import CategoryDetail from "./pages/CategoryDetail";
import LessonStart from "./pages/LessonStart";
import LessonFlowPage from "./pages/LessonFlow";
import ETF_L1_WhatIsAnIndex from "./pages/lessons/ETF_L1_WhatIsAnIndex";
import ETF_L2_HowIndexesAreBuilt from "./pages/lessons/ETF_L2_HowIndexesAreBuilt";
import ETF_L3_WhatIsAnETF from "./pages/lessons/ETF_L3_WhatIsAnETF";
import ETF_L4_ETFUniverse from "./pages/lessons/ETF_L4_ETFUniverse";
import ETF_L5_Costs from "./pages/lessons/ETF_L5_Costs";
import ETF_L6_Risk from "./pages/lessons/ETF_L6_Risk";
import ETF_L7_AccVsDist from "./pages/lessons/ETF_L7_AccVsDist";
import ETF_L8_Sparplan from "./pages/lessons/ETF_L8_Sparplan";
import ETF_L9_Simulation from "./pages/lessons/ETF_L9_Simulation";
import Cash_F1_WhatIsCash from "./pages/lessons/Cash_F1_WhatIsCash";
import Cash_F2_Inflation from "./pages/lessons/Cash_F2_Inflation";
import Cash_F3_Liquidity from "./pages/lessons/Cash_F3_Liquidity";
import Cash_F4_Festgeld from "./pages/lessons/Cash_F4_Festgeld";
import Cash_F5_Tagesgeld from "./pages/lessons/Cash_F5_Tagesgeld";
import LevelChallenge from "./pages/LevelChallenge";

import FestgeldOverview from "./pages/FestgeldOverview";
import FestgeldDetail from "./pages/FestgeldDetail";
import TagesgeldOverview from "./pages/TagesgeldOverview";
import TagesgeldDetail from "./pages/TagesgeldDetail";
import EtfOverview from "./pages/EtfOverview";
import EtfDetail from "./pages/EtfDetail";
import AktienOverview from "./pages/AktienOverview";
import AktienDetail from "./pages/AktienDetail";
import PortfolioSimulation from "./pages/PortfolioSimulation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BudgetProvider totalBudget={5000}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<LearningPath />} />
            <Route path="/category/:id" element={<CategoryDetail />} />
            <Route path="/lesson/:categoryId/:lessonId" element={<LessonStart />} />
            <Route path="/lesson/festgeld/f1" element={<Cash_F1_WhatIsCash />} />
            <Route path="/lesson/festgeld/f2" element={<Cash_F2_Inflation />} />
            <Route path="/lesson/festgeld/f3" element={<Cash_F3_Liquidity />} />
            <Route path="/lesson/festgeld/f4" element={<Cash_F5_Tagesgeld />} />
            <Route path="/lesson/festgeld/f5" element={<Cash_F4_Festgeld />} />
            <Route path="/lesson/etfs/e1" element={<ETF_L1_WhatIsAnIndex />} />
            <Route path="/lesson/etfs/e2" element={<ETF_L2_HowIndexesAreBuilt />} />
            <Route path="/lesson/etfs/e3" element={<ETF_L3_WhatIsAnETF />} />
            <Route path="/lesson/etfs/e4" element={<ETF_L4_ETFUniverse />} />
            <Route path="/lesson/etfs/e5" element={<ETF_L5_Costs />} />
            <Route path="/lesson/etfs/e6" element={<ETF_L6_Risk />} />
            <Route path="/lesson/etfs/e7" element={<ETF_L7_AccVsDist />} />
            <Route path="/lesson/etfs/e8" element={<ETF_L8_Sparplan />} />
            <Route path="/lesson/etfs/e9" element={<ETF_L9_Simulation />} />
            <Route path="/lesson-flow/:categoryId/:lessonId" element={<LessonFlowPage />} />
            
            <Route path="/challenge/:levelId/festgeld/:productSlug" element={<FestgeldDetail />} />
            <Route path="/challenge/:levelId/festgeld" element={<FestgeldOverview />} />
            <Route path="/challenge/:levelId/tagesgeld/:productSlug" element={<TagesgeldDetail />} />
            <Route path="/challenge/:levelId/tagesgeld" element={<TagesgeldOverview />} />
            <Route path="/challenge/:levelId/etfs/:ticker" element={<EtfDetail />} />
            <Route path="/challenge/:levelId/etfs" element={<EtfOverview />} />
            <Route path="/challenge/:levelId/simulation" element={<PortfolioSimulation />} />
            <Route path="/challenge/:levelId/:topicSlug" element={<LevelChallenge />} />
            <Route path="/challenge/:levelId" element={<LevelChallenge />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
