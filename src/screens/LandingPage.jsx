import React, { useState, useEffect, useRef } from "react";
import {
  Plane,
  Activity,
  ShieldAlert,
  Cpu,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Radar,
  AlertTriangle,
  ChevronRight,
  Database,
  Crosshair,
  BrainCircuit,
  Target,
  BarChart3,
  TrendingDown,
  Wrench,
  HeartPulse,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const InteractiveDigitalTwin = () => {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const targetRotation = useRef({ x: 0.2, y: -0.6, z: 0.1 });
  const nodesRef = useRef([]);

  const zones = {
    nose: {
      id: "nose",
      name: "Nose Radome",
      status: "Radar Array Optimal",
      type: "normal",
    },
    leftWing: {
      id: "leftWing",
      name: "Left Wing",
      status: "Structural Optimal",
      type: "normal",
    },
    rightWing: {
      id: "rightWing",
      name: "Right Wing",
      status: "Structural Optimal",
      type: "normal",
    },
    aft: {
      id: "aft",
      name: "Aft Vertical Stabilizer",
      status: "Stress Anomaly Detected",
      type: "danger",
    },
  };

  const [activeZone, setActiveZone] = useState(zones.nose);
  const activeZoneRef = useRef(activeZone);

  // Sync state to ref for Three.js animation loop
  useEffect(() => {
    activeZoneRef.current = activeZone;
    nodesRef.current.forEach((n) => {
      n.isActive = n.id === activeZone.id;
    });
  }, [activeZone]);

  useEffect(() => {
    if (window.THREE) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mountRef.current) return;

    const THREE = window.THREE;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Widened FOV to 45 and pulled camera back to 45 on Z axis so wings don't cut off
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(32, 22, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const airplaneGroup = new THREE.Group();
    const nodesGroup = new THREE.Group();
    scene.add(airplaneGroup);
    scene.add(nodesGroup);

    // Helper to create the layered wireframe hologram effect
    const createHoloMesh = (geometry) => {
      const group = new THREE.Group();

      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x082f49,
        transparent: true,
        opacity: 0.7,
        depthWrite: true,
        side: THREE.DoubleSide,
      });

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      group.add(new THREE.Mesh(geometry, coreMat));
      group.add(new THREE.Mesh(geometry, wireMat));
      return group;
    };

    // 1. Fuselage (Lathe Geometry with aerodynamic bullet nose)
    const points = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = 18 - t * 36; // Length runs from X=18 to X=-18
      let r = 2.4; // Base radius

      if (x > 10) {
        // Smooth aerodynamic sine-wave taper for the nose (no more bottle shape!)
        const nt = (18 - x) / 8;
        r = 2.4 * Math.sin((nt * Math.PI) / 2);
      } else if (x < -8) {
        // Taper down to the tail cone
        const tt = (x + 18) / 10;
        r = 2.4 * Math.pow(tt, 0.65);
      }
      points.push(new THREE.Vector2(r, x));
    }
    const fuseGeo = new THREE.LatheGeometry(points, 48); // 48 radial segments for dense grid
    fuseGeo.rotateZ(-Math.PI / 2); // Point nose towards +X

    // Add cockpit window outlines
    const cockpitGeo = new THREE.BoxGeometry(2, 1, 1.5, 4, 2, 4);
    const pos = cockpitGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > 0) pos.setX(i, pos.getX(i) - 0.5); // Slant back
    }
    cockpitGeo.computeVertexNormals();
    const cockpit = createHoloMesh(cockpitGeo);
    cockpit.position.set(13.5, 1.5, 0);

    const fuselage = createHoloMesh(fuseGeo);
    airplaneGroup.add(fuselage);
    airplaneGroup.add(cockpit);

    // Helper to deform a box into a perfect swept aerodynamic surface
    const createSweptWing = (span, rootChord, tipChord, sweep) => {
      const geo = new THREE.BoxGeometry(1, 0.1, span, 8, 1, 16);
      geo.translate(0, 0, span / 2); // Anchor at root
      const vpos = geo.attributes.position;
      for (let i = 0; i < vpos.count; i++) {
        let x = vpos.getX(i);
        let z = vpos.getZ(i);
        const zRatio = z / span; // 0 at root, 1 at tip

        const currentChord = rootChord * (1 - zRatio) + tipChord * zRatio;
        x *= currentChord; // Apply taper
        x -= zRatio * sweep; // Apply sweep back
        vpos.setX(i, x);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Wings
    const wingGeo = createSweptWing(18, 7, 1.5, 10);

    const rightWing = createHoloMesh(wingGeo);
    rightWing.position.set(2, -0.8, 2);
    airplaneGroup.add(rightWing);

    const leftWing = createHoloMesh(wingGeo);
    leftWing.position.set(2, -0.8, -2);
    leftWing.scale.z = -1; // Mirror
    airplaneGroup.add(leftWing);

    // Horizontal Stabilizers
    const hTailGeo = createSweptWing(7, 3.5, 1, 4.5);
    const hTailR = createHoloMesh(hTailGeo);
    hTailR.position.set(-15, 0.5, 0.5);
    airplaneGroup.add(hTailR);

    const hTailL = createHoloMesh(hTailGeo);
    hTailL.position.set(-15, 0.5, -0.5);
    hTailL.scale.z = -1;
    airplaneGroup.add(hTailL);

    // Vertical Stabilizer (Tail)
    const vTailGeo = createSweptWing(7, 5, 2, 5.5);
    vTailGeo.rotateX(-Math.PI / 2); // Stand it upright
    const vTail = createHoloMesh(vTailGeo);
    vTail.position.set(-14, 1.2, 0);
    airplaneGroup.add(vTail);

    // High-Bypass Turbofan Engines
    const engineGeo = new THREE.CylinderGeometry(0.9, 0.8, 3.5, 24, 6, true);
    engineGeo.rotateZ(Math.PI / 2);

    const engR = createHoloMesh(engineGeo);
    engR.position.set(1, -2, 7);
    airplaneGroup.add(engR);

    const engL = createHoloMesh(engineGeo);
    engL.position.set(1, -2, -7);
    airplaneGroup.add(engL);

    const nodeGeo = new THREE.SphereGeometry(0.6, 16, 16);

    const normalMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.8,
    });
    const warningMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9,
    });
    const dangerMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 1.0,
    });

    const nodesData = [
      { id: "nose", mat: normalMat, pos: [16, 0, 0] },
      { id: "leftWing", mat: normalMat, pos: [-4, -0.8, -12] },
      { id: "rightWing", mat: normalMat, pos: [-4, -0.8, 12] },
      { id: "aft", mat: dangerMat, pos: [-16, 7.5, 0] }, // Tip of tail
    ];

    nodesRef.current = nodesData.map((data) => {
      // Glow halo
      const haloGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: data.mat.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);

      const core = new THREE.Mesh(nodeGeo, data.mat);
      core.userData = { id: data.id };

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...data.pos);
      nodeGroup.add(core);
      nodeGroup.add(halo);

      // Ensure the nodes rotate with the airplane
      airplaneGroup.add(nodeGroup);

      return {
        core,
        halo,
        id: data.id,
        pos: data.pos,
        isActive: activeZoneRef.current.id === data.id,
      };
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      // Check intersections only against the node cores
      const clickableObjects = nodesRef.current.map((n) => n.core);
      const intersects = raycaster.intersectObjects(clickableObjects, false);

      renderer.domElement.style.cursor =
        intersects.length > 0 ? "pointer" : "crosshair";
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickableObjects = nodesRef.current.map((n) => n.core);
      const intersects = raycaster.intersectObjects(clickableObjects, false);

      if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id;
        window.dispatchEvent(
          new CustomEvent("zoneClicked", { detail: clickedId }),
        );
      }
    };

    mountRef.current.addEventListener("mousemove", handlePointerMove);
    mountRef.current.addEventListener("click", handleClick);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle floating animation
      airplaneGroup.position.y = Math.sin(t * 1.5) * 0.5;

      // Smooth interpolation towards mouse target
      airplaneGroup.rotation.x +=
        (targetRotation.current.x - airplaneGroup.rotation.x) * 0.05;
      airplaneGroup.rotation.y +=
        (targetRotation.current.y - airplaneGroup.rotation.y) * 0.05;
      airplaneGroup.rotation.z +=
        (targetRotation.current.z - airplaneGroup.rotation.z) * 0.05;

      // Pulse the active node and animate halos
      nodesRef.current.forEach((n) => {
        const isActive = n.isActive;
        const scale = isActive ? 1.4 + Math.sin(t * 8) * 0.2 : 1;
        n.core.scale.set(scale, scale, scale);

        const haloScale = isActive
          ? 1.5 + Math.sin(t * 4) * 0.3
          : 1 + Math.sin(t * 2 + n.pos[0]) * 0.1;
        n.halo.scale.set(haloScale, haloScale, haloScale);
        n.halo.material.opacity = isActive ? 0.6 : 0.2;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener("mousemove", handlePointerMove);
        mountRef.current.removeEventListener("click", handleClick);
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [loaded]);

  useEffect(() => {
    const handleZoneClick = (e) => setActiveZone(zones[e.detail]);
    window.addEventListener("zoneClicked", handleZoneClick);
    return () => window.removeEventListener("zoneClicked", handleZoneClick);
  }, []);

  const handleMouseMove = (e) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Rotate dramatically to show off the 3D depth
    targetRotation.current.y = -x * Math.PI * 1.5 - 0.6; // Base angle is -0.6
    targetRotation.current.x = y * Math.PI * 0.8 + 0.2; // Base angle is 0.2
    targetRotation.current.z = x * Math.PI * 0.4 + 0.1;
  };

  const handleMouseLeave = () => {
    targetRotation.current = { x: 0.2, y: -0.6, z: 0.1 }; // Cinematic resting angle
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-visible">
      {/* Background glow & radar sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-[100%] blur-[100px] pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/20 rounded-full blur-sm pointer-events-none"
        style={{ transform: "rotateX(70deg)" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-cyan-500/30 rounded-full blur-sm pointer-events-none"
        style={{ transform: "rotateX(70deg)" }}
      ></div>

      {/* Top overlay badges */}
      <div className="absolute top-4 left-4 right-4 lg:left-6 lg:right-6 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-cyan-400 font-mono bg-slate-950/80 px-3 lg:px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Activity className="w-4 h-4 animate-pulse" /> LIVE DIAGNOSTICS
          </div>
          <div className="text-[9px] lg:text-[10px] text-cyan-300 font-mono flex items-center gap-1.5 uppercase tracking-wider bg-cyan-950/60 px-2 lg:px-3 py-1.5 rounded-lg border border-cyan-800/50 backdrop-blur-md">
            <Crosshair className="w-3 h-3 text-cyan-400" /> YOLO Active
          </div>
        </div>
        <div className="text-[10px] lg:text-xs font-mono text-slate-400 mt-1 bg-slate-950/80 px-3 lg:px-4 py-2 rounded-lg border border-slate-800/80 backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
          ID: BOE-787-X
        </div>
      </div>

      {/* 3D Viewport Container */}
      <div
        className="w-full h-full relative flex items-center justify-center min-h-[300px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-mono text-sm animate-pulse z-20">
            Initializing Holographic Grid...
          </div>
        )}
        <div ref={mountRef} className="absolute inset-0 w-full h-full z-10" />

        <div className="absolute bottom-24 left-0 right-0 text-center text-[10px] lg:text-[11px] text-cyan-500/50 uppercase tracking-widest pointer-events-none z-20">
          Move mouse to Orbit • Click Nodes to Inspect
        </div>
      </div>

      {/* Dynamic Status Box */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] lg:w-[90%] max-w-md p-3 lg:p-4 rounded-xl border backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-colors duration-300 ${
          activeZone.type === "danger"
            ? "bg-red-950/60 border-red-500/50"
            : activeZone.type === "warning"
              ? "bg-amber-950/60 border-amber-500/50"
              : "bg-cyan-950/60 border-cyan-500/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <div
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] ${
                activeZone.type === "danger"
                  ? "bg-red-500/20 border-red-500/60 text-red-400"
                  : activeZone.type === "warning"
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-400"
                    : "bg-cyan-500/20 border-cyan-500/60 text-cyan-400"
              }`}
            >
              {activeZone.type === "danger" ? (
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 animate-pulse" />
              ) : activeZone.type === "warning" ? (
                <ShieldAlert className="w-5 h-5 lg:w-6 lg:h-6" />
              ) : (
                <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />
              )}
            </div>
            <div>
              <div className="text-sm lg:text-base font-semibold text-white tracking-wide">
                {activeZone.name}
              </div>
              <div
                className={`text-xs lg:text-sm font-mono mt-0.5 ${
                  activeZone.type === "danger"
                    ? "text-red-400"
                    : activeZone.type === "warning"
                      ? "text-amber-400"
                      : "text-cyan-400"
                }`}
              >
                {activeZone.status}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 opacity-50 hidden sm:block" />
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 py-4" : "bg-transparent py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radar className="w-8 h-8 animate-[spin_4s_linear_infinite]" />
            <span className="text-xl font-bold tracking-wider text-white">
              Aero<span className="text-cyan-400">Twin</span>
            </span>
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Split Layout: Left Text / Right 3D Model */}
      <main className="relative z-10 pt-24 pb-16 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content: Text & CTA */}
          <div className="w-full lg:w-1/2 text-left z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#042f3e]/40 border border-[#0891b2]/30 text-[#22d3ee] text-xs font-semibold uppercase tracking-wide mb-8">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
              SYSTEM ONLINE V2.4
            </div>

            <h1 className="text-6xl lg:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.05]">
              <span className="text-slate-100">Aircraft Health</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#6366f1]">
                Digital Twin
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-400 mb-12 leading-relaxed max-w-xl">
              Experience real-time structural analysis, predictive defect
              mapping, and fleet-wide health diagnostics. Isolate anomalies
              before they become critical failures.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-[#2563eb] hover:to-[#0891b2] text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3"
                onClick={() => handleNav("/inspection")}
              >
                <ScanIcon className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Start Inspection</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/fleet")}
                className="w-full sm:w-auto px-8 py-4 bg-[#0f172a] border border-[#1e293b] hover:bg-[#1e293b] text-slate-300 hover:text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
              >
                <Database className="w-5 h-5" />
                View Fleet Status
              </button>
            </div>
          </div>

          {/* Right Content: 3D Holographic Twin */}
          <div className="w-full lg:w-1/2 h-[500px] lg:h-[80vh] min-h-[600px] relative z-10">
            <InteractiveDigitalTwin />
          </div>
        </div>
      </main>

      {/* Intelligence Report Section */}
      <section className="relative z-10 py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                INTELLIGENT DEFECT MAPPING
              </h2>
              <p className="text-slate-400 text-sm font-mono mt-1">
                3D Digital Twin & AI Analytics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-cyan-400">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">
                  3D Digital Twin Advantage
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                By integrating{" "}
                <span className="text-white font-semibold">
                  YOLO object detection
                </span>{" "}
                directly with our{" "}
                <span className="text-white font-semibold">
                  3D Digital Twin
                </span>{" "}
                environment, we provide full spatial context to structural
                anomalies. This immersive approach allows engineers to isolate
                and visualize defects significantly faster and with greater
                accuracy than traditional 2D scanning.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 flex items-start gap-3">
                <Crosshair className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-cyan-100 text-sm leading-relaxed">
                  Easily map micro-cracks, dents, and delamination across the
                  entire aerodynamic structure in real-time.
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">
                  Risk Assessment Metrics
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-5">
                Our AI engine continuously evaluates detected anomalies against
                historical fleet data using these core statistical drivers:
              </p>
              <div className="space-y-3">
                <MetricDriver
                  label="Severity Score"
                  desc="Impact on overall structural integrity"
                />
                <MetricDriver
                  label="Urgency Factor"
                  desc="Estimated time until critical threshold"
                />
                <MetricDriver
                  label="Fleet Occurrences"
                  desc="Frequency of similar defects across fleet"
                />
                <MetricDriver
                  label="Confidence Level"
                  desc="AI certainty in defect classification"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <TrendingDown className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">
                  Health & Trend Analytics
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-5">
                Predictive maintenance is powered by tracking these long-term
                statistical trends:
              </p>
              <div className="space-y-3">
                <MetricDriver
                  label="Remaining Structural Health"
                  desc="Percentage of viable component lifespan"
                />
                <MetricDriver
                  label="Defect Expansion Rate"
                  desc="Measured physical growth over time"
                />
                <MetricDriver
                  label="Predicted Future Risk"
                  desc="Forecasted severity within a 30-day window"
                />
                <MetricDriver
                  label="Priority Rank"
                  desc="Maintenance queue prioritization"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section
        id="features"
        className="relative z-10 py-24 bg-slate-900/50 border-t border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Precision Engineering Intelligence
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Move from reactive maintenance to predictive health management
              with advanced multi-physics models and real-time sensor data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldAlert className="w-6 h-6 text-cyan-400" />}
              title="Defect Prediction Map"
              desc="Visualize micro-fractures, composite delamination, and structural fatigue before they trigger automated alarms."
            />
            <FeatureCard
              icon={<Cpu className="w-6 h-6 text-blue-400" />}
              title="Digital Thread Integration"
              desc="Connect manufacturing data, maintenance history, and flight telemetry into a single, cohesive timeline."
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-indigo-400" />}
              title="Predictive RUL Analysis"
              desc="Calculate Remaining Useful Life (RUL) of critical components using machine learning and historical fleet data."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Radar className="w-6 h-6 text-cyan-500/50" />
            <span className="font-bold text-lg">AeroTwin</span>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; 2026 Aerospace Digital Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const ScanIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line
      x1="7"
      y1="12"
      x2="17"
      y2="12"
      className="animate-[ping_2s_ease-in-out_infinite]"
    />
  </svg>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800/80 transition-all duration-300 group cursor-default">
    <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const MetricDriver = ({ label, desc }) => (
  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
    <div className="text-sm font-semibold text-white mb-1">{label}</div>
    <div className="text-xs text-slate-400">{desc}</div>
  </div>
);

export default LandingPage;
