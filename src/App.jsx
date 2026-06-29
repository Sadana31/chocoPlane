import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Sidebar from "./Sidebar";
import LandingPage from "./screens/LandingPage";
import InspectionPage from "./screens/InspectionPage";
import History from "./screens/History";
import ResultsPage from "./screens/ResultsPage";
import FleetPage from "./screens/FleetPage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className="flex w-full min-h-screen">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div
          className={`
    flex-1
    transition-all
    duration-300
    ${isSidebarOpen ? "ml-72" : "ml-0"}
  `}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/inspection" element={<InspectionPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/fleet" element={<FleetPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
