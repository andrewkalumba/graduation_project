import { Table, Relationship, Column } from "@/store/schemaStore";
import { supabase } from "./supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SchemaData {
  tables: Table[];
  relationships: Relationship[];
}

export const SETUP_SQL = `
-- Create schemas table to store visual schema designs
CREATE TABLE IF NOT EXISTS public.schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.schemas ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations" ON public.schemas FOR ALL USING (true);
`;

/**
 * Initialize Supabase schema storage
 * Creates the necessary tables for storing visual schemas
 */
export async function initializeSupabaseStorage(customUrl?: string, customKey?: string) {
  try {
    console.log("🔧 Initializing Supabase storage...");

    // Create custom client if credentials provided
    const client = customUrl && customKey ? createClient(customUrl, customKey) : supabase;

    // Try to create the schemas table using RPC
    const { error } = await client.rpc('exec_sql', { sql_query: SETUP_SQL });

    if (error) {
      console.error("❌ Error creating schemas table:", error);
      return {
        success: false,
        message: `Could not create schemas table automatically. Please run this SQL in your Supabase SQL Editor:\n\n${SETUP_SQL}`,
        sql: SETUP_SQL,
        error,
      };
    }

    console.log("✅ Supabase storage initialized!");
    return {
      success: true,
      message: "Schemas table created successfully",
    };
  } catch (error: any) {
    console.error("❌ Error initializing Supabase:", error);
    return {
      success: false,
      message: `Setup failed. Please run this SQL manually in your Supabase SQL Editor:\n\n${SETUP_SQL}`,
      sql: SETUP_SQL,
      error,
    };
  }
}

export async function syncSchemaToSupabase(
  schema: SchemaData,
  schemaName: string = "default",
  customUrl?: string,
  customKey?: string
) {
  try {
    console.log("🔄 Syncing schema to Supabase...");
    console.log("Tables:", schema.tables.length);
    console.log("Relationships:", schema.relationships.length);

    // Use custom credentials if provided, otherwise use environment variables
    const supabaseUrl = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Supabase Key exists:", !!supabaseKey);

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured. Please connect to Supabase or add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
    }

    // Log the URL (partially masked for security)
    if (supabaseUrl) {
      console.log("Supabase URL:", supabaseUrl.substring(0, 20) + "...");
    }

    // Create custom client if credentials provided
    const client = customUrl && customKey
      ? createClient(customUrl, customKey)
      : supabase;

    // Upsert schema to Supabase
    console.log("Attempting to upsert to 'schemas' table...");
    const { data, error } = await client
      .from("schemas")
      .upsert(
        {
          name: schemaName,
          data: {
            tables: schema.tables,
            relationships: schema.relationships,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'name', // Use 'name' column for conflict resolution
        }
      )
      .select();

    if (error) {
      console.error("❌ Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`Supabase error: ${error.message} (${error.code})`);
    }

    console.log("✅ Schema synced successfully!", data);

    return {
      success: true,
      message: "Schema synced to Supabase",
      data,
    };
  } catch (error: any) {
    console.error("❌ Error syncing schema:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return {
      success: false,
      message: error.message || "Failed to sync schema",
      error,
    };
  }
}

/**
 * Load schema from Supabase
 */
export async function loadSchemaFromSupabase(
  schemaName: string = "default"
): Promise<SchemaData | null> {
  try {
    console.log("🔄 Loading schema from Supabase...");

    const { data, error } = await supabase
      .from("schemas")
      .select("*")
      .eq("name", schemaName)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      console.log("⚠️ No schema found");
      return null;
    }

    console.log("✅ Schema loaded successfully!");
    return data.data as SchemaData;
  } catch (error: any) {
    console.error("❌ Error loading schema:", error);
    return null;
  }
}

/**
 * List all schemas from Supabase
 */
export async function listSchemasFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("schemas")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      schemas: data,
    };
  } catch (error: any) {
    console.error("❌ Error listing schemas:", error);
    return {
      success: false,
      schemas: [],
      error,
    };
  }
}

/**
 * Create actual database tables in Supabase
 * Executes SQL to create real tables from your visual schema
 */
export async function createTablesInSupabase(
  schema: SchemaData,
  customUrl?: string,
  customKey?: string
) {
  try {
    console.log("🔧 Creating actual database tables in Supabase...");

    const sql = generateSQL(schema);
    console.log("Generated SQL:", sql);

    // Create custom client if credentials provided
    const client = customUrl && customKey
      ? createClient(customUrl, customKey)
      : supabase;

    // Execute the SQL using Supabase RPC
    const { data, error } = await client.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error("❌ Error creating tables:", error);
      throw new Error(`Failed to create tables: ${error.message}`);
    }

    console.log("✅ Tables created successfully!");
    return {
      success: true,
      message: "Database tables created successfully",
      data,
    };
  } catch (error: any) {
    console.error("❌ Error creating tables:", error);
    return {
      success: false,
      message: error.message || "Failed to create database tables",
      error,
    };
  }
}

/**
 * Generate SQL from your visual schema
 * Creates CREATE TABLE statements from your schema
 */
export function generateSQL(schema: SchemaData): string {
  let sql = "-- Generated SQL Schema\n\n";

  // Generate CREATE TABLE statements
  schema.tables.forEach((table) => {
    const tableName = table.name.toLowerCase().replace(/\s+/g, "_");

    // Drop table if exists (for clean recreation)
    sql += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
    sql += `CREATE TABLE ${tableName} (\n`;

    if (table.columns && table.columns.length > 0) {
      const columnDefs = table.columns.map((col) => {
        let def = `  ${col.name} ${col.type}`;
        if (col.primaryKey) def += " PRIMARY KEY";
        if (!col.nullable) def += " NOT NULL";
        if (col.unique) def += " UNIQUE";
        if (col.foreignKey) def += ` REFERENCES ${col.foreignKey}`;
        return def;
      });
      sql += columnDefs.join(",\n");
    } else {
      sql += "  id SERIAL PRIMARY KEY,\n";
      sql += "  created_at TIMESTAMPTZ DEFAULT NOW()";
    }

    sql += "\n);\n\n";
  });

  // Generate foreign key relationships
  schema.relationships.forEach((rel, i) => {
    const fromTable = schema.tables.find((t) => t.id === rel.from);
    const toTable = schema.tables.find((t) => t.id === rel.to);

    if (fromTable && toTable) {
      const fromTableName = fromTable.name.toLowerCase().replace(/\s+/g, "_");
      const toTableName = toTable.name.toLowerCase().replace(/\s+/g, "_");

      // Determine which column to use as FK (from existing column or create new)
      const fromColumnName = rel.fromColumn || rel.foreignKeyColumn || `${toTableName}_id`;

      // Determine which column to reference (default to id)
      const toColumnName = rel.toColumn || "id";

      const constraintName = `${fromTableName}_${fromColumnName}_fkey`;

      sql += `-- Relationship: ${fromTable.name} -> ${toTable.name}\n`;
      sql += `-- Foreign Key: ${fromTableName}.${fromColumnName} -> ${toTableName}.${toColumnName}\n`;

      // Only add column if not using existing column
      if (!rel.fromColumn) {
        sql += `ALTER TABLE ${fromTableName} \n`;
        sql += `  ADD COLUMN IF NOT EXISTS ${fromColumnName} INTEGER;\n\n`;
      }

      // Add foreign key constraint with explicit name for Supabase Schema Visualizer
      sql += `ALTER TABLE ${fromTableName} \n`;
      sql += `  ADD CONSTRAINT ${constraintName} \n`;
      sql += `  FOREIGN KEY (${fromColumnName}) \n`;
      sql += `  REFERENCES ${toTableName}(${toColumnName}) \n`;
      sql += `  ON DELETE CASCADE;\n\n`;
    }
  });

  return sql;
}

/**
 * Export schema as JSON
 */
export function exportSchemaAsJSON(schema: SchemaData): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Save schema to localStorage
 */
export function saveSchemaLocally(schema: SchemaData): void {
  try {
    localStorage.setItem("visubase_schema", JSON.stringify(schema));
    console.log("✅ Schema saved to localStorage");
  } catch (error) {
    console.error("❌ Error saving to localStorage:", error);
  }
}

/**
 * Load schema from localStorage
 */
export function loadSchemaLocally(): SchemaData | null {
  try {
    const saved = localStorage.getItem("visubase_schema");
    if (saved) {
      console.log("✅ Schema loaded from localStorage");
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error("❌ Error loading from localStorage:", error);
    return null;
  }
}

/**
 * Fetch existing tables from Supabase database
 * Uses Supabase REST API to discover available tables
 */
export async function fetchTablesFromSupabase() {
  try {
    console.log("🔍 Fetching tables from Supabase...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    // Use Supabase REST API to get table information
    // The root endpoint returns OpenAPI spec with all tables
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`);
    }

    const openApiSpec = await response.json();

    // Extract table names from OpenAPI paths
    const tableNames: string[] = [];

    if (openApiSpec.paths) {
      Object.keys(openApiSpec.paths).forEach(path => {
        // Paths are in format "/{table_name}"
        const match = path.match(/^\/([^\/]+)$/);
        if (match && match[1]) {
          const tableName = match[1];
          // Filter out RPC functions (they start with "rpc/")
          if (!tableName.startsWith('rpc') && tableName !== 'schemas') {
            tableNames.push(tableName);
          }
        }
      });
    }

    console.log("✅ Tables fetched successfully!", tableNames);
    return {
      success: true,
      tables: tableNames.sort().map(name => ({ table_name: name })),
    };
  } catch (error: any) {
    console.error("❌ Error fetching tables:", error);
    return {
      success: false,
      tables: [],
      message: error.message,
      error,
    };
  }
}

/**
 * Fetch columns for a specific table
 */
async function fetchTableColumns(tableName: string): Promise<Column[]> {
  try {
    const sql = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error fetching columns for ${tableName}:`, error);
      return [];
    }

    const columns: Column[] = [];

    if (data && Array.isArray(data)) {
      data.forEach((col: any) => {
        columns.push({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          unique: false,
          primaryKey: col.column_name === 'id' || col.column_default?.includes('nextval'),
        });
      });
    }

    return columns;
  } catch (error) {
    console.error(`❌ Error fetching columns for ${tableName}:`, error);
    return [];
  }
}

/**
 * Fetch columns for a specific table with custom Supabase client
 */
async function fetchTableColumnsWithClient(
  client: SupabaseClient,
  tableName: string
): Promise<Column[]> {
  try {
    // Try to fetch a single row to get column info
    const { data, error } = await client
      .from(tableName)
      .select("*")
      .limit(1);

    if (error && !error.message.includes("0 rows")) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      return [];
    }

    // If we got data or just an empty result, extract columns
    if (data !== null) {
      if (data.length > 0) {
        const columns: Column[] = Object.keys(data[0]).map((colName) => ({
          name: colName,
          type: typeof data[0][colName] === "number" ? "integer" : "text",
          nullable: true,
          unique: false,
          primaryKey: colName === "id",
        }));
        return columns;
      }
    }

    return [];
  } catch (error) {
    console.error(`Error fetching columns for ${tableName}:`, error);
    return [];
  }
}

/**
 * Import tables from Supabase into the app
 * Converts Supabase table structure to app format
 */
export async function importTablesFromSupabase() {
  try {
    console.log("📥 Importing tables from Supabase...");

    // Get list of tables
    const tablesResult = await fetchTablesFromSupabase();

    if (!tablesResult.success || !tablesResult.tables) {
      throw new Error("Failed to fetch tables from Supabase");
    }

    const importedTables: Table[] = [];

    // For each table, get its columns
    for (let i = 0; i < tablesResult.tables.length; i++) {
      const tableRow = tablesResult.tables[i];
      const tableName = typeof tableRow === 'string' ? tableRow : tableRow.table_name;

      // Skip system tables
      if (tableName === 'schemas' || tableName.startsWith('_')) {
        continue;
      }

      // Get columns for this table using the appropriate client
      const columns = await fetchTableColumnsWithClient(supabase, tableName);

      // Calculate position in geometric pattern
      const xPos = (i % 3) * 7 - 7;
      const yPos = Math.floor(i / 3) * 7;

      importedTables.push({
        id: `imported_${tableName}_${Date.now()}_${i}`,
        name: tableName,
        color: "#10b981", // Green for imported tables
        position: [xPos, yPos, 0],
        columns,
      });
    }

    console.log(`✅ Imported ${importedTables.length} tables from Supabase`);

    return {
      success: true,
      tables: importedTables,
      message: `Successfully imported ${importedTables.length} table(s) from Supabase`,
    };
  } catch (error: any) {
    console.error("❌ Error importing tables:", error);
    return {
      success: false,
      tables: [],
      message: error.message || "Failed to import tables from Supabase",
      error,
    };
  }
}

