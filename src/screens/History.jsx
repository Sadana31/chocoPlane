import React, { useState, useEffect } from "react";
import {
  Radar,
  ArrowLeft,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Info,
  X,
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null); // Controls the Double-Click Modal

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/inspections");

        const data = await response.json();

        const only2026 = data.filter((item) =>
          item.inspectionDate?.startsWith("2026"),
        );

        setInspections(only2026);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspections();
  }, []);

  // --- HELPERS ---
  const getSeverityBadge = (severityVal) => {
    const num = Number(severityVal);
    if (num >= 90)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" /> High ({num})
        </span>
      );
    if (num >= 40)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <ShieldAlert className="w-3 h-3" /> Medium ({num})
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
        <Info className="w-3 h-3" /> Low ({num})
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("clear") || s.includes("stable")) {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> {status}
        </span>
      );
    }
    if (s.includes("ground") || s.includes("critical")) {
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-400 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-blue-400 text-sm font-medium">
        <Wrench className="w-4 h-4" /> {status}
      </span>
    );
  };

  // --- SEARCH FILTER ---
  const filteredData = inspections.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.aircraftId || "").toLowerCase().includes(term) ||
      (item.defectType || "").toLowerCase().includes(term) ||
      (item.location || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radar className="w-8 h-8 animate-[spin_4s_linear_infinite]" />
            <span className="text-xl font-bold tracking-wider text-white">
              Aero<span className="text-cyan-400">Twin</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-16 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Fleet Inspections Log
            </h1>
            <p className="text-slate-400 text-sm">
              Review past inspections.{" "}
              <span className="text-cyan-400 font-medium">
                Double-click any row to view deep AI diagnostics.
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex self-start sm:self-auto items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>
        </div>

        {/* Toolbar (Search & Filters) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-t-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Aircraft ID, Location, or Defect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-slate-700 w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/60 border border-slate-800 border-t-0 rounded-b-2xl overflow-hidden backdrop-blur-sm shadow-2xl flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap select-none">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-medium">Aircraft ID</th>
                  <th className="px-6 py-4 font-medium">Defect Type</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Severity</th>
                  <th className="px-6 py-4 font-medium">Aircraft Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading inspection data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      onDoubleClick={() => setSelectedInspection(row)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      title="Double click to view full AI report"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {row.aircraftId}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {row.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium capitalize text-slate-200">
                        {row.defectType}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {row.location}
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(row.severity)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(row.aircraftStatus || row.healthStatus)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-400">
                        {row.inspectionDate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No inspection history matches your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-500 flex justify-between items-center mt-auto">
            <span>Showing {filteredData.length} records</span>
            <span className="italic">Double-click a row for deep insights</span>
          </div>
        </div>
      </main>

      {/* --- DOUBLE CLICK MODAL --- */}
      {selectedInspection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm pointer-events-auto"
          onClick={() => setSelectedInspection(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {selectedInspection.aircraftId}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700">
                    {selectedInspection.id}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Inspection Date:{" "}
                  <span className="text-slate-200">
                    {selectedInspection.inspectionDate}
                  </span>{" "}
                  • Location:{" "}
                  <span className="text-slate-200">
                    {selectedInspection.location}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-700">
              {/* Top AI Directives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs uppercase text-slate-500 font-bold flex items-center gap-2">
                    <Info size={14} /> Executive Summary
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedInspection.executiveSummary ||
                      "No summary available."}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-red-900/30 flex flex-col gap-2">
                  <span className="text-xs uppercase text-red-400 font-bold flex items-center gap-2">
                    <Wrench size={14} /> Recommendation
                  </span>
                  <p className="text-sm text-slate-300 font-medium">
                    {selectedInspection.recommendation ||
                      "No recommendation available."}
                  </p>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                  Core Telemetry & Health
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">
                      Health Score
                    </span>
                    <span
                      className={`text-2xl font-bold ${selectedInspection.healthScore < 50 ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {selectedInspection.healthScore}/100
                    </span>
                    <span className="block text-xs mt-1 text-slate-400">
                      {selectedInspection.healthStatus}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">
                      Criticality Index
                    </span>
                    <span className="text-2xl font-bold text-orange-400">
                      {selectedInspection.criticalityIndex}/100
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">
                      Future Risk
                    </span>
                    <span className="text-2xl font-bold text-rose-400">
                      {selectedInspection.futureRisk}%
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 block mb-1">
                      AI Confidence
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {selectedInspection.confidence
                        ? (selectedInspection.confidence * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance & Logistics List */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                  Maintenance & Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">
                      Fleet Priority
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      {selectedInspection.fleetPriorityRank || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">
                      Mission Readiness
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedInspection.missionReadiness || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">
                      Inspection Window
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedInspection.inspectionWindow || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">Zone Risk</span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedInspection.zoneRisk || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">Trend Data</span>
                    <span className="text-sm font-bold flex items-center gap-1 text-slate-200">
                      {selectedInspection.trend === "Improving" ? (
                        <TrendingDown size={14} className="text-emerald-400" />
                      ) : (
                        <TrendingUp size={14} className="text-red-400" />
                      )}
                      {selectedInspection.trend} (
                      {selectedInspection.growthRate})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                    <span className="text-sm text-slate-400">
                      Predicted Costs (30d)
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <DollarSign size={14} />
                      {selectedInspection.predictedMaintenanceCost || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
