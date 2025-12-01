"use client";

import Scene from "./components/RotatingCuboids";
import SchemaEditor from "./components/SchemaEditor";
import ContextMenu from "./components/ContextMenu";
import { useState } from "react";
import { useSchema } from "@/store/schemaStore";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "./components/Auth/LoginPage";
import { SignupPage } from "./components/Auth/SignupPage";
import { SetupPage } from "./components/Auth/SetupPage";

type AuthView = "setup" | "login" | "signup";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [show3DScene, setShow3DScene] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tableId: string;
    tableName: string;
  } | null>(null);

  const deleteTable = useSchema((s) => s.deleteTable);
  const setConnectMode = useSchema((s) => s.setConnectMode);
  const setSelected = useSchema((s) => s.setSelected);

  const handleContextMenu = (
    x: number,
    y: number,
    tableId: string,
    tableName: string
  ) => {
    console.log("handleContextMenu called:", { x, y, tableId, tableName });
    setContextMenu({ x, y, tableId, tableName });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-white text-xl font-medium">Loading Visubase...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not logged in
  if (!user) {
    if (authView === "setup") {
      return <SetupPage onComplete={() => setAuthView("login")} />;
    }
    if (authView === "signup") {
      return (
        <SignupPage
          onSwitchToLogin={() => setAuthView("login")}
          onSwitchToSetup={() => setAuthView("setup")}
        />
      );
    }
    return (
      <LoginPage
        onSwitchToSignup={() => setAuthView("signup")}
        onSwitchToSetup={() => setAuthView("setup")}
      />
    );
  }

  // User is logged in - show main app
  return (
    <main className="flex flex-col lg:flex-row w-screen h-screen bg-gray-100 overflow-hidden relative">
      {/* Toggle 3D Scene Button - Mobile/Tablet Only */}
      <button
        onClick={() => setShow3DScene(!show3DScene)}
        className="lg:hidden fixed top-4 right-4 z-30 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <span>{show3DScene ? "📊" : "🎨"}</span>
        <span>{show3DScene ? "Show Editor" : "Show 3D"}</span>
      </button>

      {/* Left side - 3D Rotating Cuboids Scene (60% on desktop, toggleable on mobile/tablet) */}
      <div
        className={`w-full lg:w-[60%] bg-gradient-to-br from-gray-900 to-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 flex-shrink-0 transition-all duration-300 ${
          show3DScene
            ? "h-[35vh] md:h-[40vh] lg:h-full"
            : "h-0 lg:h-full overflow-hidden"
        }`}
      >
        <Scene onContextMenu={handleContextMenu} />
      </div>

      {/* Right side - Schema Editor (40% on desktop, scrollable on mobile/tablet) */}
      <div className="w-full lg:w-[40%] flex-1 lg:h-full bg-white flex flex-col min-h-0">
        <SchemaEditor />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tableId={contextMenu.tableId}
          tableName={contextMenu.tableName}
          onClose={() => setContextMenu(null)}
          onDelete={() => {
            deleteTable(contextMenu.tableId);
            setContextMenu(null);
          }}
          onConnect={() => {
            setConnectMode(contextMenu.tableId);
            setContextMenu(null);
          }}
          onRename={() => {
            setSelected(contextMenu.tableId);
            setContextMenu(null);
          }}
        />
      )}
    </main>
  );
}