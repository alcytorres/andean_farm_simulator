import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ScenarioBuilder from "./pages/ScenarioBuilder";
import CompareScenarios from "./pages/CompareScenarios";
import Climate from "./pages/Climate";
import Findings from "./pages/Findings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/builder" element={<ScenarioBuilder />} />
            <Route path="/compare" element={<CompareScenarios />} />
            <Route path="/climate" element={<Climate />} />
            <Route path="/findings" element={<Findings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
