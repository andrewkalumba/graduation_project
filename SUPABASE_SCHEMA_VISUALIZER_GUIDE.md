# 🔗 Supabase Schema Visualizer Integration Guide

Complete guide to creating relationships in VisuBase and seeing them in Supabase's Schema Visualizer.

## ✨ Overview

When you create relationships in VisuBase and sync to Supabase, they will appear as proper foreign key connections in Supabase's Schema Visualizer with:
- Visual lines connecting tables
- Foreign key column names
- Constraint names
- Cascade delete rules

---

## 🎯 Creating Relationships in VisuBase

### Step 1: Create Tables

1. Add your tables in Schema Editor (e.g., "Users", "Posts")
2. Add columns with appropriate data types
3. Make sure each table has an `id` column (PRIMARY KEY)

Example:
```
Users table:
- id (serial, PRIMARY KEY)
- name (text)
- email (text)

Posts table:
- id (serial, PRIMARY KEY)
- title (text)
- content (text)
```

### Step 2: Create Relationship

**Method A: Using "Add Relationship" Button**

1. Select the **source table** (e.g., "Posts")
2. Click **"🔗 Add Relationship"** button
3. The cuboid turns **orange** in 3D view
4. Click the **target table** cuboid (e.g., "Users")
5. Yellow line appears connecting them

**Method B: Using Right-Click Menu**

1. Right-click source table cuboid
2. Click **"🔗 Connect to..."**
3. Table turns orange
4. Click target table cuboid

### Step 3: Set Foreign Key Column Name

After creating the relationship, you'll see it in the Relationships section:

```
🔗 Posts → Users
   No FK column set - click ✏️ to set
   Default: users_id
```

1. Click the **✏️ (pencil)** icon
2. Enter your FK column name: `user_id` or `author_id`
3. Click **✓** to save

Now it shows:
```
🔗 Posts → Users
   FK Column: user_id
   Will create: posts.user_id → users.id
```

---

## 💾 Syncing to Supabase

### Step 4: Click "Sync & Create Tables"

1. Click the **"☁️ Sync & Create Tables"** button
2. Wait for success message
3. Tables and relationships are created in Supabase

### What Gets Created in Supabase:

**Generated SQL:**
```sql
-- Create Users table
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

-- Create Posts table
DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT
);

-- Relationship: Posts -> Users
-- Foreign Key: posts.user_id -> users.id
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS user_id INTEGER;

ALTER TABLE posts
  ADD CONSTRAINT posts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;
```

**What This Creates:**
- ✅ `user_id` column in `posts` table
- ✅ Foreign key constraint named `posts_user_id_fkey`
- ✅ Reference from `posts.user_id` to `users.id`
- ✅ Cascade delete (if user deleted, their posts are deleted)

---

## 📊 Viewing in Supabase Schema Visualizer

### Step 5: Open Supabase Schema Visualizer

1. Go to **Supabase Dashboard**
2. Select your project
3. Click **"Database"** in sidebar
4. Click **"Schema Visualizer"** tab

### What You'll See:

**Visual Representation:**
```
┌─────────────┐         ┌─────────────┐
│   users     │         │   posts     │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ id (PK)     │
│ name        │         │ title       │
│ email       │         │ content     │
└─────────────┘         │ user_id (FK)│
                        └─────────────┘
```

**Connection Details:**
- **Line** connecting `posts` to `users`
- **Arrow** pointing from `posts.user_id` to `users.id`
- **Label** on the line: `posts_user_id_fkey`
- **Hover** over line to see constraint details

### Constraint Information:

When you hover over or click the relationship line:
```
Constraint: posts_user_id_fkey
Type: FOREIGN KEY
From: posts.user_id
To: users.id
On Delete: CASCADE
```

---

## 🎨 Relationship Display in VisuBase

### In Schema Editor:

```
🔗 Posts → Users
   FK Column: user_id
   Will create: posts.user_id → users.id

   [✏️ Edit]  [🗑️ Delete]
```

**Information Shown:**
- **Posts → Users**: Source table references target table
- **FK Column**: The foreign key column name
- **Will create**: Exact SQL relationship that will be created
- **Edit**: Change FK column name
- **Delete**: Remove relationship

### In 3D View:

- **Yellow line** connecting the two cuboids
- **No line** if no relationship exists
- **Multiple lines** if multiple relationships

---

## 📋 Complete Example: Blog System

### Tables to Create:

1. **Users**
   - id (serial, PRIMARY KEY)
   - username (text)
   - email (text)

2. **Posts**
   - id (serial, PRIMARY KEY)
   - title (text)
   - content (text)

3. **Comments**
   - id (serial, PRIMARY KEY)
   - text (text)

### Relationships to Create:

1. **Posts → Users**
   - FK Column: `author_id`
   - Meaning: Each post has an author

2. **Comments → Posts**
   - FK Column: `post_id`
   - Meaning: Each comment belongs to a post

3. **Comments → Users**
   - FK Column: `user_id`
   - Meaning: Each comment has an author

### In VisuBase Schema Editor:

**Posts table relationships:**
```
🔗 Posts → Users
   FK Column: author_id
   Will create: posts.author_id → users.id
```

**Comments table relationships:**
```
🔗 Comments → Posts
   FK Column: post_id
   Will create: comments.post_id → posts.id

🔗 Comments → Users
   FK Column: user_id
   Will create: comments.user_id → users.id
```

### After Syncing to Supabase:

**Schema Visualizer will show:**
```
     ┌──────────┐
     │  users   │
     ├──────────┤
     │ id (PK)  │◄─────┐
     │ username │      │
     │ email    │      │
     └──────────┘      │
            ▲          │
            │          │
            │          │
     ┌──────┴──────┐   │
     │    posts    │   │
     ├─────────────┤   │
     │ id (PK)     │   │
     │ title       │   │
     │ content     │   │
     │ author_id(FK)   │
     └─────────────┘   │
            ▲          │
            │          │
     ┌──────┴──────┐   │
     │  comments   │   │
     ├─────────────┤   │
     │ id (PK)     │   │
     │ text        │   │
     │ post_id (FK)│   │
     │ user_id (FK)├───┘
     └─────────────┘
```

**3 visible connections:**
1. posts.author_id → users.id
2. comments.post_id → posts.id
3. comments.user_id → users.id

---

## 🔍 Verifying Relationships in Supabase

### Method 1: Schema Visualizer
- Visual lines between tables
- Hover to see constraint details
- Click to highlight related tables

### Method 2: Table Editor
1. Go to **Table Editor**
2. Select a table (e.g., "posts")
3. See the FK columns with 🔗 icon
4. Click FK column to see reference details

### Method 3: SQL Editor
Run this query to see all foreign keys:
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Expected Output:**
```
table_name | column_name | foreign_table | foreign_column | constraint_name
-----------+-------------+---------------+----------------+---------------------
posts      | author_id   | users         | id             | posts_author_id_fkey
comments   | post_id     | posts         | id             | comments_post_id_fkey
comments   | user_id     | users         | id             | comments_user_id_fkey
```

---

## ⚙️ FK Constraint Details

### Naming Convention:
```
{from_table}_{fk_column}_fkey
```

Examples:
- `posts_author_id_fkey` - Posts table, author_id column
- `comments_post_id_fkey` - Comments table, post_id column
- `comments_user_id_fkey` - Comments table, user_id column

### Cascade Behavior:

**ON DELETE CASCADE** means:
- If you delete a user, all their posts are automatically deleted
- If you delete a post, all its comments are automatically deleted

Example:
```sql
DELETE FROM users WHERE id = 1;
-- This will also delete:
-- - All posts where author_id = 1
-- - All comments where user_id = 1
```

---

## 💡 Best Practices

### 1. Always Set FK Column Names
```
✅ Good: user_id, author_id, post_id
❌ Avoid: Using default names like users_id
```

### 2. Use Descriptive Names
```
✅ Good:
- Posts → Users: author_id (describes the relationship role)
- Comments → Users: user_id (generic user reference)

❌ Confusing:
- Posts → Users: user_id (what kind of user? author? editor?)
```

### 3. Name Consistency
```
✅ Consistent:
- posts.author_id → users.id
- comments.user_id → users.id

❌ Inconsistent:
- posts.userId → users.id
- comments.user_id → users.id
```

### 4. Check Supabase After Sync
Always verify in Schema Visualizer that:
- ✅ Tables appear
- ✅ Columns are correct
- ✅ Foreign key lines are visible
- ✅ Constraint names are correct

---

## 🐛 Troubleshooting

### Relationships don't appear in Schema Visualizer:

**Check 1: FK Column Set?**
- In VisuBase, check if FK column name is set
- Should show "FK Column: xxx" not "No FK column set"

**Check 2: Tables Synced?**
- Click "Sync & Create Tables" in VisuBase
- Wait for success message
- Refresh Supabase Schema Visualizer

**Check 3: Constraints Created?**
- Run the SQL query above to check foreign keys
- Should see your constraint names

**Check 4: Referenced Table Exists?**
- Make sure the target table was created first
- Both tables must exist before FK can be created

### Yellow line shows in VisuBase but not in Supabase:

This means the relationship is saved locally but not synced:
1. Click "Sync & Create Tables"
2. Check for error messages
3. Verify Supabase credentials in .env.local

### Constraint names different than expected:

- VisuBase uses format: `{table}_{column}_fkey`
- If different, constraint was created manually
- Delete and recreate using VisuBase sync

---

## 🚀 Advanced: Multiple FKs to Same Table

### Example: Posts with Author and Editor

**Setup:**
1. Posts → Users (FK: author_id)
2. Posts → Users (FK: editor_id)

**In VisuBase:**
```
🔗 Posts → Users
   FK Column: author_id
   Will create: posts.author_id → users.id

🔗 Posts → Users
   FK Column: editor_id
   Will create: posts.editor_id → users.id
```

**In Supabase Schema Visualizer:**
- Two lines from posts to users
- One labeled `posts_author_id_fkey`
- One labeled `posts_editor_id_fkey`

---

## 📊 Summary

**Workflow:**
1. Create tables in VisuBase
2. Create relationships (3D view or editor)
3. Set FK column names
4. Click "Sync & Create Tables"
5. View in Supabase Schema Visualizer

**What Gets Created:**
- FK columns in source tables
- Foreign key constraints with proper names
- CASCADE delete rules
- Visual connections in Schema Visualizer

**Benefits:**
- ✅ Visual database design
- ✅ Automatic SQL generation
- ✅ Proper constraint names
- ✅ Schema Visualizer integration
- ✅ Data integrity enforcement

---

**Now you can design your database visually in VisuBase and see the exact relationships in Supabase's Schema Visualizer!** 🎉
