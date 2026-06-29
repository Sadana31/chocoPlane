import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Info,
  Crosshair,
  ArrowLeft,
  Maximize,
  AlertOctagon,
  X,
  HeartPulse,
  AlertTriangle,
  Zap,
  Activity,
  TrendingDown,
  FileText,
  Wrench,
  DollarSign,
  Image as ImageIcon,
  Hash,
  Clock,
  TrendingUp,
  Maximize2,
  ShieldAlert,
  Navigation,
} from "lucide-react";

const getSeverityColorHex = (severity) => {
  if (severity >= 80) return 0xff0000;
  if (severity >= 60) return 0xff8800;
  if (severity >= 40) return 0xffff00;
  return 0x00ff66;
};

const getUrgencyTailwind = (urgency) => {
  let urgencyLevel = String(urgency || "").toLowerCase();
  if (typeof urgency === "number") {
    if (urgency >= 80) urgencyLevel = "high";
    else if (urgency >= 40) urgencyLevel = "medium";
    else urgencyLevel = "low";
  }

  switch (urgencyLevel) {
    case "high":
      return "border-red-500 text-red-500 bg-red-500/10 shadow-red-500/20";
    case "medium":
      return "border-orange-500 text-orange-500 bg-orange-500/10 shadow-orange-500/20";
    case "low":
      return "border-cyan-500 text-cyan-500 bg-cyan-500/10 shadow-cyan-500/20";
    default:
      return "border-cyan-500 text-cyan-500 bg-cyan-500/10 shadow-cyan-500/20";
  }
};

// --- MAIN APPLICATION COMPONENT ---
export default function ResultsPage() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const wrapperRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelMetadata, setModelMetadata] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state || [];

  const onMarkerClickRef = useRef();
  onMarkerClickRef.current = (defect) => {
    setSelectedDefect(defect);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedDefect(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- INITIALIZE PURE THREE.JS PIPELINE ---
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const wrapper = new THREE.Group();
    scene.add(wrapper);
    wrapperRef.current = wrapper;

    const markersGroup = new THREE.Group();
    wrapper.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(30, 20, 40);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 200;

    const loader = new GLTFLoader();

    loader.load(
      "/747_lufthansa.glb",
      (gltf) => {
        const airplaneModel = gltf.scene;
        airplaneModel.updateMatrixWorld(true);

        const visibleBox = new THREE.Box3();
        visibleBox.makeEmpty();

        airplaneModel.traverse((child) => {
          if (child.isMesh && child.visible) {
            child.geometry.computeBoundingBox();
            const meshBox = child.geometry.boundingBox.clone();
            meshBox.applyMatrix4(child.matrixWorld);
            visibleBox.union(meshBox);
          }
        });

        const center = new THREE.Vector3();
        visibleBox.getCenter(center);
        const size = new THREE.Vector3();
        visibleBox.getSize(size);

        airplaneModel.position.set(-center.x, -center.y, -center.z);
        wrapper.add(airplaneModel);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 60;
        const scaleFactor = targetSize / maxDimension;
        wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);

        setModelMetadata({
          size: size,
          scaleFactor: scaleFactor,
          isXLength: size.x > size.z,
        });

        camera.position.set(
          targetSize * 0.7,
          targetSize * 0.4,
          targetSize * 0.7,
        );
        controls.target.set(0, 0, 0);
        controls.update();

        setIsModelLoading(false);
      },
      undefined,
      (error) => {
        console.error("Failed to load GLB model:", error);
        setIsModelLoading(false);
      },
    );

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (event) =>
      (pointerDownPos = { x: event.clientX, y: event.clientY });

    const onPointerUp = (event) => {
      const distance = Math.hypot(
        event.clientX - pointerDownPos.x,
        event.clientY - pointerDownPos.y,
      );
      if (distance > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (markersGroupRef.current) {
        const intersects = raycaster.intersectObjects(
          markersGroupRef.current.children,
          true,
        );
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          const defectData =
            obj.userData?.defect || obj.parent?.userData?.defect;
          if (defectData && onMarkerClickRef.current)
            onMarkerClickRef.current(defectData);
        }
      }
    };

    const onPointerMove = (event) => {
      if (!markersGroupRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        markersGroupRef.current.children,
        true,
      );
      document.body.style.cursor =
        intersects.length > 0 ? "pointer" : "default";
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      if (markersGroupRef.current) {
        const time = Date.now();
        markersGroupRef.current.children.forEach((markerGroup) => {
          const {
            pulseSpeed = 0.002,
            pulseSize = 1.5,
            randomSeed = 0,
          } = markerGroup.userData || {};
          const aura = markerGroup.children[0];

          if (aura && aura.material) {
            const sineValue =
              (Math.sin(time * pulseSpeed + randomSeed) + 1) / 2;
            const currentScale = 1 + sineValue * (pulseSize - 1);
            aura.scale.setScalar(currentScale);
            aura.material.opacity = 0.1 + sineValue * 0.5;
          }
        });
      }
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement)
        mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- PLOT MARKERS ---
  useEffect(() => {
    if (!markersGroupRef.current || !modelMetadata || results.length === 0)
      return;
    const group = markersGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const { size, scaleFactor, isXLength } = modelMetadata;
    const halfX = size.x / 2;
    const halfY = size.y / 2;
    const halfZ = size.z / 2;

    results.forEach((item) => {
      const severityScale = Math.max(0.6, item.severity / 100);
      const sphereGeo = new THREE.SphereGeometry(
        (1.5 * severityScale) / scaleFactor,
        32,
        32,
      );
      const markerRadius = (1.5 * severityScale) / scaleFactor;
      let x = 0,
        y = 0,
        z = 0;

      if (isXLength) {
        switch (item.section || item.location) {
          case "Nose":
            x = halfX * 0.85;
            y = -halfY * 0.15;
            z = 0;
            break;
          case "Fuselage":
            x = 0;
            y = 0;
            z = 0;
            break;
          case "Tail":
            x = -halfX * 0.85;
            y = halfY * 0.5;
            z = 0;
            break;
          case "Right Wing":
            x = 0;
            y = -halfY * 0.65;
            z = halfZ * 0.25;
            break;
          case "Left Wing":
            x = 0;
            y = -halfY * 0.65;
            z = -halfZ * 0.25;
            break;
          case "Landing Gear":
            x = halfX * 0.1;
            y = -halfY * 0.8;
            z = 0;
            break;
          default:
            x = 0;
            y = 0;
            z = 0;
        }
      } else {
        switch (item.section || item.location) {
          case "Nose":
            x = 0;
            y = -halfY * 0.45;
            z = halfZ * 0.95;
            break;
          case "Fuselage":
            x = 0;
            y = 0;
            z = 0;
            break;
          case "Tail":
            x = 0;
            y = halfY * 0.5;
            z = -halfZ * 0.85;
            break;
          case "Right Wing":
            x = -halfX * 0.45;
            y = -halfY * 0.65;
            z = 0;
            break;
          case "Left Wing":
            x = halfX * 0.25;
            y = -halfY * 0.65;
            z = 0;
            break;
          case "Landing Gear":
            x = 0;
            y = -halfY * 0.8;
            z = halfZ * 0.1;
            break;
          default:
            x = 0;
            y = 0;
            z = 0;
        }
      }

      const hexColor = getSeverityColorHex(item.severity);
      const urgencyLower = String(item.urgency || "").toLowerCase();
      const isHighUrgency = urgencyLower === "high" || item.urgency >= 80;
      const isMedUrgency =
        urgencyLower === "medium" || (item.urgency >= 40 && item.urgency < 80);

      const pulseSpeed = isHighUrgency ? 0.008 : isMedUrgency ? 0.004 : 0.002;
      const pulseSize = isHighUrgency ? 2.5 : isMedUrgency ? 1.8 : 1.3;

      const markerObject = new THREE.Group();
      markerObject.position.set(x, y, z);
      markerObject.userData = {
        defect: item,
        pulseSpeed,
        pulseSize,
        randomSeed: Math.random() * 100,
      };

      const sphereMat = new THREE.MeshBasicMaterial({ color: hexColor });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);

      const auraGeo = new THREE.SphereGeometry(markerRadius * 1.5, 32, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);

      markerObject.add(aura);
      markerObject.add(sphere);
      group.add(markerObject);
    });
  }, [results, modelMetadata]);

  return (
    <div className="w-full h-screen bg-slate-900 flex overflow-hidden font-sans">
      {/* 3D Canvas Area */}
      <div className="flex-1 relative">
        {isModelLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 font-semibold text-lg tracking-widest uppercase">
              Initializing Scanner...
            </p>
          </div>
        )}

        {!isModelLoading && results.length === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center max-w-md pointer-events-auto">
              <Info size={32} className="text-cyan-400 mb-4" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-2">
                No Scan Data Found
              </h2>
              <button
                onClick={() => navigate("/inspection")}
                className="flex items-center gap-2 bg-slate-800 hover:bg-cyan-900/50 text-cyan-400 border border-slate-700 hover:border-cyan-500 px-6 py-2 rounded-lg mt-4 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Scanner
              </button>
            </div>
          </div>
        )}

        <div ref={mountRef} className="w-full h-full outline-none" />

        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded border border-slate-700 flex items-center gap-4 shadow-lg">
            <div className="bg-cyan-500/20 p-3 rounded text-cyan-400">
              <Crosshair size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-wider">
                Spatial Diagnostics
              </h1>
              <p className="text-xs text-cyan-400 mt-1 uppercase tracking-widest">
                {results.length} anomalies ready
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 z-10 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-white px-4 py-2 rounded border border-slate-700 flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} /> Return
          </button>
        </div>
      </div>

      {/* --- REORGANIZED COMPREHENSIVE DASHBOARD MODAL --- */}
      {selectedDefect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto"
          onClick={() => setSelectedDefect(null)}
        >
          <div
            className={`w-full max-w-6xl h-[95vh] bg-slate-950 border ${getUrgencyTailwind(selectedDefect.urgency).split(" ")[0]} rounded-2xl shadow-2xl flex flex-col relative overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex justify-between items-start md:items-center p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-5">
                <div
                  className={`p-3 rounded-xl bg-slate-800 border ${getUrgencyTailwind(selectedDefect.urgency).split(" ")[0]}`}
                >
                  <AlertOctagon
                    className={
                      getUrgencyTailwind(selectedDefect.urgency).split(" ")[1]
                    }
                    size={28}
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-widest capitalize mb-1">
                    {selectedDefect.class || "Anomaly"} Detected
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 uppercase tracking-widest">
                    <span className="bg-slate-800 px-3 py-1 rounded text-slate-200">
                      Section:{" "}
                      <strong>
                        {selectedDefect.section || selectedDefect.location}
                      </strong>
                    </span>
                    {selectedDefect.occurrences && (
                      <span className="flex items-center gap-1">
                        <Hash size={14} /> Occurrences:{" "}
                        {selectedDefect.occurrences}
                      </span>
                    )}
                    {selectedDefect.x && selectedDefect.y && (
                      <span className="flex items-center gap-1">
                        <Crosshair size={14} /> [{selectedDefect.x},{" "}
                        {selectedDefect.y}]
                      </span>
                    )}
                    {selectedDefect.width && selectedDefect.height && (
                      <span className="flex items-center gap-1">
                        <Maximize size={14} /> {selectedDefect.width}x
                        {selectedDefect.height}px
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {selectedDefect.aircraftStatus && (
                  <span className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest bg-slate-800 border border-slate-700 text-slate-300">
                    STATUS: {selectedDefect.aircraftStatus}
                  </span>
                )}
                <span
                  className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border ${getUrgencyTailwind(selectedDefect.urgency)}`}
                >
                  URGENCY: {selectedDefect.urgency || "UNKNOWN"}
                </span>
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Body Container - Grouped into Modules */}
            <div className="overflow-y-auto p-6 md:p-8 flex flex-col gap-10 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {/* === MODULE 1: HERO KPIs === */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col relative overflow-hidden">
                  <HeartPulse
                    className="absolute top-4 right-4 opacity-10"
                    size={48}
                  />
                  <span className="text-[10px] uppercase text-slate-500 tracking-widest block mb-1">
                    Health Score
                  </span>
                  <span
                    className={`text-3xl font-bold ${selectedDefect.healthScore < 50 ? "text-red-500" : "text-cyan-400"}`}
                  >
                    {selectedDefect.healthScore || "N/A"}
                    <span className="text-lg text-slate-600">/100</span>
                  </span>
                  <span className="text-xs uppercase text-slate-400 mt-1 font-bold">
                    {selectedDefect.healthStatus || "Review"}
                  </span>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col relative overflow-hidden">
                  <AlertTriangle
                    className="absolute top-4 right-4 opacity-10"
                    size={48}
                  />
                  <span className="text-[10px] uppercase text-slate-500 tracking-widest block mb-1">
                    Severity
                  </span>
                  <span
                    className={`text-3xl font-bold ${getUrgencyTailwind(selectedDefect.urgency).split(" ")[1]}`}
                  >
                    {selectedDefect.severity || "N/A"}
                    <span className="text-lg text-slate-600">/100</span>
                  </span>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col relative overflow-hidden">
                  <Zap
                    className="absolute top-4 right-4 opacity-10"
                    size={48}
                  />
                  <span className="text-[10px] uppercase text-slate-500 tracking-widest block mb-1">
                    Criticality Index
                  </span>
                  <span className="text-3xl font-bold text-orange-400">
                    {selectedDefect.criticalityIndex || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col relative overflow-hidden">
                  <Activity
                    className="absolute top-4 right-4 opacity-10"
                    size={48}
                  />
                  <span className="text-[10px] uppercase text-slate-500 tracking-widest block mb-1">
                    AI Confidence
                  </span>
                  <span className="text-3xl font-bold text-white">
                    {selectedDefect.confidence
                      ? (selectedDefect.confidence * 100).toFixed(1)
                      : "N/A"}
                    <span className="text-lg text-slate-600">%</span>
                  </span>
                </div>
              </div>

              {/* === MODULE 2: RISK & PROGRESSION === */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-cyan-500" /> Risk &
                  Progression Analysis
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Progress Bars */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs uppercase text-slate-400 tracking-widest">
                          Future Risk (Projected)
                        </span>
                        <span
                          className={`font-bold ${selectedDefect.futureRisk > 60 ? "text-orange-500" : "text-cyan-400"}`}
                        >
                          {selectedDefect.futureRisk || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${selectedDefect.futureRisk > 60 ? "bg-orange-500" : "bg-cyan-400"}`}
                          style={{
                            width: `${selectedDefect.futureRisk || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs uppercase text-slate-400 tracking-widest">
                          Failure Probability
                        </span>
                        <span
                          className={`font-bold ${selectedDefect.failureProbability > 50 ? "text-red-500" : "text-orange-400"}`}
                        >
                          {selectedDefect.failureProbability || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${selectedDefect.failureProbability > 50 ? "bg-red-500" : "bg-orange-400"}`}
                          style={{
                            width: `${selectedDefect.failureProbability || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs uppercase text-slate-400 tracking-widest">
                          Reliability Impact
                        </span>
                        <span
                          className={`font-bold ${String(selectedDefect.reliability).toLowerCase() === "low" ? "text-red-500" : "text-emerald-400"}`}
                        >
                          {selectedDefect.reliability || "N/A"}
                        </span>
                      </div>
                      {typeof selectedDefect.reliability === "number" && (
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${selectedDefect.reliability < 50 ? "bg-red-500" : "bg-emerald-400"}`}
                            style={{
                              width: `${selectedDefect.reliability || 0}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Predictive Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <span className="text-xs uppercase text-slate-500 block mb-1">
                        Defect Trend
                      </span>
                      <span
                        className={`text-xl font-bold flex items-center gap-2 ${selectedDefect.trend === "Improving" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {selectedDefect.trend === "Improving" ? (
                          <TrendingDown size={20} />
                        ) : (
                          <TrendingUp size={20} />
                        )}
                        {selectedDefect.trend || "N/A"}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <span className="text-xs uppercase text-slate-500 block mb-1">
                        Growth Rate
                      </span>
                      <span className="text-xl font-bold text-white">
                        {selectedDefect.growthRate || 0}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          units/cycle
                        </span>
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 col-span-2">
                      <span className="text-xs uppercase text-slate-500 block mb-1">
                        Predicted Area (30 Days)
                      </span>
                      <span className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                        <Maximize2 size={20} />{" "}
                        {selectedDefect.predictedArea30Days?.toLocaleString() ||
                          0}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          px²
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* === MODULE 3: FLEET & MAINTENANCE LOGISTICS === */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Wrench size={18} className="text-emerald-500" /> Fleet
                  Operations & Maintenance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {/* Col 1 */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Fleet Priority Rank
                      </span>
                      <div className="text-sm font-bold text-red-400 bg-red-950/30 px-3 py-1 rounded inline-block mt-1">
                        {selectedDefect.fleetPriorityRank || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Mission Readiness
                      </span>
                      <div
                        className={`text-sm font-bold uppercase mt-1 ${selectedDefect.missionReadiness === "Not Mission Ready" ? "text-red-500" : "text-orange-400"}`}
                      >
                        {selectedDefect.missionReadiness || "N/A"}
                      </div>
                    </div>
                  </div>
                  {/* Col 2 */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Inspection Window
                      </span>
                      <div className="text-sm font-bold text-white mt-1">
                        {selectedDefect.inspectionWindow || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Risk Category & Zone
                      </span>
                      <div className="text-sm font-bold text-slate-200 mt-1">
                        {selectedDefect.riskCategory} •{" "}
                        {selectedDefect.zoneRisk}
                      </div>
                    </div>
                  </div>
                  {/* Col 3 */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Maintenance Burden
                      </span>
                      <div className="text-sm font-bold text-orange-400 mt-1">
                        {selectedDefect.maintenanceBurden}% System Load
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 tracking-widest">
                        Financial Impact
                      </span>
                      <div className="text-sm font-bold text-emerald-400 mt-1 flex flex-col">
                        <span>
                          Current: $
                          {selectedDefect.maintenanceCost?.toLocaleString() ||
                            0}
                        </span>
                        <span className="text-xs text-slate-500">
                          Predicted (30d): $
                          {selectedDefect.predictedMaintenanceCost?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* === MODULE 4: AI DIRECTIVES === */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col">
                  <h3 className="text-xs uppercase text-slate-400 tracking-widest p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
                    <FileText size={14} /> Executive Summary
                  </h3>
                  <div className="p-5 flex-1 text-sm text-slate-300 leading-relaxed capitalize">
                    {selectedDefect.executiveSummary ||
                      "No executive summary provided."}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col">
                  <h3 className="text-xs uppercase text-slate-400 tracking-widest p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-400" />{" "}
                    Engineering Directive
                  </h3>
                  <div className="p-5 flex-1 text-sm text-slate-300 leading-relaxed font-bold text-red-100">
                    {selectedDefect.recommendation ||
                      "No recommendation provided."}
                  </div>
                </div>
              </section>

              {/* === MODULE 5: VISUAL ANALYTICS === */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col h-[350px]">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center shrink-0">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                      <ImageIcon size={16} /> Thermal / Stress Heatmap
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4 relative bg-black/40">
                    <img
                      src={`http://localhost:5000/heatmaps/${selectedDefect.image || "test_aircraft.jpg"}`}
                      alt="Heatmap overlay"
                      className="w-full h-full object-contain rounded-lg z-10"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 hidden flex-col items-center justify-center text-sm text-slate-600 text-center uppercase tracking-widest z-0">
                      <ImageIcon size={32} className="opacity-50 mb-3" />
                      Image Unavailable
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col h-[350px]">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center shrink-0">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                      <Activity size={16} /> Advanced Analytics Graph
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4 relative bg-black/40">
                    <img
                      src={`http://localhost:5000/graphs/${(selectedDefect.image || "test_aircraft.jpg").replace(/\.[^/.]+$/, ".png")}`}
                      alt="Analytics Graph"
                      className="w-full h-full object-contain rounded-lg z-10"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 hidden flex-col items-center justify-center text-sm text-slate-600 text-center uppercase tracking-widest z-0">
                      <Activity size={32} className="opacity-50 mb-3" />
                      Graph Unavailable
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
