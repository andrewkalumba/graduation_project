"use client";

import { useSchema, Column  } from "@/store/schemaStore";
import React, { useState } from "react";
import {
  syncSchemaToSupabase,
  createTablesInSupabase,
  generateSQL,
  exportSchemaAsJSON,
  initializeSupabaseStorage,
  SETUP_SQL,
} from "@/lib/supabaseSync";
import { SetupGuide } from "@/app/components/SetupGuide";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Calculate geometric position for tables
 * - First 3 tables: Triangle (equilateral)
 * - Tables 4-6: Square around the triangle
 * - Tables 7-12: Hexagon around the square
 * - Tables 13+: Expanding circles
 */
function calculateGeometricPosition(index: number): [number, number, number] {
  // First 3 tables: Triangle
  if (index === 0) return [-6, 0, 0]; // Left vertex
  if (index === 1) return [6, 0, 0]; // Right vertex
  if (index === 2) return [0, 8, 0]; // Top vertex

  // Tables 4-6: Square corners around triangle
  if (index === 3) return [-10, 8, 0]; // Top-left
  if (index === 4) return [10, 8, 0]; // Top-right
  if (index === 5) return [0, -6, 0]; // Bottom

  // Tables 7-12: Hexagon
  if (index === 6) return [-12, -2, 0];
  if (index === 7) return [-12, 10, 0];
  if (index === 8) return [0, 14, 0];
  if (index === 9) return [12, 10, 0];
  if (index === 10) return [12, -2, 0];
  if (index === 11) return [0, -12, 0];

  // Tables 13+: Expanding circles
  const circleIndex = index - 12;
  const radius = 18 + Math.floor(circleIndex / 8) * 6;
  const angle = (circleIndex % 8) * (Math.PI / 4);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return [x, y, 0];
}

const DATA_TYPES = [
  "text",
  "integer",
  "bigint",
  "boolean",
  "timestamp",
  "timestamptz",
  "uuid",
  "json",
  "jsonb",
  "varchar",
  "decimal",
  "real",
  "double precision",
  "serial",
  "bigserial",
  "date",
  "time",
  "int2",
  "int4",
  "int8",
  "bytea",
];

const SchemaEditor = () => {
  const { user, signOut, getUserDisplayName } = useAuth();
  const tables = useSchema((s) => s.tables);
  const relationships = useSchema((s) => s.relationships);
  const selected = useSchema((s) => s.selected);
  const addColumn = useSchema((s) => s.addColumn);
  const updateColumn = useSchema((s) => s.updateColumn);
  const deleteColumn = useSchema((s) => s.deleteColumn);
  const renameTable = useSchema((s) => s.renameTable);
  const addTable = useSchema((s) => s.addTable);
  const deleteTable = useSchema((s) => s.deleteTable);
  const deleteRelationship = useSchema((s) => s.deleteRelationship);
  const updateRelationship = useSchema((s) => s.updateRelationship);
  const addRelationship = useSchema((s) => s.addRelationship);

  const [activeTable, setActiveTable] = useState<string | null>(null);

  // Sync activeTable with selected cuboid from store
  React.useEffect(() => {
    if (selected && selected !== activeTable) {
      setActiveTable(selected);
    }
  }, [selected]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [creatingTables, setCreatingTables] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);

  const [editingColumn, setEditingColumn] = useState<number | null>(null);

  // Supabase connection credentials (with localStorage persistence)
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Record<string, any>>({});
  const [supabaseProjects, setSupabaseProjects] = useState<Record<string, any>>({});
  const [loadingSupabaseProjects, setLoadingSupabaseProjects] = useState(false);

  // Load saved credentials on mount and show welcome message
  React.useEffect(() => {
    const savedUrl = localStorage.getItem("visubase_url");
    const savedKey = localStorage.getItem("visubase_key");
    const hasSeenWelcome = localStorage.getItem("visubase_seen_welcome");

    if (savedUrl) setSupabaseUrl(savedUrl);
    if (savedKey) setSupabaseKey(savedKey);

    // Show welcome message for first-time users
    if (!hasSeenWelcome && tables.length <= 3) {
      setTimeout(() => {
        setSyncMessage("👋 Welcome to Visubase! Design your schema visually, then click 'Connect' to sync with Supabase.");
        localStorage.setItem("visubase_seen_welcome", "true");
      }, 1000);
      setTimeout(() => setSyncMessage(null), 8000);
    }
  }, []);

  // Save credentials when they change
  const handleSaveCredentials = (url: string, key: string) => {
    setSupabaseUrl(url);
    setSupabaseKey(key);
    if (url && key) {
      localStorage.setItem("visubase_url", url);
      localStorage.setItem("visubase_key", key);
    }
  };

  const handleClearCredentials = () => {
    setSupabaseUrl("");
    setSupabaseKey("");
    localStorage.removeItem("visubase_url");
    localStorage.removeItem("visubase_key");
  };

  const handleSetupComplete = (url: string, key: string) => {
    handleSaveCredentials(url, key);
    setShowSetupGuide(false);
    setShowConnectionForm(false);
    setSyncMessage("✅ Connected to Supabase! You can now sync your schemas.");
    setTimeout(() => setSyncMessage(null), 5000);
  };
  const [editingRelationship, setEditingRelationship] = useState<number | null>(null);
  const [relationshipFKName, setRelationshipFKName] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  // Relationship form state
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [relationshipFromTable, setRelationshipFromTable] = useState("");
  const [relationshipToTable, setRelationshipToTable] = useState("");
  const [relationshipFKColumnName, setRelationshipFKColumnName] = useState("");
  const [relationshipFromColumn, setRelationshipFromColumn] = useState("");
  const [relationshipToColumn, setRelationshipToColumn] = useState("");
  const [newColumn, setNewColumn] = useState<Column>({
    name: "",
    type: "text",
    nullable: true,
    unique: false,
    primaryKey: false,
  });
  const [editColumnData, setEditColumnData] = useState<Column>({
    name: "",
    type: "text",
    nullable: true,
    unique: false,
    primaryKey: false,
  });

  const handleSync = async () => {
    // Check if connected
    if (!supabaseUrl || !supabaseKey) {
      setSyncMessage("❌ Please connect to Supabase first! Click the 'Connect' button above.");
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }

    // Validate schema before syncing
    if (tables.length === 0) {
      setSyncMessage("❌ No tables to sync! Add at least one table first.");
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }

    // Check if tables have columns
    const tablesWithoutColumns = tables.filter(t => !t.columns || t.columns.length === 0);
    if (tablesWithoutColumns.length > 0) {
      setSyncMessage(`⚠️ Warning: ${tablesWithoutColumns.length} table(s) have no columns. Add columns for better schema design.`);
      setTimeout(() => setSyncMessage(null), 6000);
      // Continue anyway - some users might want empty tables
    }

    setSyncing(true);
    setSyncMessage("🔄 Syncing schema to Supabase...");

    const schema = { tables, relationships };

    // Step 1: Save schema design
    const saveResult = await syncSchemaToSupabase(schema, "default", supabaseUrl, supabaseKey);

    if (!saveResult.success) {
      // Check if it's the schemas table missing error
      if (saveResult.message?.includes("schemas") || saveResult.message?.includes("PGRST205")) {
        setSyncMessage("🔧 Setting up Visubase storage table...");

        // Try to initialize the storage automatically
        const initResult = await initializeSupabaseStorage(supabaseUrl, supabaseKey);

        if (initResult.success) {
          setSyncMessage("✅ Setup complete! Syncing now...");

          // Retry the sync after successful initialization
          const retryResult = await syncSchemaToSupabase(schema, "default", supabaseUrl, supabaseKey);

          if (retryResult.success) {
            setSyncMessage("💾 Schema saved! Creating tables...");
            const createResult = await createTablesInSupabase(schema, supabaseUrl, supabaseKey);

            if (createResult.success) {
              setSyncMessage("✅ Synced & Tables Created!");
            } else {
              setSyncMessage(`⚠️ Schema saved but tables failed: ${createResult.message}`);
            }
          } else {
            setSyncMessage(`❌ ${retryResult.message}`);
          }
        } else {
          setSyncMessage("❌ Auto-setup failed. Check console for manual SQL.");
          console.error("=== MANUAL SETUP REQUIRED ===");
          console.error("Please run this SQL in your Supabase SQL Editor:");
          console.error(SETUP_SQL);
          setTimeout(() => setSyncMessage(null), 10000);
        }
      } else {
        setSyncMessage(`❌ ${saveResult.message}`);
        setTimeout(() => setSyncMessage(null), 5000);
      }
      setSyncing(false);
      return;
    }

    // Step 2: Create actual database tables
    setSyncMessage("💾 Schema saved! Creating tables...");
    const createResult = await createTablesInSupabase(schema, supabaseUrl, supabaseKey);

    if (createResult.success) {
      setSyncMessage("✅ Synced & Tables Created!");
    } else {
      setSyncMessage(`⚠️ Schema saved but tables failed: ${createResult.message}`);
    }

    setSyncing(false);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleCreateTablesOnly = async () => {
    // Check if connected
    if (!supabaseUrl || !supabaseKey) {
      setSyncMessage("❌ Please connect to Supabase first! Click the 'Connect' button above.");
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }

    // Validate schema before creating tables
    if (tables.length === 0) {
      setSyncMessage("❌ No tables to create! Add at least one table first.");
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }

    setCreatingTables(true);
    setSyncMessage("🔨 Creating tables in Supabase...");

    const schema = { tables, relationships };
    const result = await createTablesInSupabase(schema, supabaseUrl, supabaseKey);

    if (result.success) {
      setSyncMessage("✅ Database tables created!");
    } else {
      setSyncMessage(`❌ ${result.message}`);
    }

    setCreatingTables(false);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleExportSQL = () => {
    const schema = { tables, relationships };
    const sql = generateSQL(schema);
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.sql";
    a.click();
  };

  const handleExportJSON = () => {
    const schema = { tables, relationships };
    const json = exportSchemaAsJSON(schema);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
  };

  const handleAddColumn = () => {
    if (activeTable && newColumn.name.trim()) {
      addColumn(activeTable, newColumn);
      setNewColumn({
        name: "",
        type: "text",
        nullable: true,
        unique: false,
        primaryKey: false,
      });
      setAddingColumn(false);
    }
  };

  const handleStartEditColumn = (index: number, column: Column) => {
    setEditingColumn(index);
    setEditColumnData({ ...column });
  };

  const handleSaveEditColumn = () => {
    if (activeTable !== null && editingColumn !== null && editColumnData.name.trim()) {
      updateColumn(activeTable, editingColumn, editColumnData);
      setEditingColumn(null);
      setEditColumnData({
        name: "",
        type: "text",
        nullable: true,
        unique: false,
        primaryKey: false,
      });
    }
  };

  const handleDeleteColumn = (index: number) => {
    if (activeTable !== null) {
      deleteColumn(activeTable, index);
    }
  };

  const handleAddTable = () => {
    if (newTableName.trim()) {
      // Calculate geometric position for new table
      const tableCount = tables.length;
      const position = calculateGeometricPosition(tableCount);

      const newTable = {
        id: `table_${Date.now()}`,
        name: newTableName,
        color: "#3b82f6", // Blue color
        position,
        columns: [],
      };
      addTable(newTable);
      setActiveTable(newTable.id);
      setNewTableName("");
      setAddingTable(false);
    }
  };

  const handleDeleteTable = (tableId: string) => {
    toast.warning("Delete table?", {
      description: "This will also remove all relationships.",
      action: {
        label: "Delete",
        onClick: () => {
          deleteTable(tableId);
          if (activeTable === tableId) {
            setActiveTable(null);
          }
          toast.success("Table deleted successfully");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleCreateRelationshipFromForm = () => {
    // Validate inputs
    if (!relationshipFromTable || !relationshipToTable) {
      setSyncMessage("❌ Please select both FROM and TO tables");
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    if (!relationshipFKColumnName.trim()) {
      setSyncMessage("❌ Please enter a foreign key column name");
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    // Find table IDs by name
    const fromTable = tables.find(t => t.name === relationshipFromTable);
    const toTable = tables.find(t => t.name === relationshipToTable);

    if (!fromTable || !toTable) {
      setSyncMessage("❌ Could not find selected tables");
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    // Create the relationship with column specifications
    addRelationship(
      fromTable.id,
      toTable.id,
      relationshipFKColumnName.trim(),
      relationshipFromColumn || undefined,
      relationshipToColumn || undefined
    );

    // Reset form
    setRelationshipFromTable("");
    setRelationshipToTable("");
    setRelationshipFKColumnName("");
    setRelationshipFromColumn("");
    setRelationshipToColumn("");
    setShowRelationshipForm(false);

    const fromColText = relationshipFromColumn ? ` (${relationshipFromColumn})` : "";
    const toColText = relationshipToColumn ? ` → ${toTable.name}.${relationshipToColumn}` : "";
    setSyncMessage(`✅ Relationship created: ${fromTable.name}${fromColText} → ${toTable.name}${toColText} (FK: ${relationshipFKColumnName})`);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleResetAll = () => {
    toast.error("Reset all data?", {
      description: "This will delete ALL tables, columns, and relationships. This cannot be undone.",
      action: {
        label: "Reset",
        onClick: () => {
          localStorage.removeItem("visubase-storage");
          window.location.reload();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleNewProject = () => {
    toast.info("Create new project?", {
      description: "This will save your current work and start fresh.",
      action: {
        label: "Create",
        onClick: () => {
          localStorage.removeItem("visubase-storage");
          window.location.reload();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleSaveCurrentProject = () => {
    const projectName = prompt("💾 Name this project:", `project_${Date.now()}`);
    if (!projectName) return;

    if (!projectName.trim()) {
      toast.error("Project name cannot be empty!");
      return;
    }

    // Get all saved projects
    const allProjects = JSON.parse(localStorage.getItem("visubase-projects") || "{}");

    // Save current schema
    const currentSchema = { tables, relationships };
    allProjects[projectName] = {
      schema: currentSchema,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("visubase-projects", JSON.stringify(allProjects));
    console.log("✅ Project saved:", projectName, allProjects[projectName]);

    setSyncMessage(`✅ Project "${projectName}" saved! Click "📂 Load Project" to see it.`);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleLoadProject = () => {
    const projects = JSON.parse(localStorage.getItem("visubase-projects") || "{}");
    const projectNames = Object.keys(projects).filter(name => !name.startsWith("_")); // Filter out internal projects

    console.log("📂 All projects in localStorage:", projects);
    console.log("📂 Visible project names:", projectNames);

    if (projectNames.length === 0) {
      toast.info("No saved projects found", {
        description: "Save your current project first using '💾 Save Project'!",
      });
      return;
    }

    setSavedProjects(projects);
    setShowProjectSelector(true);
  };

  const handleSelectProject = (projectName: string) => {
    // Save current work before loading
    const currentBackup = { tables, relationships };
    const projects = { ...savedProjects };
    projects["_autosave_backup"] = {
      schema: currentBackup,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("visubase-projects", JSON.stringify(projects));

    // Load selected project into the store
    const loadedSchema = savedProjects[projectName].schema;
    localStorage.setItem("visubase-storage", JSON.stringify({
      state: {
        tables: loadedSchema.tables,
        relationships: loadedSchema.relationships,
        selected: null,
        connectMode: null,
      },
      version: 0,
    }));

    // Reload to apply changes
    window.location.reload();
  };

  const handleDeleteProject = (projectName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the load
    toast.warning(`Delete project "${projectName}"?`, {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          const projects = { ...savedProjects };
          delete projects[projectName];
          localStorage.setItem("visubase-projects", JSON.stringify(projects));
          setSavedProjects(projects);
          toast.success(`Project "${projectName}" deleted`);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleFetchSupabaseProjects = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Please connect to Supabase first!");
      return;
    }

    setLoadingSupabaseProjects(true);
    setSyncMessage("🔄 Fetching saved schemas from Supabase...");

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl, supabaseKey);

      // Fetch all schemas from Supabase
      const { data, error } = await client
        .from("schemas")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setSyncMessage("📂 No schemas found in Supabase");
        setTimeout(() => setSyncMessage(null), 3000);
        setLoadingSupabaseProjects(false);
        return;
      }

      // Convert Supabase schemas to project format
      const supabaseProjectsData: Record<string, any> = {};
      data.forEach((schema) => {
        supabaseProjectsData[schema.name] = {
          schema: schema.data,
          savedAt: schema.updated_at || schema.created_at,
          source: "supabase",
          id: schema.id,
        };
      });

      setSupabaseProjects(supabaseProjectsData);
      setSyncMessage(`✅ Fetched ${data.length} schema(s) from Supabase!`);
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err: any) {
      console.error("Error fetching Supabase projects:", err);
      setSyncMessage(`❌ Failed to fetch: ${err.message}`);
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setLoadingSupabaseProjects(false);
    }
  };

  const handleImportFromSupabase = (projectName: string) => {
    const project = supabaseProjects[projectName];
    if (!project || !project.schema) {
      toast.error("Invalid project data");
      return;
    }

    // Save current work before loading
    const currentBackup = { tables, relationships };
    const localProjects = JSON.parse(localStorage.getItem("visubase-projects") || "{}");
    localProjects["_autosave_backup"] = {
      schema: currentBackup,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("visubase-projects", JSON.stringify(localProjects));

    // Load the Supabase schema
    const loadedSchema = project.schema;
    localStorage.setItem("visubase-storage", JSON.stringify({
      state: {
        tables: loadedSchema.tables || [],
        relationships: loadedSchema.relationships || [],
        selected: null,
        connectMode: null,
      },
      version: 0,
    }));

    // Reload to apply changes
    window.location.reload();
  };

  const selectedTable = tables.find((t) => t.id === activeTable);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Table Editor</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {user ? `Logged in as ${getUserDisplayName()}` : "Design your database schema visually"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            {/* Logout Button */}
            {user && (
              <button
                onClick={() => {
                  toast.warning("Logout?", {
                    description: "You will need to login again.",
                    action: {
                      label: "Logout",
                      onClick: () => signOut(),
                    },
                    cancel: {
                      label: "Cancel",
                      onClick: () => {},
                    },
                  });
                }}
                className="text-xs font-medium flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <span>🚪</span> <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            {/* Project Management Dropdown */}
            <div className="relative group">
              <button
                className="text-xs font-medium flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                title="Manage projects"
              >
                <span>📁</span> <span className="hidden sm:inline">Projects</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={handleNewProject}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>🆕</span> New Project
                </button>
                <button
                  onClick={handleSaveCurrentProject}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex items-center gap-2 border-t"
                >
                  <span>💾</span> Save Project
                </button>
                <button
                  onClick={handleLoadProject}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex items-center gap-2 border-t"
                >
                  <span>📂</span> Load Project
                </button>
                <button
                  onClick={handleResetAll}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2 border-t"
                >
                  <span>🔄</span> Reset All
                </button>
              </div>
            </div>

            {/* Setup Guide Button - For new users */}
            {!supabaseUrl || !supabaseKey ? (
              <button
                onClick={() => setShowSetupGuide(true)}
                className="text-xs font-medium flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 shadow-sm transition-all"
                title="Step-by-step setup guide"
              >
                <span>🚀</span> <span className="hidden sm:inline">Easy Setup</span>
              </button>
            ) : null}

            {/* Simple Connection Form Button - For quick manual entry or updates */}
            <button
              onClick={() => setShowConnectionForm(!showConnectionForm)}
              className={`text-xs font-medium flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg transition-colors ${
                supabaseUrl && supabaseKey
                  ? "text-green-600 hover:text-green-800 border-green-300 hover:bg-green-50"
                  : "text-blue-600 hover:text-blue-800 border-blue-300 hover:bg-blue-50"
              }`}
              title={supabaseUrl && supabaseKey ? "Connected to Supabase - Click to edit" : "Quick manual connect"}
            >
              <span>{supabaseUrl && supabaseKey ? "✅" : "🔗"}</span>
              <span className="hidden sm:inline">{supabaseUrl && supabaseKey ? "Connected" : "Connect"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Selector */}
      <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 md:py-3 flex-shrink-0">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto items-center pb-1">
          {tables.map((table) => {
            const isActive = activeTable === table.id;
            const isSelectedIn3D = selected === table.id;
            return (
              <button
                key={table.id}
                onClick={() => setActiveTable(table.id)}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : isSelectedIn3D
                    ? "bg-white text-gray-700 border-2 border-gray-400"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {table.name}
                {isSelectedIn3D && activeTable !== table.id && (
                  <span className="ml-1 sm:ml-2 text-xs">👁️</span>
                )}
              </button>
            );
          })}

          {/* Add Table Button */}
          {!addingTable ? (
            <button
              onClick={() => setAddingTable(true)}
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap border-2 border-dashed border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 transition-all"
            >
              + <span className="hidden sm:inline">Add</span> Table
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTable();
                  if (e.key === "Escape") {
                    setAddingTable(false);
                    setNewTableName("");
                  }
                }}
                placeholder="Table name"
                className="px-3 py-2 text-gray-900 border-2 border-green-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
                autoFocus
              />
              <button
                onClick={handleAddTable}
                className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setAddingTable(false);
                  setNewTableName("");
                }}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
        {!activeTable ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Select a table to edit
              </h3>
              <p className="text-sm text-gray-500">
                Choose a table from the tabs above to view and edit its structure
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Table Name Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Table Name
                </label>
                <button
                  onClick={() => handleDeleteTable(activeTable)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <span>🗑️</span> Delete Table
                </button>
              </div>
              <input
                type="text"
                value={selectedTable?.name || ""}
                onChange={(e) => renameTable(activeTable, e.target.value)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="Enter table name"
              />
            </div>

            {/* Columns Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Columns
                </label>
                {!addingColumn && (
                  <button
                    onClick={() => setAddingColumn(true)}
                    className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <span className="text-lg">+</span> Add Column
                  </button>
                )}
              </div>

              {/* Column Table Header */}
              <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                <div className="bg-gray-50 border-b border-gray-200 min-w-[600px] sm:min-w-0">
                  <div className="grid grid-cols-12 gap-2 px-2 sm:px-3 py-2 text-xs font-semibold text-gray-600">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-1 text-center">PK</div>
                    <div className="col-span-2 text-center">Null</div>
                    <div className="col-span-2 text-center">Uniq</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>

                {/* Existing Columns */}
                <div className="divide-y divide-gray-200 min-w-[600px] sm:min-w-0">
                  {selectedTable?.columns && selectedTable.columns.length > 0 ? (
                    selectedTable.columns.map((col, index) => (
                      editingColumn === index ? (
                        // Edit Mode
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 px-3 py-3 bg-blue-50 border-t-2 border-blue-200"
                        >
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={editColumnData.name}
                              onChange={(e) =>
                                setEditColumnData({ ...editColumnData, name: e.target.value })
                              }
                              className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              value={editColumnData.type}
                              onChange={(e) =>
                                setEditColumnData({ ...editColumnData, type: e.target.value })
                              }
                              className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {DATA_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={editColumnData.primaryKey}
                              onChange={(e) =>
                                setEditColumnData({
                                  ...editColumnData,
                                  primaryKey: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={editColumnData.nullable}
                              onChange={(e) =>
                                setEditColumnData({
                                  ...editColumnData,
                                  nullable: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={editColumnData.unique}
                              onChange={(e) =>
                                setEditColumnData({
                                  ...editColumnData,
                                  unique: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </div>
                          <div className="col-span-1 flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEditColumn}
                              className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingColumn(null)}
                              className="text-red-500 hover:text-red-600 text-sm font-bold"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 px-3 py-3 text-sm hover:bg-gray-50 transition-colors group"
                        >
                          <div className="col-span-3 font-medium text-gray-800 flex items-center gap-2">
                            {col.name}
                            <button
                              onClick={() => handleStartEditColumn(index, col)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 text-xs transition-opacity"
                              title="Edit column"
                            >
                              ✏️
                            </button>
                          </div>
                          <div className="col-span-3 flex items-center">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                              {col.type}
                            </span>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            {col.primaryKey && (
                              <span className="text-yellow-500 text-lg">🔑</span>
                            )}
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={col.nullable}
                              readOnly
                              className="h-4 w-4 text-green-600 rounded pointer-events-none"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={col.unique}
                              readOnly
                              className="h-4 w-4 text-green-600 rounded pointer-events-none"
                            />
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              onClick={() => handleDeleteColumn(index)}
                              className="text-gray-400 hover:text-red-500 text-sm"
                              title="Delete column"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                      No columns yet. Add your first column above.
                    </div>
                  )}

                  {/* Add Column Row */}
                  {addingColumn && (
                    <div className="grid grid-cols-12 gap-2 px-3 py-3 bg-green-50 border-t-2 border-green-200">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={newColumn.name}
                          onChange={(e) =>
                            setNewColumn({ ...newColumn, name: e.target.value })
                          }
                          placeholder="column_name"
                          className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
                          autoFocus
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={newColumn.type}
                          onChange={(e) =>
                            setNewColumn({ ...newColumn, type: e.target.value })
                          }
                          className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {DATA_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newColumn.primaryKey}
                          onChange={(e) =>
                            setNewColumn({
                              ...newColumn,
                              primaryKey: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-green-600 rounded"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newColumn.nullable}
                          onChange={(e) =>
                            setNewColumn({
                              ...newColumn,
                              nullable: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-green-600 rounded"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newColumn.unique}
                          onChange={(e) =>
                            setNewColumn({
                              ...newColumn,
                              unique: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-green-600 rounded"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <button
                          onClick={handleAddColumn}
                          className="text-green-600 hover:text-green-700 text-sm font-bold"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setAddingColumn(false);
                            setNewColumn({
                              name: "",
                              type: "text",
                              nullable: true,
                              unique: false,
                              primaryKey: false,
                            });
                          }}
                          className="text-red-500 hover:text-red-600 text-sm font-bold"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Relationships Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase">
                  Relationships
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRelationshipForm(!showRelationshipForm)}
                    className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <span>📝</span> Create Custom
                  </button>
                  <button
                    onClick={() => {
                      // Start connect mode for current table
                      const setConnectMode = useSchema.getState().setConnectMode;
                      setConnectMode(activeTable);
                      setSyncMessage("🔗 Select another table to connect to...");
                      setTimeout(() => setSyncMessage(null), 3000);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>🔗</span> Click to Connect
                  </button>
                </div>
              </div>

              {/* Relationship Creation Form */}
              {showRelationshipForm && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-800 mb-3">Create Custom Relationship</h3>

                  <div className="space-y-3">
                    {/* FROM Table Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        FROM Table (source)
                      </label>
                      <select
                        value={relationshipFromTable}
                        onChange={(e) => setRelationshipFromTable(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="">-- Select source table --</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.name}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TO Table Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        TO Table (target/reference)
                      </label>
                      <select
                        value={relationshipToTable}
                        onChange={(e) => setRelationshipToTable(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="">-- Select target table --</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.name}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* FK Column Name Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Foreign Key Column Name
                      </label>
                      <input
                        type="text"
                        value={relationshipFKColumnName}
                        onChange={(e) => setRelationshipFKColumnName(e.target.value)}
                        placeholder="e.g., userId, testId, author_id"
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This column will be created in the FROM table
                      </p>
                    </div>

                    {/* FROM Column Selection (Optional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        FROM Column (Optional - which column to use as FK)
                      </label>
                      <select
                        value={relationshipFromColumn}
                        onChange={(e) => setRelationshipFromColumn(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        disabled={!relationshipFromTable}
                      >
                        <option value="">-- Create new FK column (default) --</option>
                        {relationshipFromTable && tables.find(t => t.name === relationshipFromTable)?.columns?.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Use existing column as FK, or leave empty to create new
                      </p>
                    </div>

                    {/* TO Column Selection (Optional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        TO Column (Optional - which column to reference)
                      </label>
                      <select
                        value={relationshipToColumn}
                        onChange={(e) => setRelationshipToColumn(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        disabled={!relationshipToTable}
                      >
                        <option value="">-- Use id column (default) --</option>
                        {relationshipToTable && tables.find(t => t.name === relationshipToTable)?.columns?.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Reference a specific column, or leave for default (id)
                      </p>
                    </div>

                    {/* Preview */}
                    {relationshipFromTable && relationshipToTable && relationshipFKColumnName && (
                      <div className="p-2 bg-white border border-green-300 rounded text-xs space-y-1">
                        <span className="font-semibold text-green-700">Preview:</span>
                        <div className="font-mono text-gray-700">
                          {relationshipFromTable.toLowerCase().replace(/\s+/g, "_")}.{relationshipFromColumn || relationshipFKColumnName} → {relationshipToTable.toLowerCase().replace(/\s+/g, "_")}.{relationshipToColumn || "id"}
                        </div>
                        {relationshipFromColumn && (
                          <div className="text-xs text-blue-600">
                            ℹ️ Using existing column "{relationshipFromColumn}" as FK
                          </div>
                        )}
                        {relationshipToColumn && (
                          <div className="text-xs text-purple-600">
                            ℹ️ Referencing "{relationshipToColumn}" instead of "id"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCreateRelationshipFromForm}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                      >
                        ✓ Create Relationship
                      </button>
                      <button
                        onClick={() => {
                          setShowRelationshipForm(false);
                          setRelationshipFromTable("");
                          setRelationshipToTable("");
                          setRelationshipFKColumnName("");
                          setRelationshipFromColumn("");
                          setRelationshipToColumn("");
                        }}
                        className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {relationships.filter(
                  (rel) => rel.from === activeTable || rel.to === activeTable
                ).length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {relationships
                      .map((rel, globalIndex) => ({ rel, globalIndex }))
                      .filter(({ rel }) => rel.from === activeTable || rel.to === activeTable)
                      .map(({ rel, globalIndex }) => (
                        <div
                          key={globalIndex}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🔗</span>
                            <div className="flex-1">
                              {/* Relationship Details */}
                              <div className="mb-2">
                                <div className="flex items-center gap-2 text-sm mb-1">
                                  <span className="font-semibold text-blue-700">
                                    {tables.find((t) => t.id === rel.from)?.name}
                                  </span>
                                  <span className="text-gray-400 font-bold">→</span>
                                  <span className="font-semibold text-green-700">
                                    {tables.find((t) => t.id === rel.to)?.name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 italic">
                                  Table "{tables.find((t) => t.id === rel.from)?.name}" references table "{tables.find((t) => t.id === rel.to)?.name}"
                                </div>
                              </div>

                              {editingRelationship === globalIndex ? (
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={relationshipFKName}
                                    onChange={(e) => setRelationshipFKName(e.target.value)}
                                    placeholder="e.g., user_id, andrew_id"
                                    className="flex-1 px-2 py-1 text-xs text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      updateRelationship(globalIndex, relationshipFKName);
                                      setEditingRelationship(null);
                                      setRelationshipFKName("");
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingRelationship(null);
                                      setRelationshipFKName("");
                                    }}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="text-xs">
                                    {rel.foreignKeyColumn ? (
                                      <div className="space-y-1">
                                        <div className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                          FK Column: <span className="font-bold">{rel.foreignKeyColumn}</span>
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                          Will create: {tables.find((t) => t.id === rel.from)?.name.toLowerCase().replace(/\s+/g, "_")}.{rel.foreignKeyColumn} → {tables.find((t) => t.id === rel.to)?.name.toLowerCase().replace(/\s+/g, "_")}.id
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <span className="text-gray-400 italic">No FK column set - click ✏️ to set</span>
                                        <div className="text-gray-400 text-xs">
                                          Default: {tables.find((t) => t.id === rel.to)?.name.toLowerCase().replace(/\s+/g, "_")}_id
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingRelationship(globalIndex);
                                        setRelationshipFKName(rel.foreignKeyColumn || "");
                                      }}
                                      className="text-xs text-blue-500 hover:text-blue-700"
                                      title="Edit FK column name"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => {
                                        toast.warning("Delete this relationship?", {
                                          action: {
                                            label: "Delete",
                                            onClick: () => {
                                              deleteRelationship(globalIndex);
                                              toast.success("Relationship deleted");
                                            },
                                          },
                                          cancel: {
                                            label: "Cancel",
                                            onClick: () => {},
                                          },
                                        });
                                      }}
                                      className="text-xs text-red-500 hover:text-red-700"
                                      title="Delete relationship"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No relationships for this table. Click "Add Relationship" or right-click a cuboid to create connections.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions - Sticky on mobile for better accessibility */}
      <div className="border-t border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-gray-50 flex-shrink-0 sticky bottom-0 lg:relative shadow-[0_-2px_10px_rgba(0,0,0,0.1)] lg:shadow-none">
        {/* Sync Status Message */}
        {syncMessage && (
          <div className="mb-2 sm:mb-3 p-2 bg-white rounded-lg text-xs sm:text-sm text-center border border-gray-200">
            {syncMessage}
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          {/* Sync to Supabase Button - Saves design + Creates tables */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
          >
            {syncing ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>☁️</span>
                <span className="hidden sm:inline">Sync & Create Tables</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Create Tables Only Button */}
            <button
              onClick={handleCreateTablesOnly}
              disabled={creatingTables}
              className="py-2 sm:py-2.5 px-2 sm:px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {creatingTables ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span className="hidden sm:inline">Creating...</span>
                </>
              ) : (
                <>
                  <span>🔨</span>
                  <span className="hidden sm:inline">Create Tables</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Export SQL Button */}
            <button
              onClick={handleExportSQL}
              className="py-2 sm:py-2.5 px-2 sm:px-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span>📄</span>
              <span className="hidden sm:inline">Export SQL</span>
              <span className="sm:hidden">SQL</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportJSON}
              className="py-2 sm:py-2.5 px-2 sm:px-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <span>📦</span>
              <span className="hidden sm:inline">Export JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connection Form */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              Connect to Supabase
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Enter your Supabase project credentials to sync and create tables.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://yourproject.supabase.co"
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anon/Public Key
                </label>
                <textarea
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs placeholder:text-gray-400"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  handleSaveCredentials(supabaseUrl, supabaseKey);
                  setShowConnectionForm(false);
                }}
                disabled={!supabaseUrl.trim() || !supabaseKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Close
              </button>
              <button
                onClick={() => {
                  handleClearCredentials();
                  setShowConnectionForm(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <SetupGuide
          onComplete={handleSetupComplete}
          onClose={() => setShowSetupGuide(false)}
        />
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b pb-4 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📂 Load Project</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Click on a project to load it
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleFetchSupabaseProjects}
                  disabled={loadingSupabaseProjects || !supabaseUrl || !supabaseKey}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Fetch schemas saved in Supabase"
                >
                  {loadingSupabaseProjects ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span className="hidden sm:inline">Fetching...</span>
                    </>
                  ) : (
                    <>
                      <span>☁️</span>
                      <span className="hidden sm:inline">Fetch from Supabase</span>
                      <span className="sm:hidden">Fetch</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowProjectSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Supabase Projects Section */}
            {Object.keys(supabaseProjects).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <span>☁️</span>
                  From Supabase ({Object.keys(supabaseProjects).length})
                </h3>
                <div className="space-y-2">
                  {Object.keys(supabaseProjects)
                    .sort((a, b) => {
                      const dateA = new Date(supabaseProjects[a]?.savedAt || 0).getTime();
                      const dateB = new Date(supabaseProjects[b]?.savedAt || 0).getTime();
                      return dateB - dateA;
                    })
                    .map((projectName) => {
                      const project = supabaseProjects[projectName];
                      if (!project || !project.schema) return null;

                      const tableCount = project.schema.tables?.length || 0;
                      const relationshipCount = project.schema.relationships?.length || 0;
                      const savedDate = new Date(project.savedAt);

                      return (
                        <div
                          key={`supabase-${projectName}`}
                          onClick={() => handleImportFromSupabase(projectName)}
                          className="group border-2 border-blue-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                                  {projectName}
                                </h3>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Supabase
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <span>📊</span>
                                  {tableCount} table{tableCount !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🔗</span>
                                  {relationshipCount} relationship{relationshipCount !== 1 ? 's' : ''}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500">
                                Last saved: {savedDate.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)}
                </div>
              </div>
            )}

            {/* Local Projects Section */}
            {Object.keys(savedProjects).filter(name => !name.startsWith("_")).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <span>💾</span>
                  Saved Locally ({Object.keys(savedProjects).filter(name => !name.startsWith("_")).length})
                </h3>
                <div className="space-y-2">
                  {Object.keys(savedProjects)
                .filter(name => !name.startsWith("_")) // Filter out internal projects
                .filter(name => savedProjects[name] && savedProjects[name].schema) // Ensure valid project
                .sort((a, b) => {
                  // Sort by most recent first
                  const dateA = new Date(savedProjects[a]?.savedAt || 0).getTime();
                  const dateB = new Date(savedProjects[b]?.savedAt || 0).getTime();
                  return dateB - dateA;
                })
                .map((projectName) => {
                  const project = savedProjects[projectName];
                  if (!project || !project.schema) return null;

                  const tableCount = project.schema.tables?.length || 0;
                  const relationshipCount = project.schema.relationships?.length || 0;
                  const savedDate = new Date(project.savedAt);
                  const isRecent = Date.now() - savedDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

                  return (
                    <div
                      key={projectName}
                      onClick={() => handleSelectProject(projectName)}
                      className="group border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                              {projectName}
                            </h3>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Recent
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <span>📊</span>
                              {tableCount} table{tableCount !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>🔗</span>
                              {relationshipCount} relationship{relationshipCount !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Last saved: {savedDate.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDeleteProject(projectName, e)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 px-3 py-1 text-sm transition-opacity"
                          title="Delete project"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)} {/* Remove any null entries */}
                </div>
              </div>
            )}

            {/* Empty State */}
            {Object.keys(savedProjects).filter(name => !name.startsWith("_")).length === 0 &&
             Object.keys(supabaseProjects).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-lg font-medium mb-2">No projects found</p>
                <p className="text-sm mb-4">
                  Save your current project using "💾 Save Project" or fetch schemas from Supabase
                </p>
                {supabaseUrl && supabaseKey && (
                  <button
                    onClick={handleFetchSupabaseProjects}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ☁️ Fetch from Supabase
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
              <div>
                💡 Tip: Your current work will be auto-saved before loading
              </div>
              <button
                onClick={() => setShowProjectSelector(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SchemaEditor;