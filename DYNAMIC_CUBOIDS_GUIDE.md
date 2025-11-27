# 🎲 Dynamic Cuboids Guide

Now when you add a table in the Schema Editor, a 3D cuboid is automatically created!

## ✨ How It Works

### Before:
- Only 3 fixed cuboids (Box 1, Box 2, Box 3)
- Adding tables didn't create cuboids

### Now:
- **Unlimited cuboids!** 🚀
- Add a table → Cuboid appears automatically
- Delete a table → Cuboid disappears
- Rename a table → Cuboid label updates

---

## 🎯 Adding New Tables/Cuboids

### Step 1: Click "Add Table"
1. In Schema Editor, look for the table tabs
2. Click **"+ Add Table"** (dashed border button)
3. Type table name (e.g., "Products")
4. Press Enter or click ✓

### Step 2: Cuboid Appears!
- A new **blue cuboid** appears in the 3D scene
- Positioned automatically in a grid layout
- Size: 3×3×3 (default for new tables)
- Already rotating and interactive!

### Step 3: Customize
- Click the cuboid to select it
- Edit columns in Schema Editor
- Create relationships
- Rename the table

---

## 📐 Positioning System

New tables are positioned in a grid:

```
Table 1: [-7,  0, 0]   Table 2: [ 0,  0, 0]   Table 3: [ 7,  0, 0]
Table 4: [-7,  7, 0]   Table 5: [ 0,  7, 0]   Table 6: [ 7,  7, 0]
Table 7: [-7, 14, 0]   Table 8: [ 0, 14, 0]   Table 9: [ 7, 14, 0]
```

- **3 tables per row**
- **7 units spacing** between tables
- **Grid expands** upward as you add more

---

## 🎨 Cuboid Properties

### First 3 Tables (Original):
- **Box 1**: 4×2×2, Purple (#7D70BA)
- **Box 2**: 2×4×2, Green (#10b981)
- **Box 3**: 2×2×4, Red (#ef4444)

### New Tables (4+):
- **Size**: 3×3×3 (default cube)
- **Color**: Blue (#3b82f6)
- **Position**: Auto-calculated grid
- **All features**: Rotation, selection, connections

---

## 🔗 Features Available

All cuboids have these features:

### ✅ Interactive:
- Click to select (turns white)
- Hover to highlight (light blue)
- Right-click for context menu

### ✅ Connections:
- Create relationships
- Yellow lines appear
- Custom FK names

### ✅ Live Updates:
- Rename in editor → Label updates
- Delete table → Cuboid disappears
- Add columns → Syncs to Supabase

---

## 💡 Use Cases

### Example: Building an E-commerce System

1. **Create Tables**:
   - Add "Products" → Blue cuboid appears
   - Add "Orders" → Another blue cuboid
   - Add "Customers" → Third blue cuboid
   - Add "Reviews" → Fourth blue cuboid

2. **Create Relationships**:
   - Orders → Customers (FK: `customer_id`)
   - Orders → Products (FK: `product_id`)
   - Reviews → Products (FK: `product_id`)
   - Reviews → Customers (FK: `user_id`)

3. **Result**: 7 cuboids total with yellow connection lines!

---

## 📊 Static vs Dynamic Lines

### Static White Lines:
- Connect first 3 cuboids only
- Always visible (original design)
- Triangle formation

### Dynamic Yellow Lines:
- Show your relationships
- Any table to any table
- Created by you

---

## 🎮 Interactive Demo

### Try This:

1. **Add a table**:
   ```
   Click "+ Add Table"
   Type: "Products"
   Press Enter
   ```
   **Result**: 4th cuboid appears at position [0, 7, 0]

2. **Create relationship**:
   ```
   Select "Products"
   Click "Add Relationship"
   Click "Box 1" cuboid
   ```
   **Result**: Yellow line connects them

3. **Add more tables**:
   ```
   Add "Orders"
   Add "Customers"
   Add "Reviews"
   ```
   **Result**: 7 cuboids in a grid!

---

## 🔄 Synchronization

Everything stays in sync:

### Table Name Changes:
```
Schema Editor: Rename "Products" → "Items"
3D Scene: Label updates to "Items" instantly
```

### Table Deletion:
```
Schema Editor: Delete "Orders"
3D Scene: Orange cuboid disappears
Relationships: Lines connected to it removed
```

### Table Addition:
```
Schema Editor: Add "Categories"
3D Scene: New blue cuboid appears
Position: Auto-calculated in grid
```

---

## ⚙️ Technical Details

### How Cuboids are Rendered:

```javascript
// Dynamically map all tables
{tables.map((table, index) => (
  <RotatingCuboid
    key={table.id}
    id={table.id}
    position={table.position}
    dimensions={getDimensions(index)}
    color={table.color}
    label={table.name}
  />
))}
```

### Position Calculation:

```javascript
const tableCount = tables.length;
const xPos = (tableCount % 3) * 7 - 7;  // -7, 0, or 7
const yPos = Math.floor(tableCount / 3) * 7;  // Row number * 7
```

### Dimensions Map:

```javascript
const dimensionsMap = {
  0: [4, 2, 2],  // Box 1 - Wide
  1: [2, 4, 2],  // Box 2 - Tall
  2: [2, 2, 4],  // Box 3 - Deep
  // 3+: [3, 3, 3]  // New tables - Cube
};
```

---

## 🎯 Limitations & Future Ideas

### Current Limitations:
- New tables have fixed 3×3×3 size
- Grid positioning (can't drag to reposition)
- Blue color only for new tables

### Possible Enhancements:
- Drag cuboids to custom positions
- Choose custom colors for new tables
- Adjust cuboid size/dimensions
- Different shapes (spheres, cylinders)
- Camera focus on selected cuboid

---

## 🐛 Troubleshooting

### New cuboid doesn't appear:
- Check if table was created (check tabs)
- Try rotating the 3D camera view
- New cuboids may be positioned higher (Y axis)
- Use scroll/zoom to find them

### Cuboid appears but no label:
- Make sure table has a name
- Check that table.name is not empty
- Refresh if needed

### Can't interact with new cuboid:
- All cuboids have same features
- Try clicking directly on the center
- Right-click should work the same

### Grid positions overlap:
- This shouldn't happen with auto-positioning
- If it does, manually update table.position in store
- Or delete and recreate the table

---

## 📚 Summary

**Before**: Fixed 3 cuboids

**Now**: Unlimited dynamic cuboids!

**Features**:
- ✅ Auto-created when adding tables
- ✅ Auto-positioned in grid
- ✅ Auto-removed when deleting tables
- ✅ Live label updates
- ✅ Full interactivity
- ✅ Relationship support

---

**Create as many tables as you need! Each gets its own 3D cuboid.** 🎲✨
