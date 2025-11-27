# 🎯 Drag and Drop Tables Guide

Complete guide to dragging tables and managing relationships without static lines.

## ✨ What's New

### 1. **No Static Lines**
- Tables are completely independent by default
- No white lines connecting all tables
- Clean, minimal 3D view

### 2. **Drag Any Table**
- Click and drag any cuboid to move it
- Position tables exactly where you want
- Positions save automatically to localStorage

### 3. **Relationship Lines Only**
- Yellow lines appear ONLY when you create relationships
- See your actual data connections clearly
- No visual clutter

---

## 🎮 How to Drag Tables

### Dragging a Table:

1. **Hover** over any cuboid
   - Cursor changes to "grab" hand icon
   - Cuboid highlights in light blue

2. **Click and Hold** left mouse button on ONE cuboid
   - Cursor changes to "grabbing" hand icon
   - Cuboid stops rotating while dragging
   - **OrbitControls are disabled** - camera won't move
   - **Only the selected cuboid moves** - others stay in place

3. **Move Mouse** to desired position
   - Only the dragged cuboid follows your mouse in real-time
   - Can move in X and Y directions
   - Other cuboids remain stationary

4. **Release** mouse button
   - Position is saved automatically
   - Cuboid resumes rotating
   - **OrbitControls re-enabled** - camera can move again
   - New position persists in localStorage

### Important Notes:
- **One cuboid at a time**: Only the cuboid you click on will move
- **Camera locked during drag**: OrbitControls are disabled while dragging to prevent accidental camera movement
- **Other cuboids stay put**: All other tables remain in their positions
- **Right-click still works**: Opens context menu without dragging
- **Single-click still works**: Without dragging, selects the table

---

## 🔗 Creating Relationships

Relationships are now more visible without the clutter of static lines!

### Method 1: Using "Add Relationship" Button

1. Select a table in Schema Editor
2. Click **"🔗 Add Relationship"**
3. Table turns **orange** in 3D view
4. **Click** another table
5. **Yellow line** appears connecting them!

### Method 2: Using Right-Click Menu

1. **Right-click** a cuboid
2. Click **"🔗 Connect to..."**
3. Table turns **orange**
4. **Click** another table
5. **Yellow line** appears!

### Visual Result:
- **Yellow lines** show your relationships
- No white static lines to distract
- Clean view of your schema structure

---

## 📐 Geometric Positioning

New tables are positioned in expanding geometric patterns:

### Pattern:
1. **Tables 1-3**: Triangle formation
   - Left: [-6, 0, 0]
   - Right: [6, 0, 0]
   - Top: [0, 8, 0]

2. **Tables 4-6**: Square corners
   - Top-left: [-10, 8, 0]
   - Top-right: [10, 8, 0]
   - Bottom: [0, -6, 0]

3. **Tables 7-12**: Hexagon
   - 6 points around the square

4. **Tables 13+**: Expanding circles
   - 8 tables per circle
   - Radius increases automatically

### But You Can Drag Them Anywhere!
The geometric positioning is just the starting point. **Drag tables wherever you want** to create your perfect layout!

---

## 🎨 Visual Feedback

### Cursor States:
- **Default**: Normal cursor
- **Hover**: "grab" hand cursor 👆
- **Dragging**: "grabbing" hand cursor ✊

### Cuboid Colors:
- **Default**: Table's stored color
- **Hover**: Light blue (#60a5fa)
- **Selected**: White (#ffffff)
- **Connect Mode**: Orange (#ff6b00)

### Line Colors:
- **Relationship Lines**: Yellow (#fbbf24) - thick (5px)
- **No Static Lines**: None!

---

## 💡 Use Cases

### Example 1: Custom Layout for E-commerce

```
Before (auto-positioned):
Triangle: Products, Orders, Users
Square: Categories, Reviews, Cart

After (dragged to custom positions):
Products ----→ Categories (top center)
    ↓
Orders ← Users (bottom left-right)
    ↓
Reviews → Cart (middle layer)
```

You can arrange them in a flow chart style by dragging!

### Example 2: Star Schema for Analytics

```
Center: Facts table (drag to middle)
Around: Dimension tables (drag in circle around center)
Lines: All dimensions connect to center
```

Drag the fact table to the center and arrange dimension tables around it in a star pattern.

### Example 3: Hierarchical Schema

```
Top: Users (drag to top)
Middle: Posts, Comments (drag below Users)
Bottom: Likes, Tags (drag to bottom)
Lines: Show parent-child relationships
```

Arrange tables vertically to show hierarchy by dragging them into layers.

---

## 🔄 Interaction Modes

### Click (No Drag):
- **Effect**: Selects table
- **Visual**: Turns white
- **Schema Editor**: Switches to that table

### Click + Drag:
- **Effect**: Moves table
- **Visual**: Cursor changes, real-time movement
- **Result**: Position saved to store

### Right-Click:
- **Effect**: Opens context menu
- **Options**: Connect to..., Edit, Delete
- **No interference**: Works independently of drag

---

## 💾 Persistence

### What's Saved:
- ✅ Table positions
- ✅ Custom positions after dragging
- ✅ Relationships and FK names
- ✅ All columns and data types

### How It's Saved:
- **localStorage** key: `visubase-storage`
- **Auto-save** on every drag release
- **Zustand persist** middleware

### Reset:
- Click **"Reset All"** to clear all data
- Reloads with default geometric positions
- Start fresh anytime

---

## 🐛 Troubleshooting

### Table won't drag:
- Make sure you're clicking on the cuboid itself (not the label)
- Try clicking the center of the cuboid
- Check that you're using left mouse button

### All tables move when dragging one:
- **This should NOT happen anymore!** The fix ensures only one cuboid moves at a time
- If it still happens, try refreshing the page
- OrbitControls are automatically disabled during drag

### Camera moves while dragging:
- **This should NOT happen anymore!** OrbitControls are disabled during drag
- The camera should only move when you're NOT dragging a cuboid
- Release the cuboid first, then use OrbitControls to rotate the view

### Table jumps when dragging:
- This is normal for first drag after page load
- Subsequent drags should be smooth
- Position updates in real-time

### Relationship line doesn't appear:
- Make sure both tables exist
- Check that relationship was created (Schema Editor → Relationships section)
- Yellow lines only appear for user-created relationships (no static lines)

### Cursor doesn't change to "grab":
- Make sure you're hovering directly over the cuboid
- Labels don't change cursor
- Try hovering over the center of the box

### Position not saving:
- Position saves automatically on drag release
- Check localStorage in browser DevTools
- Key: `visubase-storage`

---

## ⚙️ Technical Details

### Drag Implementation:
```typescript
// On Pointer Down (left click)
- Set isDragging = true
- Save starting point
- Mark hasMoved = false

// On Pointer Move (while dragging)
- Calculate delta from start
- Update group position
- Mark hasMoved = true

// On Pointer Up (release)
- Save position to store: updateTablePosition(id, [x, y, z])
- Set isDragging = false
- Reset drag state
```

### Click vs Drag Detection:
```typescript
// If hasMoved = true → Don't trigger click
// If hasMoved = false → Trigger click (selection/relationship)
```

This prevents accidental selections when dragging!

### Position Storage:
```typescript
// Store structure
tables: [
  {
    id: "cuboid1",
    name: "Box 1",
    position: [x, y, z], // Updated on drag
    color: "#7D70BA",
    columns: []
  }
]
```

---

## 🚀 Advanced Tips

### Precision Positioning:
1. Zoom in using scroll wheel
2. Drag table to approximate position
3. Make fine adjustments with small drags
4. Use OrbitControls to view from different angles

### Creating Clean Layouts:
1. Group related tables together by dragging
2. Use vertical positioning (Y-axis) for layers
3. Spread unrelated tables apart
4. Create visual "zones" for different parts of schema

### Relationship Visualization:
1. Drag tables closer if they have relationships
2. Position them so lines are clear and not crossing
3. Use triangle/star/circle patterns for clarity
4. Distance = relationship strength (closer = stronger connection)

---

## 📊 Before vs After

### Before:
- ❌ White lines connecting all tables
- ❌ Fixed positions or grid layout
- ❌ Hard to see relationships vs structure
- ❌ Cluttered visual

### After:
- ✅ No static lines (clean view)
- ✅ Drag tables anywhere
- ✅ Yellow lines for relationships only
- ✅ Clear, minimal, focused

---

## 🎯 Summary

**Key Features:**
1. **No Static Lines**: Only relationship lines (yellow) are visible
2. **Drag & Drop**: Move any table to any position
3. **Auto-Save**: Positions persist automatically
4. **Smart Click Detection**: Drag doesn't interfere with selection/relationships

**Benefits:**
- Clean, minimal 3D view
- Full control over layout
- Clear relationship visualization
- Flexible schema design

**Workflow:**
1. Add tables → They appear in geometric pattern
2. Drag tables → Position them as you like
3. Create relationships → Yellow lines appear
4. Drag more → Adjust layout for clarity

---

**Now you have complete freedom to arrange your database schema exactly how you want it!** 🎨✨
