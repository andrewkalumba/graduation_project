"use client";

import Scene from "./components/RotatingCuboids";
import SchemaEditor from "./components/SchemaEditor";
import ContextMenu from "./components/ContextMenu";
import { useState } from "react";
import { useSchema } from "@/store/schemaStore";

export default function Home() {
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

  return (
    <main className="flex w-screen h-screen bg-gray-100">
      {/* Left side - 3D Rotating Cuboids Scene (60%) */}
      <div className="w-[60%] h-full bg-gradient-to-br from-gray-900 to-gray-800 border-r border-gray-700">
        <Scene onContextMenu={handleContextMenu} />
      </div>

      {/* Right side - Schema Editor (40%) */}
      <div className="w-[40%] h-full bg-white overflow-auto">
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