"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Column } from "@/store/schemaStore";

interface TableData {
  tableName: string;
  columns: Column[];
  rows: any[];
}

interface DataViewerProps {
  tableName: string;
  onClose: () => void;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export const DataViewer: React.FC<DataViewerProps> = ({
  tableName,
  onClose,
  supabaseUrl,
  supabaseKey,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [editRow, setEditRow] = useState<Record<string, any>>({});

  // Create Supabase client with provided credentials
  const supabaseClient = React.useMemo(() => {
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    return createClient(supabaseUrl, supabaseKey);
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    loadTableData();
  }, [tableName, supabaseClient]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabaseClient) {
        throw new Error("Not connected to Supabase. Please connect first.");
      }

      // Fetch data from the table
      const { data: tableData, error: fetchError } = await supabaseClient
        .from(tableName)
        .select("*")
        .limit(100);

      if (fetchError) throw fetchError;

      setData(tableData || []);

      // Get column names from the first row or fetch from schema
      if (tableData && tableData.length > 0) {
        setColumns(Object.keys(tableData[0]));
      } else {
        // Fetch column info if no data
        const { data: schemaData } = await supabaseClient.rpc("exec_sql", {
          sql_query: `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = '${tableName}'
            ORDER BY ordinal_position;
          `,
        });

        if (schemaData && Array.isArray(schemaData)) {
          setColumns(schemaData.map((col: any) => col.column_name));
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error loading table data:", err);
      setError(err.message || "Failed to load table data");
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (!supabaseClient) {
        throw new Error("Not connected to Supabase");
      }

      const { error } = await supabaseClient.from(tableName).insert([newRow]);

      if (error) throw error;

      await loadTableData();
      setIsAdding(false);
      setNewRow({});
    } catch (err: any) {
      alert(`Failed to add row: ${err.message}`);
    }
  };

  const handleUpdate = async (id: any) => {
    try {
      if (!supabaseClient) {
        throw new Error("Not connected to Supabase");
      }

      const { error } = await supabaseClient
        .from(tableName)
        .update(editRow)
        .eq("id", id);

      if (error) throw error;

      await loadTableData();
      setIsEditing(null);
      setEditRow({});
    } catch (err: any) {
      alert(`Failed to update row: ${err.message}`);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this row?")) return;

    try {
      if (!supabaseClient) {
        throw new Error("Not connected to Supabase");
      }

      const { error } = await supabaseClient.from(tableName).delete().eq("id", id);

      if (error) throw error;

      await loadTableData();
    } catch (err: any) {
      alert(`Failed to delete row: ${err.message}`);
    }
  };

  const startEdit = (row: any, index: number) => {
    setIsEditing(index);
    setEditRow({ ...row });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-center">
            <span className="animate-spin text-4xl">⏳</span>
            <span className="ml-4 text-lg">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tableName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {data.length} row{data.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>+</span> Add Row
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Add Row Form */}
              {isAdding && (
                <tr className="bg-green-50">
                  {columns.map((col) => (
                    <td key={col} className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={newRow[col] || ""}
                        onChange={(e) =>
                          setNewRow({ ...newRow, [col]: e.target.value })
                        }
                        placeholder={col === "id" ? "auto" : col}
                        disabled={col === "id" || col.includes("created_at")}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={handleAdd}
                      className="text-green-600 hover:text-green-700 mr-2"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewRow({});
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={isEditing === index ? "bg-blue-50" : "hover:bg-gray-50"}
                >
                  {columns.map((col) => (
                    <td key={col} className="border border-gray-300 px-4 py-2 text-sm">
                      {isEditing === index ? (
                        <input
                          type="text"
                          value={editRow[col] || ""}
                          onChange={(e) =>
                            setEditRow({ ...editRow, [col]: e.target.value })
                          }
                          disabled={col === "id" || col.includes("created_at")}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {typeof row[col] === "object"
                            ? JSON.stringify(row[col])
                            : String(row[col] ?? "")}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {isEditing === index ? (
                      <>
                        <button
                          onClick={() => handleUpdate(row.id)}
                          className="text-blue-600 hover:text-blue-700 mr-2"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setEditRow({});
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(row, index)}
                          className="text-blue-600 hover:text-blue-700 mr-2"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {data.length === 0 && !isAdding && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                  >
                    No data in this table. Click "Add Row" to insert data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
