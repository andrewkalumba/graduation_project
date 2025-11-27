# 🔗 Relationship Management Guide

Complete guide to creating, customizing, and deleting relationships with custom foreign key names.

## ✨ New Features

### 1. **Custom Foreign Key Column Names**
Set your own FK column names like `user_id`, `andrew_id`, `author_id`, etc.

### 2. **Delete Relationships**
Remove unwanted connections with a single click

### 3. **Edit FK Names**
Update foreign key column names anytime

### 4. **Proper SQL Generation**
Foreign keys are created in Supabase with your custom names

---

## 🎯 Creating Relationships

### Method 1: Using "Add Relationship" Button

1. **Select a table** in Schema Editor (e.g., "Posts")
2. Scroll to **"Relationships"** section
3. Click **"🔗 Add Relationship"**
4. The cuboid turns **orange** in 3D scene
5. **Click another cuboid** (e.g., "Users")
6. Relationship created! Yellow line appears

### Method 2: Using Right-Click (if working)

1. **Right-click** a cuboid (e.g., "Posts")
2. Click **"🔗 Connect to..."**
3. Cuboid turns orange
4. **Click** another cuboid (e.g., "Users")
5. Relationship created!

---

## ✏️ Setting Foreign Key Column Name

After creating a relationship:

1. Go to **Schema Editor** → Select the table
2. Scroll to **"Relationships"** section
3. Find your relationship (e.g., "Posts → Users")
4. You'll see: `No FK column set` (grayed out)
5. Click the **✏️ (pencil)** icon
6. Type your FK column name: `user_id` or `andrew_id`
7. Click **✓** to save

**Result**: The FK column will show: `FK: user_id`

---

## 🗑️ Deleting Relationships

To remove a connection:

1. Find the relationship in the Relationships section
2. Click the **🗑️ (trash)** icon
3. Confirm the deletion
4. The yellow line disappears from 3D scene
5. Relationship removed!

**Warning**: This cannot be undone (unless you have it saved in Supabase)

---

## 💾 What Happens in Supabase

When you click **"☁️ Sync & Create Tables"**:

### Without Custom FK Name:
```sql
-- Default behavior
ALTER TABLE posts
  ADD COLUMN users_id INTEGER REFERENCES users(id);
```

### With Custom FK Name (`user_id`):
```sql
-- Using your custom name
ALTER TABLE posts
  ADD COLUMN user_id INTEGER REFERENCES users(id);
```

### With Custom FK Name (`andrew_id`):
```sql
-- Using your custom name
ALTER TABLE posts
  ADD COLUMN andrew_id INTEGER REFERENCES users(id);
```

---

## 🎨 Visual UI Guide

### Relationship Display:

```
┌─────────────────────────────────────┐
│ 🔗 Posts → Users                    │
│    FK: user_id          ✏️  🗑️     │
└─────────────────────────────────────┘
```

- **🔗** = Relationship icon
- **Posts → Users** = Direction (from → to)
- **FK: user_id** = Foreign key column name
- **✏️** = Edit FK name
- **🗑️** = Delete relationship

### When Editing:

```
┌─────────────────────────────────────┐
│ 🔗 Posts → Users                    │
│    [user_id___________]  ✓  ✕      │
└─────────────────────────────────────┘
```

- Input field for FK name
- **✓** = Save changes
- **✕** = Cancel editing

---

## 📋 Common Use Cases

### Example 1: Blog System

**Tables**: Posts, Users, Comments

**Relationships**:
1. Posts → Users
   - FK: `author_id`
   - Meaning: Each post has an author

2. Comments → Posts
   - FK: `post_id`
   - Meaning: Each comment belongs to a post

3. Comments → Users
   - FK: `user_id`
   - Meaning: Each comment has an author

### Example 2: E-commerce

**Tables**: Orders, Users, Products

**Relationships**:
1. Orders → Users
   - FK: `customer_id`
   - Meaning: Each order has a customer

2. Orders → Products
   - FK: `product_id`
   - Meaning: Each order has a product

### Example 3: Social Network

**Tables**: Posts, Users, Likes

**Relationships**:
1. Posts → Users
   - FK: `author_id`

2. Likes → Posts
   - FK: `post_id`

3. Likes → Users
   - FK: `user_id`

---

## 🔄 Complete Workflow

### Step-by-Step: Creating a User → Posts Relationship

1. **Create Tables**:
   - Add "Users" table with `id` column (serial, PK)
   - Add "Posts" table with `id` column (serial, PK)

2. **Create Relationship**:
   - Select "Posts" table
   - Click "Add Relationship"
   - Click "Users" cuboid
   - Yellow line appears ✓

3. **Set FK Column Name**:
   - In Relationships section, find "Posts → Users"
   - Click ✏️ icon
   - Type: `author_id`
   - Click ✓

4. **Sync to Supabase**:
   - Click "☁️ Sync & Create Tables"
   - Wait for success message

5. **Verify in Supabase**:
   - Go to Supabase → Table Editor
   - Open `posts` table
   - See new column: `author_id` (integer, FK to users.id)

---

## 💡 Best Practices

### Naming Conventions:

✅ **Good FK Names**:
- `user_id` (clear, standard)
- `author_id` (descriptive)
- `customer_id` (role-specific)
- `parent_id` (self-referencing)
- `created_by` (action-based)

❌ **Avoid**:
- `id` (confusing with primary key)
- `fk` (not descriptive)
- `relation` (too vague)
- `users` (sounds like table name)

### Relationship Direction:

- **From** → **To** means "From has a To"
- Example: Posts → Users = "Posts have Users (authors)"
- FK column goes in the "From" table

### Multiple Relationships:

You can have multiple relationships to the same table:
- Posts → Users (FK: `author_id`)
- Posts → Users (FK: `editor_id`)
- Need different FK names for each!

---

## 🐛 Troubleshooting

### FK column not appearing in Supabase:
- Make sure you set the FK column name (click ✏️)
- Click "Sync & Create Tables" to apply
- Check Supabase Table Editor for the column

### Can't delete relationship:
- Make sure you're clicking the 🗑️ icon
- Confirm the popup dialog
- Refresh if needed

### Yellow line doesn't disappear after delete:
- The 3D line should remove automatically
- Try refreshing the page
- Check that the relationship is gone in Schema Editor

### Wrong FK column name:
- Click ✏️ to edit
- Update the name
- Click ✓ to save
- Click "Sync & Create Tables" to apply to database

### Relationship shows "No FK column set":
- This is normal for new relationships
- Click ✏️ to set the FK column name
- Or leave it blank for auto-generated name (e.g., `users_id`)

---

## 🚀 Advanced Features

### Auto-generated FK Names:

If you don't set a custom FK name:
- System generates: `{to_table_name}_id`
- Example: Posts → Users becomes `users_id`
- Example: Comments → Posts becomes `posts_id`

### Viewing All Relationships:

Each table shows its relationships:
- **Outgoing**: Where this table references others
- **Incoming**: Where other tables reference this one

Currently shows both types in the list.

### Exporting Relationships:

When you export SQL or JSON:
- All relationships are included
- FK column names are preserved
- Can import/recreate anytime

---

## 📊 Database Schema Example

After creating relationships and syncing:

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

-- Posts Table with FK
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  author_id INTEGER REFERENCES users(id)  -- ← Your custom FK!
);

-- Comments Table with multiple FKs
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  text TEXT,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id)
);
```

---

## ⚠️ Important Notes

1. **Sync Required**: Changes only apply to Supabase after clicking "Sync & Create Tables"
2. **Tables Recreated**: Syncing drops and recreates tables (data loss!)
3. **FK Validation**: Supabase validates that referenced tables/columns exist
4. **Cascade Behavior**: By default, FKs use NO ACTION (can be customized in SQL)

---

**Now you have full control over relationships! 🎉**

Create connections, name them properly, and delete them when needed.
