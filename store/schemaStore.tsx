//Zustand is a state management library used to manage your app's data in React and Next. js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  primaryKey: boolean;
  foreignKey?: string;
}

export interface Table {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  columns?: Column[];
}

export interface Relationship {
  from: string; // Source table ID
  to: string; // Target table ID
  foreignKeyColumn?: string; // FK column name in source table (e.g., "user_id")
  fromColumn?: string; // Specific column in source table to use as FK
  toColumn?: string; // Specific column in target table to reference (default: "id")
}

interface Schema {
  tables: Table[];
  relationships: Relationship[];
  selected: string | null;
  setSelected: (id: string | null) => void;
  connectMode: string | null;
  setConnectMode: (id: string | null) => void;
  addRelationship: (from: string, to: string, foreignKeyColumn?: string, fromColumn?: string, toColumn?: string) => void;
  deleteRelationship: (index: number) => void;
  updateRelationship: (index: number, foreignKeyColumn: string, fromColumn?: string, toColumn?: string) => void;
  updateTablePosition: (id: string, pos: [number, number, number]) => void;
  renameTable: (id: string, newName: string) => void;
  deleteTable: (id: string) => void;
  addTable: (table: Table) => void;
  addColumn: (tableId: string, column: Column) => void;
  updateColumn: (tableId: string, columnIndex: number, column: Column) => void;
  deleteColumn: (tableId: string, columnIndex: number) => void;
}

export const useSchema = create<Schema>()(
  persist(
    (set) => ({
  tables: [
    {
      id: "cuboid1",
      name: "Box 1",
      color: "#7D70BA",
      position: [-6, 0, 0]
    },
    {
      id: "cuboid2",
      name: "Box 2",
      color: "#10b981",
      position: [6, 0, 0]
    },
    {
      id: "cuboid3",
      name: "Box 3",
      color: "#ef4444",
      position: [0, 8, 0]
    },
  ],

  relationships: [],

  selected: null,
  setSelected: (id: string | null) => set({ selected: id }),

  connectMode: null,
  setConnectMode: (id: string | null) => set({ connectMode: id }),

  addRelationship: (from: string, to: string, foreignKeyColumn?: string, fromColumn?: string, toColumn?: string) =>
    set((state) => ({
      relationships: [...state.relationships, { from, to, foreignKeyColumn, fromColumn, toColumn }],
    })),

  deleteRelationship: (index: number) =>
    set((state) => ({
      relationships: state.relationships.filter((_, i) => i !== index),
    })),

  updateRelationship: (index: number, foreignKeyColumn: string, fromColumn?: string, toColumn?: string) =>
    set((state) => ({
      relationships: state.relationships.map((rel, i) =>
        i === index ? { ...rel, foreignKeyColumn, fromColumn, toColumn } : rel
      ),
    })),

  updateTablePosition: (id: string, pos: [number, number, number]) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === id ? { ...t, position: pos } : t
      ),
    })),

  renameTable: (id: string, newName: string) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, name: newName } : t)),
    })),

  deleteTable: (id: string) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
      relationships: state.relationships.filter((r) => r.from !== id && r.to !== id),
      selected: state.selected === id ? null : state.selected,
    })),

  addTable: (table: Table) =>
    set((state) => ({
      tables: [...state.tables, table],
    })),

  addColumn: (tableId: string, column: Column) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: [...(t.columns || []), column] }
          : t
      ),
    })),

  updateColumn: (tableId: string, columnIndex: number, column: Column) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns?.map((c, i) => (i === columnIndex ? column : c)),
            }
          : t
      ),
    })),

  deleteColumn: (tableId: string, columnIndex: number) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: t.columns?.filter((_, i) => i !== columnIndex) }
          : t
      ),
    })),
    }),
    {
      name: "visubase-storage", // LocalStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
