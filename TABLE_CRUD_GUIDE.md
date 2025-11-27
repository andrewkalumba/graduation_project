# 📝 Table & Column Management Guide

Complete guide to creating, updating, and managing tables in VisuBase.

## 🎯 Table Operations

### ➕ Create a New Table

1. In the **Schema Editor** panel (right side), look for the table tabs at the top
2. Click **"+ Add Table"** button (dashed border)
3. Type the table name in the input field
4. Press **Enter** or click **✓** to create
5. Press **Escape** or click **✕** to cancel

**Result**:
- New table is created and automatically selected
- You'll see an empty column list
- The table appears in the tab bar

### ✏️ Update/Rename a Table

1. Click on a table tab to select it
2. In the **Table Name** section, the input field shows the current name
3. Type the new name directly in the field
4. Changes are saved automatically as you type

**Result**:
- Table name updates in real-time
- The 3D cuboid label updates automatically
- Tab name updates

### 🗑️ Delete a Table

1. Click on the table tab you want to delete
2. Click the **"🗑️ Delete Table"** button (top right of table name section)
3. Confirm the deletion in the popup dialog

**Warning**: This will:
- Remove the table permanently
- Delete all columns in that table
- Remove all relationships involving this table
- Cannot be undone!

## 📊 Column Operations

### ➕ Add a New Column

1. Select a table by clicking its tab
2. Click **"+ Add Column"** button (top right of columns section)
3. A green row appears at the bottom of the column list
4. Fill in the column details:
   - **Name**: Column name (e.g., "email", "user_id")
   - **Type**: Select from dropdown (text, integer, uuid, etc.)
   - **PK**: Check if this is a Primary Key
   - **Nullable**: Check if NULL values are allowed
   - **Unique**: Check if values must be unique
5. Click **✓** to save or **✕** to cancel

**Available Data Types**:
- text, varchar
- integer, bigint, serial, bigserial
- boolean
- timestamp, timestamptz, date, time
- uuid
- json, jsonb
- decimal, real, double precision
- bytea

### ✏️ Update/Edit a Column

1. Hover over any column row
2. A small **✏️** icon appears next to the column name
3. Click the **✏️** icon
4. The row turns blue and all fields become editable
5. Modify any field:
   - Change column name
   - Change data type
   - Toggle Primary Key
   - Toggle Nullable
   - Toggle Unique
6. Click **✓** to save changes or **✕** to cancel

**Result**:
- Column is updated immediately
- Changes sync to Supabase when you click "Sync & Create Tables"

### 🗑️ Delete a Column

1. Find the column you want to delete
2. Click the **✕** button on the right side of the column row
3. Column is deleted immediately (no confirmation)

**Warning**:
- Deletion is immediate
- When you sync, the column will be removed from the database table
- Any data in that column will be lost

## 🔄 Syncing Changes to Supabase

After making any changes (adding/updating/deleting tables or columns), you need to sync:

### Option 1: Full Sync (Recommended)
Click **"☁️ Sync & Create Tables"** (green button)
- Saves your schema design to Supabase
- Creates/recreates all tables in your database
- Updates all column definitions
- Sets up relationships

### Option 2: Create Tables Only
Click **"🔨 Create Tables"** (blue button)
- Only creates the database tables
- Doesn't save the schema design
- Useful for testing

## 💡 Best Practices

### Naming Conventions:
- Use lowercase for column names
- Use underscores instead of spaces (e.g., "user_id" not "User ID")
- Be consistent with naming patterns
- Table names will be converted automatically (e.g., "User Accounts" → "user_accounts")

### Primary Keys:
- Every table should have at least one Primary Key
- Common pattern: `id` column with type `serial` or `uuid`
- Only one column should be marked as Primary Key (for now)

### Foreign Keys:
- Use relationships by right-clicking cuboids in the 3D view
- The system will automatically add foreign key columns when syncing

### Data Types:
- **text**: For strings of any length
- **varchar**: For strings with max length
- **integer**: For whole numbers (-2B to +2B)
- **bigint**: For very large numbers
- **serial**: Auto-incrementing integer (good for IDs)
- **uuid**: Universally unique identifier (also good for IDs)
- **timestamp**: Date and time
- **boolean**: true/false values
- **json/jsonb**: JSON data (jsonb is faster for queries)

## 🎨 Visual Feedback

### Colors:
- **Green highlight**: Adding a new column
- **Blue highlight**: Editing an existing column
- **Green border**: Selected table tab
- **Red button**: Destructive actions (delete)
- **Hover effect**: Gray background on column rows

### Icons:
- **🔑**: Primary Key indicator
- **✏️**: Edit button (appears on hover)
- **✓**: Save/Confirm action
- **✕**: Cancel/Delete action
- **+**: Add new item
- **🗑️**: Delete table

## 🔍 Common Workflows

### Creating a Users Table:

1. Click **"+ Add Table"**
2. Name it "Users", press Enter
3. Click **"+ Add Column"**:
   - Name: `id`, Type: `serial`, Check **PK**
4. Add more columns:
   - `email` → `text`, Check **Unique**, Uncheck **Nullable**
   - `name` → `text`, Check **Nullable**
   - `created_at` → `timestamptz`, Check **Nullable**
5. Click **"☁️ Sync & Create Tables"**
6. Check Supabase → Table Editor → See `users` table!

### Updating an Existing Table:

1. Select the table tab
2. Hover over a column and click **✏️**
3. Change the data type or constraints
4. Click **✓** to save
5. Click **"☁️ Sync & Create Tables"** to apply changes

### Deleting Unused Columns:

1. Select the table
2. Find the column you don't need
3. Click the **✕** button
4. The column disappears immediately
5. Click **"☁️ Sync & Create Tables"** to update the database

## ⚠️ Important Notes

### Data Loss Warning:
- When you click "Sync & Create Tables", tables are **dropped and recreated**
- **All existing data will be deleted**
- For production databases, use migrations instead
- Always backup your data before syncing

### Sync Behavior:
- Tables in Supabase are replaced completely
- Old columns not in your schema will be deleted
- New columns will be added
- This is a "destructive sync" - good for development, not production

### Schema vs Tables:
- **Schema Design** (saved in `schemas` table): Your visual design
- **Actual Tables**: The real database tables with data
- These are separate - sync to keep them in sync

## 🆘 Troubleshooting

### Column won't save:
- Make sure you entered a column name
- Column name can't be empty
- Click ✓ to confirm

### Table name won't update:
- Check that you're typing in the input field
- Changes save automatically - no button needed
- Make sure you're on the correct table tab

### Delete isn't working:
- For tables: Make sure you confirmed the dialog
- For columns: The ✕ button deletes immediately
- Refresh the page if buttons aren't responding

### Changes not appearing in Supabase:
- You must click "Sync & Create Tables" to push changes
- Check browser console for errors
- Verify you ran the `exec_sql` function setup
- Check your .env.local credentials

---

**Pro Tip**: Use "Export SQL" to review what will be created before clicking "Sync & Create Tables"!
