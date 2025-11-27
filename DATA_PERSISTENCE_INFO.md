# 📊 Data Persistence in VisuBase

## Current Behavior: No Persistence ✅

**Your data is NOT saved between page refreshes.**

When you refresh the page, everything resets to the default state:
- Tables reset to: Box 1, Box 2, Box 3
- All columns are cleared
- All relationships are removed
- Selected state is cleared

## Default State

Every page refresh starts with:
```javascript
tables: [
  { id: "cuboid1", name: "Box 1", color: "#EFF7F6", position: [-5, 0, 0] },
  { id: "cuboid2", name: "Box 2", color: "#10b981", position: [2, 0, 0] },
  { id: "cuboid3", name: "Box 3", color: "#ef4444", position: [0, 5, 0] },
]

relationships: []
columns: []
selected: null
```

## Why This Is Good for Development

✅ **Fresh Start**: Each refresh gives you a clean slate
✅ **No Bad Data**: Can't get stuck with corrupted state
✅ **Easy Testing**: Always start from known state
✅ **Fast Iterations**: Make changes, refresh, test

## To Save Your Work

If you want to keep your schema design:

### Option 1: Sync to Supabase (Recommended)
1. Design your tables and columns
2. Click **"☁️ Sync & Create Tables"**
3. Your design is saved in the `schemas` table
4. Your actual database tables are created
5. Data persists in Supabase (not in browser)

### Option 2: Export Files
1. Click **"📄 Export SQL"** → Save SQL file
2. Click **"📦 Export JSON"** → Save JSON file
3. Keep these files for your records
4. Run SQL in Supabase later if needed

### Option 3: Don't Refresh!
- Keep the browser tab open
- State remains in memory
- Only lost when tab closes or page refreshes

## localStorage Functions

We have `saveSchemaLocally()` and `loadSchemaLocally()` functions in the code, but they're **not being called**. This means:

- No automatic saving to browser storage
- No automatic loading on page load
- Data only lives in memory (Zustand store)

## How Zustand Store Works

```javascript
// In-memory storage only
export const useSchema = create<SchemaStore>((set) => ({
  tables: [...defaultTables],
  relationships: [],
  // ... actions
}));
```

- State lives in React context
- Shared across components
- Lost on page refresh
- Fast and simple

## If You Want Persistence

If you later decide you want data to persist between refreshes, you can:

### Option A: Enable localStorage
Add this to your store:
```javascript
import { persist } from 'zustand/middleware';

export const useSchema = create(
  persist<SchemaStore>(
    (set) => ({ /* store config */ }),
    { name: 'visubase-storage' }
  )
);
```

### Option B: Auto-sync to Supabase
Add auto-save on every change:
```javascript
// In your store actions:
addColumn: (tableId, column) => {
  set((state) => {
    const newState = { /* updated state */ };
    syncSchemaToSupabase(newState); // Auto-sync
    return newState;
  });
}
```

### Option C: Session Storage
Same as localStorage but cleared when browser closes:
```javascript
sessionStorage.setItem('visubase', JSON.stringify(state));
```

## Current Workflow (Best Practice)

1. **Design** → Create tables, add columns, make relationships
2. **Sync** → Click "Sync & Create Tables" when ready
3. **Test** → Refresh if needed, redesign, repeat
4. **Export** → Save SQL/JSON files for backup
5. **Deploy** → Your Supabase database has the real tables

## Trade-offs

### No Persistence (Current):
✅ Clean slate every time
✅ Can't corrupt your design
✅ Simple and fast
❌ Need to redesign after refresh
❌ Can't save work-in-progress

### With Persistence:
✅ Work saved automatically
✅ Continue where you left off
❌ Can get stuck with bad data
❌ Need to manually clear storage
❌ Slightly slower initial load

## Summary

**Current State**: ✅ No persistence - Fresh start on every refresh

**To Save Work**: Use "Sync to Supabase" or "Export SQL/JSON"

**Design Philosophy**: Treat the UI as a design tool, Supabase as the source of truth

---

**Your data is safe in Supabase when you sync!** The browser state is temporary by design.
