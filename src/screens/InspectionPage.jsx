import React, { useState, useEffect, useRef } from "react";
import {
  Plane,
  Activity,
  UploadCloud,
  Play,
  ArrowLeft,
  XCircle,
  Database,
  Radar,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Crosshair,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InspectionPage = () => {
  const [sectionImages, setSectionImages] = useState({
    Nose: null,
    "Left Wing": null,
    Fuselage: null,
    "Right Wing": null,
    "Landing Gear": null,
    Tail: null,
  });

  const [aircraftId, setAircraftId] = useState("AC023");
  const [inspectionId, setInspectionId] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setInspectionId(`INS-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  const handleFileUpload = (section, e) => {
    e.preventDefault();
    let files = [];
    if (e.dataTransfer) files = Array.from(e.dataTransfer.files);
    else if (e.target.files) files = Array.from(e.target.files);

    if (files.length > 0) {
      const file = files.find((f) => f.type.startsWith("image/"));
      if (file) {
        setSectionImages((prev) => ({
          ...prev,
          [section]: { file, url: URL.createObjectURL(file), name: file.name },
        }));
      }
    }
  };

  const removeImage = (section, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSectionImages((prev) => ({ ...prev, [section]: null }));
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const activeImagesCount = Object.values(sectionImages).filter(Boolean).length;
  const uploadedScans = Object.entries(sectionImages)
    .filter(([_, data]) => data !== null)
    .map(([section, data]) => ({ section, ...data }));

  const runAnalysis = async () => {
    if (activeImagesCount === 0) return;
    setIsAnalyzing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) =>
        prev >= 90 ? 90 : prev + Math.floor(Math.random() * 15) + 5,
      );
    }, 600);

    const formData = new FormData();
    formData.append("aircraftId", aircraftId);
    Object.entries(sectionImages).forEach(([section, data]) => {
      if (data) {
        formData.append("images", data.file);
        formData.append("locations", section);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => navigate("/results", { state: result }), 600);
    } catch (err) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const SectionDropzone = ({ section }) => {
    const data = sectionImages[section];

    return (
      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-3 transition-all duration-300 min-h-[120px] group w-full bg-slate-900/80 backdrop-blur-md z-10 ${
          data
            ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_20px_rgba(8,145,178,0.4)]"
            : "border-slate-600 hover:border-cyan-400 hover:bg-slate-800/90 shadow-lg"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleFileUpload(section, e)}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => handleFileUpload(section, e)}
          disabled={isAnalyzing}
        />

        {data ? (
          <div className="absolute inset-0 w-full h-full p-1.5">
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-cyan-400 bg-slate-950">
              <img
                src={data.url}
                alt={section}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40">
                <CheckCircle2 className="w-6 h-6 text-cyan-400 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center px-1">
                  {section}
                </span>
              </div>
              <button
                onClick={(e) => removeImage(section, e)}
                disabled={isAnalyzing}
                className="absolute top-1 right-1 z-20 bg-slate-900/80 text-slate-300 hover:text-red-400 rounded-full p-1 backdrop-blur-sm border border-slate-600 transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border border-slate-700 shadow-inner">
              <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider text-center">
              {section}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radar className="w-8 h-8 animate-[spin_4s_linear_infinite]" />
            <span className="text-xl font-bold tracking-wider text-white">
              Aero<span className="text-cyan-400">Twin</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-12 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Structural Mapping
            </h1>
            <p className="text-slate-400 text-sm">
              Assign high-resolution scans directly to the aircraft schematic.
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8">
            <Radar className="w-20 h-20 text-cyan-400 animate-[spin_2s_linear_infinite] mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest">
              Processing Twin Data
            </h2>
            <p className="text-slate-400 mb-8 font-mono text-sm">
              Mapping coordinates to 3D mesh...
            </p>
            <div className="w-full max-w-lg bg-slate-900 rounded-full h-4 border border-slate-700 overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_1s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <span className="mt-4 text-cyan-400 font-mono font-bold text-xl">
              {progress}%
            </span>
          </div>
        )}

        {/* TOP ROW: Plane Map (Left) + Controls (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* LEFT: VERTICAL AIRCRAFT SCHEMATIC */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 lg:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[650px]">
            {/* Header / Title inside schematic */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-500" />
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Top-Down Schematic View
              </span>
            </div>

            {/* Glowing Prominent Background Plane */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              {/* Center Glow */}
              <div className="absolute w-[250px] h-[500px] bg-cyan-500/10 blur-[80px] rounded-[100%]"></div>
              {/* Plane Icon (Rotated -45deg because Lucide plane points top-right) */}
              <Plane
                className="w-[550px] h-[550px] text-cyan-500/30 drop-shadow-[0_0_20px_rgba(8,145,178,0.6)] -rotate-45 relative z-0 mt-8"
                strokeWidth={0.8}
              />
            </div>

            {/* Connecting Wireframe Lines for UI */}
            <div className="absolute top-24 bottom-24 left-1/2 w-[1px] bg-slate-700/50 -translate-x-1/2 z-0"></div>
            <div className="absolute top-1/2 left-[20%] right-[20%] h-[1px] bg-slate-700/50 -translate-y-1/2 z-0 mt-4"></div>

            {/* Anatomically Aligned Dropzone Layout */}
            <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
              {/* Nose */}
              <div className="w-1/3 z-10 mb-2">
                <SectionDropzone section="Nose" />
              </div>

              {/* Wings & Fuselage - Flex row aligns them horizontally */}
              <div className="w-full flex justify-between items-start gap-4 z-10">
                {/* Left Wing pushed down slightly to match swept wing shape */}
                <div className="w-1/3 mt-35">
                  <SectionDropzone section="Left Wing" />
                </div>
                {/* Fuselage in center */}
                <div className="w-1/3">
                  <SectionDropzone section="Fuselage" />
                </div>
                {/* Right Wing pushed down slightly */}
                <div className="w-1/3 mt-35">
                  <SectionDropzone section="Right Wing" />
                </div>
              </div>

              {/* Landing Gear */}
              <div className="w-1/3 z-10">
                <SectionDropzone section="Landing Gear" />
              </div>

              {/* Tail */}
              <div className="w-1/3 z-10 mt-3">
                <SectionDropzone section="Tail" />
              </div>
            </div>
          </div>

          {/* RIGHT: INPUTS & ACTIONS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Data Entry Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-6 uppercase tracking-wide flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Pre-Flight
                Details
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Aircraft ID
                  </label>
                  <div className="relative">
                    <Plane className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={aircraftId}
                      onChange={(e) => setAircraftId(e.target.value)}
                      disabled={isAnalyzing}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Session ID
                  </label>
                  <div className="relative">
                    <Activity className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inspectionId}
                      onChange={(e) => setInspectionId(e.target.value)}
                      disabled={isAnalyzing}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                  System Status
                </span>
                <span
                  className={`text-xs font-mono px-3 py-1.5 rounded-md border font-bold ${activeImagesCount > 0 ? "text-emerald-400 bg-emerald-950/50 border-emerald-900/50" : "text-slate-400 bg-slate-900 border-slate-700"}`}
                >
                  {activeImagesCount} ZONES ARMED
                </span>
              </div>

              <button
                onClick={runAnalysis}
                disabled={activeImagesCount === 0 || isAnalyzing}
                className={`w-full group relative px-6 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                  activeImagesCount > 0 && !isAnalyzing
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:shadow-[0_0_30px_rgba(8,145,178,0.8)] cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                }`}
              >
                {activeImagesCount > 0 && !isAnalyzing && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                )}

                <Play
                  className={`w-6 h-6 relative z-10 ${activeImagesCount > 0 ? "text-cyan-200 fill-cyan-200" : ""}`}
                />
                <span className="relative z-10 tracking-wide uppercase">
                  Initiate Scan Analysis
                </span>
              </button>
              <p className="text-xs text-slate-500 text-center mt-4">
                AI engine will map defects to the 3D Digital Twin.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Uploaded Scans Carousel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Active Session
              Scans
            </h3>
            {uploadedScans.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 snap-x pb-2 custom-scrollbar items-center min-h-[140px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {uploadedScans.length > 0 ? (
              uploadedScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="min-w-[220px] h-[130px] bg-slate-950 rounded-xl flex-shrink-0 snap-center border border-cyan-900/50 flex flex-col overflow-hidden group relative cursor-pointer"
                  onClick={() =>
                    document
                      .getElementById("top-anchor")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <img
                    src={scan.url}
                    alt={scan.section}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-8">
                    <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />{" "}
                      {scan.section}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-mono">
                      {scan.name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl h-[130px] bg-slate-900/30">
                <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-xs font-mono uppercase tracking-widest">
                  No scans uploaded yet
                </span>
                <span className="text-[10px] mt-1">
                  Upload images to the structural map above
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Anchor for scrolling back to top if they click a carousel item */}
      <div id="top-anchor" className="absolute top-0"></div>
    </div>
  );
};

export default InspectionPage;
