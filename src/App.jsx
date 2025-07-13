import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button.jsx";
import { useCircuitStore } from "./store/circuitStore";
import DraggableComponent from "./components/DraggableComponent";
import LogicComponent from "./components/LogicComponent";
import Wire from "./components/Wire";
import TruthTable from "./components/TruthTable";
import AppLogo from "./components/AppLogo";
import LampuIcon from "./components/LampuIcon";
import "./App.css";

function App() {
  const {
    components,
    connections,
    mode,
    setMode,
    addComponent,
    reset,
    inputValues,
    setInputValue,
    calculateOutputs,
    connectionMode,
    tempConnection,
    setConnectionMode,
    setTempConnection,
    removeConnection,
  } = useCircuitStore();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const saveCircuit = useCircuitStore((s) => s.saveCircuit);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);

  // Handle mouse move for temporary connection
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (connectionMode && tempConnection) {
        const canvasRect = document
          .querySelector(".canvas-area")
          .getBoundingClientRect();
        setTempConnection({
          ...tempConnection,
          toPos: {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
          },
        });
      }
    };

    const handleTouchMove = (e) => {
      if (connectionMode && tempConnection && e.touches.length === 1) {
        const touch = e.touches[0];
        const canvasRect = document
          .querySelector(".canvas-area")
          .getBoundingClientRect();
        setTempConnection({
          ...tempConnection,
          toPos: {
            x: touch.clientX - canvasRect.left,
            y: touch.clientY - canvasRect.top,
          },
        });
        e.preventDefault(); // Prevent scrolling while connecting wires
      }
    };

    const handleMouseUp = () => {
      if (connectionMode) {
        setConnectionMode(false);
        setTempConnection(null);
      }
    };

    const handleTouchEnd = () => {
      if (connectionMode) {
        setConnectionMode(false);
        setTempConnection(null);
      }
    };

    if (connectionMode) {
      // Mouse events
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Touch events
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      // Clean up mouse events
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Clean up touch events
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [connectionMode, tempConnection, setConnectionMode, setTempConnection]);

  // Fungsi untuk menambah gerbang logika
  const addGate = (type) => {
    const newComponent = {
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      inputs: type === "NOT" ? 1 : 2,
      outputs: 1,
    };
    addComponent(newComponent);
  };

  // Fungsi untuk menambah input/output
  const addInputOutput = (type) => {
    const newComponent = {
      type,
      position: {
        x: type === "INPUT" ? 50 : 400,
        y: 100 + Math.random() * 200,
      },
      inputs: type === "INPUT" ? 0 : 1,
      outputs: type === "INPUT" ? 1 : 0,
    };
    addComponent(newComponent);
  };

  // Fungsi untuk toggle input value
  const toggleInput = (id, currentValue) => {
    setInputValue(id, !currentValue);
    // Recalculate outputs setelah input berubah
    setTimeout(() => calculateOutputs(), 0);
  };

  // Sidebar content as a function for reuse
  const SidebarContent = () => (
    <>
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">🧩</span>
        Komponen
      </h2>

      {/* Input/Output */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">🔌</span>
          Input/Output
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {/* Input Switch */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => addInputOutput("INPUT")}
            disabled={mode === "simulate"}
            className="gate-button justify-start h-12 text-left bg-green-50 border-green-200 hover:bg-green-100 text-green-800 flex items-center gap-3 shadow-none rounded-xl"
          >
            <span className="inline-block w-5 h-5 rounded-full bg-green-600 border-2 border-green-700 mr-2"></span>
            Input Switch
          </Button>
          {/* Output Angka */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => addInputOutput("OUTPUT")}
            disabled={mode === "simulate"}
            className="gate-button justify-start h-12 text-left bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800 flex items-center gap-3 shadow-none rounded-xl"
          >
            <span className="inline-block w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-700 mr-2"></span>
            Output Angka
          </Button>
          {/* Output Lampu */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => addInputOutput("OUTPUT_LED_ICON")}
            disabled={mode === "simulate"}
            className="gate-button justify-start h-12 text-left bg-red-50 border-red-200 hover:bg-red-100 text-red-800 flex items-center gap-3 shadow-none rounded-xl"
          >
            <span className="inline-block w-5 h-5 mr-2">
              <img
                src="/assets/L2.jpg"
                alt="Lampu Nyala"
                className="w-5 h-5 object-contain"
              />
            </span>
            Output Lampu
          </Button>
        </div>
      </div>

      {/* Logic Gates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">⚙️</span>
          Gerbang Logika Dasar
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: "AND", color: "blue", image: "/assets/gates/AND.jpg" },
            { type: "OR", color: "purple", image: "/assets/gates/OR.jpg" },
            { type: "NOT", color: "orange", image: "/assets/gates/NOT.jpg" },
            { type: "NAND", color: "teal", image: "/assets/gates/NAND.jpg" },
            { type: "NOR", color: "pink", image: "/assets/gates/NOR.jpg" },
            { type: "XOR", color: "indigo", image: "/assets/gates/XOR.jpg" },
            { type: "XNOR", color: "emerald", image: "/assets/gates/XNOR.jpg" },
          ].map(({ type, color, image }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => addGate(type)}
              disabled={mode === "simulate"}
              className={`gate-button h-12 bg-gradient-to-r from-${color}-50 to-${color}-100 border-${color}-200 hover:from-${color}-100 hover:to-${color}-200 text-${color}-800 font-semibold`}
            >
              <img
                src={image}
                alt={type}
                className="w-6 h-6 object-contain mr-2"
              />
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Flip-Flop Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">🔄</span>
          Flip-Flop
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addComponent({
                type: "SR_FLIPFLOP",
                position: {
                  x: 150 + Math.random() * 200,
                  y: 150 + Math.random() * 200,
                },
                inputs: 3, // S, R, CLK
                outputs: 2, // Q, Q̅
              })
            }
            disabled={mode === "simulate"}
            className="gate-button h-12 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-800 font-semibold"
          >
            SR Flip-Flop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addComponent({
                type: "D_FLIPFLOP",
                position: {
                  x: 150 + Math.random() * 200,
                  y: 150 + Math.random() * 200,
                },
                inputs: 2, // D, CLK
                outputs: 2, // Q, Q̅
              })
            }
            disabled={mode === "simulate"}
            className="gate-button h-12 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-800 font-semibold"
          >
            D Flip-Flop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addComponent({
                type: "JK_FLIPFLOP",
                position: {
                  x: 150 + Math.random() * 200,
                  y: 150 + Math.random() * 200,
                },
                inputs: 3, // J, K, CLK
                outputs: 2, // Q, Q̅
              })
            }
            disabled={mode === "simulate"}
            className="gate-button h-12 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-800 font-semibold"
          >
            JK Flip-Flop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addComponent({
                type: "T_FLIPFLOP",
                position: {
                  x: 150 + Math.random() * 200,
                  y: 150 + Math.random() * 200,
                },
                inputs: 2, // T, CLK
                outputs: 2, // Q, Q̅
              })
            }
            disabled={mode === "simulate"}
            className="gate-button h-12 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-800 font-semibold"
          >
            T Flip-Flop
          </Button>
        </div>
      </div>

      {/* Input Controls (hanya tampil di simulate mode) */}
      {mode === "simulate" && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">🎛️</span>
            Input Controls
          </h3>
          <div className="space-y-3">
            {components
              .filter((c) => c.type === "INPUT")
              .map((input) => (
                <div
                  key={input.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {input.id}
                  </span>
                  <Button
                    size="sm"
                    variant={inputValues[input.id] ? "default" : "outline"}
                    onClick={() =>
                      toggleInput(input.id, inputValues[input.id])
                    }
                    className={`transition-all duration-200 ${
                      inputValues[input.id]
                        ? "bg-green-500 hover:bg-green-600 glow"
                        : ""
                    }`}
                  >
                    {inputValues[input.id] ? "1" : "0"}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Truth Table */}
      <div className="mb-8">
        <TruthTable />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Instruksi:
        </h4>
        <ul className="text-xs text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Drag komponen untuk memindahkan
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Klik kanan untuk menghapus
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Tekan Delete untuk menghapus yang dipilih
          </li>
          {mode === "edit" && (
            <>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Drag dari output pin ke input pin untuk koneksi
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Klik kanan pada wire untuk menghapus koneksi
              </li>
            </>
          )}
          {mode === "simulate" && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Klik input untuk toggle nilai
            </li>
          )}
        </ul>
      </div>
    </>
  );

  // Handler untuk file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        loadCircuit(data);
      } catch (err) {
        alert("File tidak valid!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div
        className="header-gradient shadow-lg p-2"
        style={{ background: "#1B296D" }}
      >
        <div className="flex flex-row justify-between items-center relative gap-2">
          {/* Logo dan judul compact */}
          <div className="flex items-center space-x-2">
            <button
              className="lg:hidden mr-2 p-1 rounded hover:bg-white/20 focus:outline-none"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
            >
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2">
                <path d="M4 7h20M4 14h20M4 21h20" />
              </svg>
            </button>
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
              <AppLogo size={22} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Simulasi Logika
            </span>
          </div>
          {/* Baris tombol compact */}
          <div className="flex gap-1 items-center">
            <Button
              onClick={saveCircuit}
              size="icon"
              variant="outline"
              className="border-2 border-purple-400 text-purple-700 bg-white/90 hover:bg-purple-100 rounded-md p-1"
              title="Save (Simpan Rangkaian)"
              style={{ minWidth: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="mr-1"
              >
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="2"
                  fill="#fff"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
                <rect
                  x="6"
                  y="6"
                  width="8"
                  height="5"
                  rx="1"
                  fill="#a78bfa"
                />
                <rect
                  x="7.5"
                  y="13"
                  width="5"
                  height="2"
                  rx="0.5"
                  fill="#a78bfa"
                />
              </svg>
            </Button>
            <Button
              onClick={() => fileInputRef.current.click()}
              size="icon"
              variant="outline"
              className="border-2 border-purple-400 text-purple-700 bg-white/90 hover:bg-purple-100 rounded-md p-1"
              title="Load (Muat Rangkaian)"
              style={{ minWidth: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="mr-1"
              >
                <rect
                  x="2.5"
                  y="6"
                  width="15"
                  height="9.5"
                  rx="2"
                  fill="#fff"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
                <path
                  d="M2.5 7.5h15V8a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-.5z"
                  fill="#a78bfa"
                />
              </svg>
            </Button>
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              onClick={() => setMode("edit")}
              size="icon"
              variant="outline"
              className={`border-2 ${
                mode === "edit"
                  ? "border-purple-500 bg-white text-purple-700 shadow-purple-200"
                  : "border-purple-300 bg-white/80 text-purple-400 hover:bg-white"
              } rounded-md p-1`}
              title="Edit Mode"
              style={{ minWidth: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="mr-1"
              >
                <path
                  d="M4 16l1.5-5.5L14 2.5a2 2 0 0 1 2.8 2.8L8.5 15.5L4 16z"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="15.5" cy="4.5" r="1.5" fill="#a78bfa" />
              </svg>
            </Button>
            <Button
              onClick={() => {
                setMode("simulate");
                calculateOutputs();
              }}
              size="icon"
              variant="outline"
              className={`border-2 ${
                mode === "simulate"
                  ? "border-purple-500 bg-purple-100 text-black shadow-purple-200"
                  : "border-purple-300 bg-white/80 text-black hover:bg-purple-50"
              } rounded-md p-1`}
              title="Simulate Mode"
              style={{ minWidth: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="mr-1"
              >
                <polygon
                  points="6,4 16,10 6,16"
                  fill="#a78bfa"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
              </svg>
            </Button>
            <Button
              variant="destructive"
              onClick={reset}
              size="icon"
              className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-md p-1"
              title="Reset (Hapus Semua)"
              style={{ minWidth: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="mr-1"
              >
                <rect
                  x="5"
                  y="7"
                  width="10"
                  height="8"
                  rx="2"
                  fill="#fff"
                  stroke="#e53e3e"
                  strokeWidth="1.5"
                />
                <rect
                  x="8"
                  y="10"
                  width="1.5"
                  height="3"
                  rx="0.5"
                  fill="#e53e3e"
                />
                <rect
                  x="10.5"
                  y="10"
                  width="1.5"
                  height="3"
                  rx="0.5"
                  fill="#e53e3e"
                />
                <rect
                  x="7"
                  y="4"
                  width="6"
                  height="2"
                  rx="1"
                  fill="#e53e3e"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Toolbox (desktop only) */}
        <div className="hidden lg:block w-80 bg-white/95 backdrop-blur-sm shadow-xl p-6 min-h-screen overflow-y-auto border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Drawer Overlay (mobile only) */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        {/* Drawer Menu (mobile only) */}
        <div
          className={`fixed top-0 left-0 h-full w-72 max-w-full bg-white shadow-2xl z-50 transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
          style={{ minHeight: "100vh" }}
        >
          <button
            className="absolute top-4 right-4 z-50 bg-gray-100 rounded-full p-2 shadow"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-6 pt-16 overflow-y-auto h-full" onClick={() => setDrawerOpen(false)}>
            <SidebarContent />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen canvas-area">
          <div className="absolute inset-0 overflow-hidden">
            {/* Enhanced Grid background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0),
                  linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px, 20px 20px, 20px 20px",
              }}
            />

            {/* SVG for wires */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render existing connections */}
              {connections.map((connection) => (
                <Wire
                  key={connection.id}
                  connection={connection}
                  onDelete={removeConnection}
                />
              ))}

              {/* Render temporary connection */}
              {tempConnection && (
                <path
                  d={`M ${tempConnection.fromPos.x} ${tempConnection.fromPos.y} L ${tempConnection.toPos.x} ${tempConnection.toPos.y}`}
                  stroke="#6b7280"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  fill="none"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Render components */}
            {components.map((component) => (
              <DraggableComponent key={component.id} component={component}>
                <LogicComponent component={component} />
              </DraggableComponent>
            ))}

            {/* Enhanced instructions overlay when no components */}
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 float">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-700">
                    Canvas Kosong
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tambahkan komponen dari sidebar untuk memulai
                  </p>
                  <div className="text-sm text-gray-500">
                    Mulai dengan menambahkan Input Switch dan Output LED
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

