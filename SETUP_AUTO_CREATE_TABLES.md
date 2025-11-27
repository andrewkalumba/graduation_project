# 🔨 Auto-Create Tables Feature Setup

This guide will help you enable the auto-create tables feature in VisuBase, which allows you to create actual database tables in Supabase with one click!

## 📋 Prerequisites

- Supabase project already set up (see SUPABASE_SETUP.md)
- `.env.local` configured with your Supabase credentials
- Admin access to your Supabase project

## 🔧 Step 1: Create the SQL Execution Function

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Copy and paste this SQL:

```sql
-- Create a function to execute dynamic SQL
-- This allows VisuBase to create tables programmatically

CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION exec_sql(TEXT) IS 'Executes dynamic SQL statements for VisuBase schema creation';
```

5. Click **"Run"** or press `Ctrl + Enter`
6. You should see: **"Success. No rows returned"**

## ✅ Step 2: Test the Feature

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your app at `http://localhost:3000`

3. In the **Schema Editor** panel (right side), you'll now see two new buttons:

   - **☁️ Sync & Create Tables** - Saves schema design AND creates real tables
   - **🔨 Create Tables** - Only creates the database tables (no schema save)

4. **Add some columns** to your tables:
   - Click on a table tab (Box 1, Box 2, or Box 3)
   - Click **"+ Add Column"**
   - Enter column details (name, type, constraints)
   - Click **✓** to save

5. Click **"☁️ Sync & Create Tables"**

6. You should see the message: **"✅ Synced & Tables Created!"**

## 🎯 Step 3: Verify in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. You should now see your tables:
   - `box_1` (or whatever you named them)
   - `box_2`
   - `box_3`

4. Click on each table to see:
   - All columns you defined
   - Data types
   - Constraints (Primary Key, Unique, etc.)
   - Foreign key relationships

## 🚀 How It Works

### Button Breakdown:

1. **☁️ Sync & Create Tables** (Green Button):
   - Step 1: Saves your visual schema design to the `schemas` table
   - Step 2: Executes SQL to create actual database tables
   - Use this for a complete sync

2. **🔨 Create Tables** (Blue Button):
   - Only creates/recreates the database tables
   - Useful for testing or rebuilding tables
   - Doesn't save the schema design

3. **📄 Export SQL** (White Button):
   - Downloads the SQL file
   - You can review or manually run it
   - Good for version control

4. **📦 Export JSON** (White Button):
   - Downloads your schema as JSON
   - For backup or sharing

### What Gets Created:

For each table in your schema:
- Table name (converted to lowercase with underscores)
- All columns with their data types
- Primary keys, unique constraints, not null constraints
- Foreign key relationships (from the 3D connections)
- Default `id` and `created_at` columns (if no columns defined)

### Example:

If you have a table named "Users" with columns:
- `id` (integer, primary key)
- `email` (text, unique, not null)
- `name` (text, nullable)

The SQL generated will be:
```sql
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id integer PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text
);
```

## ⚠️ Important Notes

### Security:
- The `exec_sql` function uses `SECURITY DEFINER` - it runs with the privileges of the function creator
- Only grant this to trusted users
- For production, consider adding RLS policies

### Table Recreation:
- **Tables are dropped and recreated** each time you sync
- Any existing data in those tables will be **deleted**
- For production use, consider using migrations instead

### Naming:
- Table names are converted to lowercase
- Spaces are replaced with underscores
- Special characters are removed
- Example: "User Profiles" → "user_profiles"

## 🐛 Troubleshooting

### Error: "function exec_sql(text) does not exist"
- Run the SQL from Step 1 again
- Make sure you're in the correct Supabase project

### Error: "permission denied for function exec_sql"
- Make sure you ran the GRANT statements
- Check that your API key has the right permissions

### Error: "relation already exists"
- This shouldn't happen (we use DROP TABLE IF EXISTS)
- Try clicking "Create Tables" again
- Check Supabase logs for details

### Tables not appearing:
- Refresh the Table Editor page
- Check browser console for errors (F12)
- Verify the SQL in the console logs

### Columns not syncing:
- Make sure you added columns to the table in the Schema Editor
- Click the table tab, then "+ Add Column"
- Tables without columns get default `id` and `created_at` only

## 📚 Next Steps

- Add more columns to your tables
- Create relationships by right-clicking cuboids
- Test inserting data into your new tables
- Set up Row Level Security (RLS) policies
- Create indexes for better performance

## 🆘 Need Help?

- Check the browser console (F12) for detailed error messages
- Review the generated SQL by clicking "Export SQL"
- Check Supabase logs in the dashboard
- Ensure all environment variables are set correctly

---

**Pro Tip**: Start with simple tables and add complexity gradually. Use "Export SQL" to review what will be created before clicking "Sync & Create Tables"!
