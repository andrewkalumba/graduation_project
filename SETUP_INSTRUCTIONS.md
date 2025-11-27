# Visubase Setup Instructions

## Quick Setup Guide

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Wait for the project to finish setting up

### Step 2: Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (the long JWT token starting with `eyJ...`)

### Step 3: Run the Setup SQL
Before you can use Visubase to sync schemas, you need to create the `schemas` table in your Supabase database.

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
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
```

4. Click **Run** to execute the SQL

### Step 4: Connect Visubase to Your Project
1. In Visubase, click the **🔗 Connect** button in the Table Editor
2. Enter your **Supabase URL** and **Anon/Public Key**
3. Click **Save & Close**
4. The button should now show **✅ Connected**

### Step 5: Create an RPC Function (Optional - for advanced features)
Some features require the `exec_sql` RPC function. To enable it:

1. Go to **SQL Editor** in Supabase
2. Run this SQL:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
END;
$$;
```

**⚠️ Security Warning**: This function allows executing arbitrary SQL. Only use it in development or with proper access controls!

## You're All Set! 🎉

Now you can:
- Design database schemas visually in Visubase
- Click **Sync Schema** to save your design to Supabase
- Click **Create Tables** to generate actual database tables
- View and edit table data with the **📊** button

## Troubleshooting

### Error: "Could not find the table 'public.schemas'"
**Solution**: You forgot to run the setup SQL from Step 3. Go back and create the `schemas` table.

### Error: "Could not find the 'exec_sql' function"
**Solution**: This is only needed for creating tables. Run the RPC function SQL from Step 5.

### Connection doesn't work
**Solution**:
- Double-check your URL and key
- Make sure the project is fully initialized in Supabase
- Check that you copied the **anon/public** key, not the service role key

## Need Help?

Check the browser console (F12) for detailed error messages and the SQL that needs to be run.
