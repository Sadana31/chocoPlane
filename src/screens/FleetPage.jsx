import React, { useState, useEffect } from "react";
import {
  Radar,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Plane,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  X,
  Info,
  DollarSign,
  Activity,
  Crosshair,
  Maximize,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fleetData, setFleetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFleetStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/inspections");

        if (!response.ok) {
          throw new Error("Failed to fetch inspection data");
        }

        const allInspections = await response.json();

        const latestByAircraft = {};

        allInspections.forEach((inspection) => {
          const planeId = inspection.aircraftId;
          if (!planeId) return;

          if (!latestByAircraft[planeId]) {
            latestByAircraft[planeId] = inspection;
          } else {
            const currentDate = new Date(inspection.inspectionDate || 0);
            const savedDate = new Date(
              latestByAircraft[planeId].inspectionDate || 0,
            );

            if (currentDate > savedDate) {
              latestByAircraft[planeId] = inspection;
            }
          }
        });

        const filteredAircraft = Object.values(latestByAircraft).filter(
          (plane) => (plane.healthScore || 0) > 0,
        );
        setFleetData(filteredAircraft);
      } catch (err) {
        console.error("API fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFleetStatus();
  }, []);

  // --- Dynamic KPI Calculations ---
  const totalAircraft = fleetData.length;
  const groundedCount = fleetData.filter((a) =>
    String(a.aircraftStatus || "")
      .toLowerCase()
      .includes("ground"),
  ).length;
  const avgHealth =
    fleetData.length > 0
      ? Math.round(
          fleetData.reduce(
            (acc, curr) => acc + (Number(curr.healthScore) || 0),
            0,
          ) / fleetData.length,
        )
      : 0;

  // --- Helpers ---
  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("clear") || s.includes("stable") || s.includes("ready")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> Operational
        </span>
      );
    }
    if (
      s.includes("ground") ||
      s.includes("critical") ||
      s.includes("not mission")
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" /> Grounded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
        <Wrench className="w-4 h-4" /> Maintenance
      </span>
    );
  };

  const filteredFleet = fleetData.filter((item) =>
    (item.aircraftId || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Background */}
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
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-cyan-500/70 uppercase tracking-widest bg-cyan-950/30 px-3 py-1.5 rounded border border-cyan-900/50 hidden sm:block">
              Fleet Overview
            </div>
            <button className="text-sm font-medium px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-white">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-16 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Fleet Readiness Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time status of all unique aircraft based on their latest
              scans.{" "}
              <span className="text-cyan-400">
                Double-click to view details.
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate("/inspection")}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Scanner Interface</span>
          </button>
        </div>

        {/* Fleet KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <Plane size={64} />
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
              Total Monitored Fleet
            </h3>
            <div className="text-5xl font-black text-white">
              {totalAircraft}{" "}
              <span className="text-xl text-slate-500 font-medium tracking-normal">
                tail numbers
              </span>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <HeartPulse size={64} className="text-cyan-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
              Average Fleet Health
            </h3>
            <div
              className={`text-5xl font-black ${avgHealth < 50 ? "text-red-400" : "text-cyan-400"}`}
            >
              {avgHealth}
              <span className="text-xl text-slate-600 font-medium">/100</span>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <AlertTriangle size={64} className="text-rose-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
              Grounded Assets
            </h3>
            <div className="text-5xl font-black text-rose-500">
              {groundedCount}{" "}
              <span className="text-xl text-slate-500 font-medium tracking-normal">
                AOG
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-t-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Aircraft ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-slate-700 w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Fleet Table */}
        <div className="bg-slate-900/60 border border-slate-800 border-t-0 rounded-b-2xl overflow-hidden backdrop-blur-sm shadow-2xl flex-1 flex flex-col">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap select-none">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-medium">Aircraft ID</th>
                  <th className="px-6 py-4 font-medium">Fleet Status</th>
                  <th className="px-6 py-4 font-medium">Latest Health Score</th>
                  <th className="px-6 py-4 font-medium">Projected Risk</th>
                  <th className="px-6 py-4 font-medium">Last Scan Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Radar className="w-8 h-8 text-cyan-500 animate-[spin_2s_linear_infinite]" />
                        <span>Synchronizing fleet data from API...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-red-400 bg-red-950/20"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-bold">API Connection Error</span>
                        <span className="text-sm">{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredFleet.length > 0 ? (
                  filteredFleet.map((row) => (
                    <tr
                      key={row.aircraftId}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onDoubleClick={() => setSelectedInspection(row)}
                      title="Double-click to view deep AI diagnostics"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-white text-lg tracking-wide flex items-center gap-2">
                          <Plane size={16} className="text-slate-500" />{" "}
                          {row.aircraftId}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(
                          row.missionReadiness ||
                            row.aircraftStatus ||
                            row.healthStatus,
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xl font-bold ${row.healthScore < 50 ? "text-red-400" : "text-emerald-400"}`}
                          >
                            {row.healthScore || "N/A"}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.healthScore < 50 ? "bg-red-400" : "bg-emerald-400"}`}
                              style={{ width: `${row.healthScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {row.futureRisk > 50 ? (
                            <TrendingUp size={16} className="text-rose-400" />
                          ) : (
                            <TrendingDown size={16} className="text-cyan-400" />
                          )}
                          <span
                            className={`font-bold ${row.futureRisk > 50 ? "text-rose-400" : "text-cyan-400"}`}
                          >
                            {row.futureRisk || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-mono text-slate-400">
                        {row.inspectionDate || "Unknown"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No aircraft found in the fleet registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-500 flex justify-between items-center mt-auto">
            <span>Showing {filteredFleet.length} unique assets</span>
            <span className="italic">
              Double-click a row for full inspection details
            </span>
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
            className="w-full max-w-5xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Plane className="text-cyan-400" size={24} />{" "}
                    {selectedInspection.aircraftId}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${selectedInspection.healthScore < 50 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                  >
                    {selectedInspection.aircraftStatus ||
                      selectedInspection.healthStatus ||
                      "Status Unknown"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-mono">
                  Scan Date:{" "}
                  <span className="text-slate-200">
                    {selectedInspection.inspectionDate}
                  </span>{" "}
                  • Zone:{" "}
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

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950">
              {/* AI Directives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <span className="text-xs uppercase text-cyan-400 font-bold flex items-center gap-2 tracking-widest">
                    <Info size={14} /> Executive Summary
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed capitalize">
                    {selectedInspection.executiveSummary ||
                      "No summary generated."}
                  </p>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-rose-900/30 flex flex-col gap-2">
                  <span className="text-xs uppercase text-rose-400 font-bold flex items-center gap-2 tracking-widest">
                    <Wrench size={14} /> Recommendation
                  </span>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    {selectedInspection.recommendation ||
                      "No recommendation available."}
                  </p>
                </div>
              </div>

              {/* Telemetry & Risk */}
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} /> Health & Risk Telemetry
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Health Score
                    </span>
                    <span
                      className={`text-xl font-bold ${selectedInspection.healthScore < 50 ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {selectedInspection.healthScore || 0}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Severity
                    </span>
                    <span className="text-xl font-bold text-amber-400">
                      {selectedInspection.severity || 0}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Urgency
                    </span>
                    <span className="text-xl font-bold text-rose-400">
                      {selectedInspection.urgency || 0}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Criticality
                    </span>
                    <span className="text-xl font-bold text-orange-400">
                      {selectedInspection.criticalityIndex || 0}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Future Risk
                    </span>
                    <span className="text-xl font-bold text-rose-400">
                      {selectedInspection.futureRisk || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Fail Probability
                    </span>
                    <span className="text-xl font-bold text-red-500">
                      {selectedInspection.failureProbability || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Reliability
                    </span>
                    <span className="text-sm font-bold text-slate-200 capitalize">
                      {selectedInspection.reliability || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Remaining Health
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedInspection.remainingUsefulHealth || 0} hrs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Risk Category
                    </span>
                    <span className="text-sm font-bold text-slate-200 capitalize">
                      {selectedInspection.riskCategory || "N/A"}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Zone Risk Status
                    </span>
                    <span className="text-sm font-bold text-slate-200 capitalize">
                      {selectedInspection.zoneRisk || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance & Logistics */}
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Wrench size={14} /> Logistics & Maintenance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Mission Readiness
                    </span>
                    <span
                      className={`text-sm font-bold uppercase ${String(selectedInspection.missionReadiness).includes("Not") ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {selectedInspection.missionReadiness || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Fleet Priority Rank
                    </span>
                    <span className="text-sm font-bold text-rose-400">
                      {selectedInspection.fleetPriorityRank || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Inspection Window
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedInspection.inspectionWindow || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">
                      Maintenance Burden
                    </span>
                    <span className="text-sm font-bold text-orange-400">
                      {selectedInspection.maintenanceBurden || 0}%
                    </span>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800 md:col-span-2">
                    <span className="text-[10px] uppercase text-slate-500 block flex items-center gap-1">
                      <DollarSign size={12} /> Current Est. Cost
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      $
                      {selectedInspection.maintenanceCost?.toLocaleString() ||
                        0}
                    </span>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800 md:col-span-2">
                    <span className="text-[10px] uppercase text-slate-500 block flex items-center gap-1">
                      <DollarSign size={12} /> Predicted Cost (30 Days)
                    </span>
                    <span className="text-lg font-mono font-bold text-rose-400">
                      $
                      {selectedInspection.predictedMaintenanceCost?.toLocaleString() ||
                        0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spatial Diagnostics & Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Crosshair size={14} /> Defect Spatial Data
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">
                        Defect Class
                      </span>
                      <span className="text-sm font-bold text-white capitalize">
                        {selectedInspection.defectType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">
                        AI Confidence
                      </span>
                      <span className="text-sm font-bold text-white">
                        {(selectedInspection.confidence * 100).toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Maximize size={16} className="text-cyan-500" />
                        <span className="text-slate-400">Dimensions:</span>
                        <span className="font-mono text-white">
                          {selectedInspection.width}x{selectedInspection.height}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Pos:</span>
                        <span className="font-mono text-white">
                          [{selectedInspection.x}, {selectedInspection.y}]
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] uppercase text-slate-500 block">
                        Bounding Box Area
                      </span>
                      <span className="text-sm font-mono text-slate-300">
                        {selectedInspection.bboxArea?.toLocaleString() || 0} px²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Analytics & Growth Trends
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                      <span className="text-xs uppercase text-slate-500">
                        Growth Trend
                      </span>
                      <span className="text-sm font-bold flex items-center gap-2 capitalize text-white">
                        {selectedInspection.trend === "Improving" ? (
                          <TrendingDown
                            size={16}
                            className="text-emerald-400"
                          />
                        ) : (
                          <TrendingUp size={16} className="text-rose-400" />
                        )}
                        {selectedInspection.trend || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                      <span className="text-xs uppercase text-slate-500">
                        Growth Rate
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {selectedInspection.growthRate || 0}{" "}
                        <span className="text-slate-500 text-xs font-sans">
                          units/cycle
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                      <span className="text-xs uppercase text-slate-500">
                        Predicted Area (30d)
                      </span>
                      <span className="text-sm font-mono font-bold text-orange-400">
                        {selectedInspection.predictedArea30Days?.toLocaleString() ||
                          0}{" "}
                        <span className="text-slate-500 text-xs font-sans">
                          px²
                        </span>
                      </span>
                    </div>
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
