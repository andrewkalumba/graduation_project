# 🚀 Supabase Setup Guide for VisuBase

This guide will help you connect your VisuBase application to Supabase in just a few minutes!

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your VisuBase project running locally

## 🔧 Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `visubase` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes for setup

## 🗄️ Step 2: Create the Database Table

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create schemas table to store your visual database schemas
CREATE TABLE schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schemas ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on schemas"
  ON schemas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_schemas_name ON schemas(name);
CREATE INDEX idx_schemas_updated_at ON schemas(updated_at DESC);
```

4. Click "Run" or press `Ctrl + Enter`
5. You should see "Success. No rows returned"

## 🔑 Step 3: Get Your API Keys

1. In your Supabase project, go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## 🔐 Step 4: Configure Environment Variables

1. In your VisuBase project root, create a file named `.env.local`:

```bash
touch .env.local
```

2. Open `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**:
- Replace `your-project-id` with your actual project URL
- Replace `your-anon-key-here` with your actual anon key
- Never commit `.env.local` to git (it's already in `.gitignore`)

## ✅ Step 5: Test the Connection

1. Restart your development server:
```bash
npm run dev
```

2. Open your app at `http://localhost:3000`

3. In the **Schema Editor** panel (right side), click the **"Sync to Supabase"** button

4. You should see: **"✅ Synced to Supabase!"**

5. Verify in Supabase:
   - Go to **Table Editor** in Supabase
   - Click on the `schemas` table
   - You should see a new row with your schema data!

## 🎉 You're Done!

Your VisuBase is now connected to Supabase!

## 🚀 Available Features

### In Schema Editor Panel:

1. **☁️ Sync to Supabase** - Saves your visual schema to Supabase database
2. **📄 Export SQL** - Downloads CREATE TABLE statements as `.sql` file
3. **📦 Export JSON** - Downloads your schema as `.json` file

### Programmatic Usage:

```typescript
import { syncSchemaToSupabase, loadSchemaFromSupabase, generateSQL } from "@/lib/supabaseSync";

// Sync to Supabase
const result = await syncSchemaToSupabase(schema);

// Load from Supabase
const loadedSchema = await loadSchemaFromSupabase("default");

// Generate SQL
const sql = generateSQL(schema);
console.log(sql);
```

## 🔒 Security Best Practices

1. **Never expose your service_role key** in client-side code
2. Configure **Row Level Security (RLS)** policies based on your auth needs
3. For production, add authentication to restrict who can modify schemas
4. Consider using **Supabase Auth** for user management

## 🐛 Troubleshooting

### Error: "Supabase credentials not configured"
- Make sure `.env.local` exists and has the correct keys
- Restart your dev server after creating `.env.local`

### Error: "relation 'schemas' does not exist"
- Run the SQL from Step 2 in Supabase SQL Editor
- Make sure you're in the correct project

### Sync button shows error
- Check browser console for detailed error message
- Verify your API keys are correct
- Check Supabase project status

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

- Check the [Supabase Discord](https://discord.supabase.com)
- Review [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
