# 🎯 Cuboid-to-Editor Sync Feature

## Overview

When you click on a cuboid in the 3D scene, the Schema Editor automatically switches to show that table's details!

## 🎨 How It Works

### Visual Feedback:

1. **Click a cuboid** in the 3D scene (left side)
   - The cuboid turns **indigo** (selected state)

2. **Schema Editor responds** (right side)
   - The corresponding table tab **automatically switches**
   - Table tab shows with **green background** (active/editing)
   - You can immediately see and edit that table's columns

### Color Coding:

- **Green tab** = Currently active in editor (editing mode)
- **Indigo tab + 👁️ icon** = Selected in 3D but not active in editor
- **Gray tab** = Not selected or active

## 🚀 Workflows

### Quick Edit Workflow:
1. **Click** a cuboid in 3D → Box 1
2. Editor **automatically switches** to Box 1
3. **Edit** columns, name, or properties
4. **Click** another cuboid → Box 2
5. Editor **switches** to Box 2
6. Repeat!

### Relationship Creation Workflow:
1. **Click** Box 1 cuboid (turns indigo)
2. Editor shows Box 1 details
3. Click **"🔗 Add Relationship"**
4. Cuboid turns **orange** (connect mode)
5. **Click** Box 2 cuboid
6. **Yellow line** appears
7. Editor shows the new relationship

### Multi-Table Review:
1. **Click** Box 1 → Review columns
2. **Click** Box 2 → Review columns
3. **Click** Box 3 → Review columns
4. Fast navigation between tables!

## 🎭 State Indicators

### Cuboid Colors (3D Scene):
- **Default color** (white/green/red) = Normal state
- **Light blue** = Hovered (mouse over)
- **Indigo** (#4f46e5) = Selected/clicked
- **Orange** (#ff6b00) = Connect mode (creating relationship)

### Tab Colors (Schema Editor):
- **Green** = Active for editing
- **Indigo** = Selected in 3D but not editing
- **Gray** = Inactive

## 💡 Pro Tips

1. **Fast Navigation**:
   - Click cuboids rapidly to switch between tables
   - Much faster than clicking tabs!

2. **Visual Context**:
   - See the 3D position while editing
   - Understand table relationships spatially

3. **Combined Editing**:
   - Click cuboid → Edit in Schema Editor
   - Rotate 3D view → See relationships
   - Click another → Continue editing

4. **Relationship Preview**:
   - Click a cuboid
   - Scroll to Relationships section
   - See all connections for that table
   - Click connected cuboid to edit it

## 🔄 Synchronization Flow

```
3D Scene (Left)          Schema Editor (Right)
─────────────────        ──────────────────────

[Click Box 1]     ───>   Box 1 tab activates ✓
Turns Indigo             Shows columns

[Click Box 2]     ───>   Box 2 tab activates ✓
Turns Indigo             Shows columns
Box 1 normal

[Edit in Editor]  <───   Changes save
Updates instantly        Types/edits columns

[Sync & Create]   <──>   Database updated
Both stay synced         Tables created
```

## ⚙️ Technical Details

- Uses **Zustand** global state management
- `selected` state tracks clicked cuboid
- `useEffect` in Schema Editor watches for changes
- Automatic tab switching on cuboid click
- Bidirectional sync between 3D and UI

## 🐛 Troubleshooting

### Editor doesn't switch when clicking cuboid:
- Make sure you're **left-clicking** (not right-clicking)
- Check console for errors (F12)
- Try clicking the cuboid center (not edges)

### Tab shows wrong table:
- Refresh the page
- Check that table IDs match (cuboid1, cuboid2, cuboid3)

### Selection gets stuck:
- Click empty space in 3D scene to deselect
- Click directly on a different cuboid
- Refresh if needed

## 🎯 Use Cases

1. **Rapid Table Editing**:
   - Click → Edit → Click → Edit
   - No manual tab switching needed

2. **Visual Database Design**:
   - See tables spatially in 3D
   - Click to edit details
   - Maintain spatial context

3. **Teaching/Presenting**:
   - Point to cuboid in 3D
   - Details appear automatically
   - Great for demonstrations

4. **Large Schemas**:
   - Navigate visually instead of scrolling
   - Find tables by position
   - Quick context switching

## 🔮 Future Enhancements

Possible improvements:
- Double-click to edit table name
- Drag cuboids to reorder tabs
- Multi-select for bulk operations
- Minimap showing selected table
- Breadcrumb navigation

---

**Enjoy the seamless sync between 3D and Editor!** 🎉
