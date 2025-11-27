# 📝 Custom Relationship Form Guide

Complete guide to creating relationships using the form-based method by typing table names and FK column names.

## ✨ Two Ways to Create Relationships

### Method 1: Click to Connect (Original)
- Click "🔗 Click to Connect" button
- Cuboid turns orange
- Click another cuboid
- Set FK name afterwards

### Method 2: Create Custom (NEW!)
- Click "📝 Create Custom" button
- Fill out form with table names and FK column
- Creates relationship instantly with all details

---

## 🎯 Using the Custom Relationship Form

### Step 1: Open the Form

1. Go to **Schema Editor**
2. Scroll to **"Relationships"** section
3. Click **"📝 Create Custom"** button

The form appears with a green background:
```
Create Custom Relationship
┌─────────────────────────────────┐
│ FROM Table (source)             │
│ [Dropdown menu]                 │
├─────────────────────────────────┤
│ TO Table (target/reference)     │
│ [Dropdown menu]                 │
├─────────────────────────────────┤
│ Foreign Key Column Name         │
│ [Text input]                    │
└─────────────────────────────────┘
```

### Step 2: Select FROM Table

1. Click the **"FROM Table (source)"** dropdown
2. Select the table that will contain the FK column

Example: Select **"Posts"**

This is the table where the foreign key column will be created.

### Step 3: Select TO Table

1. Click the **"TO Table (target/reference)"** dropdown
2. Select the table that will be referenced

Example: Select **"Users"**

This is the table being referenced (usually has the primary key).

### Step 4: Enter FK Column Name

1. Click in the **"Foreign Key Column Name"** field
2. Type your custom FK column name

Examples:
- `userId` (camelCase)
- `testId` (your example)
- `author_id` (snake_case)
- `customer_id`
- `post_id`

### Step 5: Review Preview

As you type, a preview appears:
```
Preview:
posts.userId → users.id
```

This shows exactly what will be created in the database!

### Step 6: Create Relationship

Click **"✓ Create Relationship"** button

**Success message appears:**
```
✅ Relationship created: Posts → Users (FK: userId)
```

**Yellow line appears** in 3D view connecting the cuboids!

---

## 📋 Complete Example

### Scenario: Connect Posts to Users

**Goal**: Create a relationship where Posts reference Users through a `userId` column.

**Steps:**

1. **Click** "📝 Create Custom"

2. **FROM Table**: Select **"Posts"**
   - This is the table that will get the FK column

3. **TO Table**: Select **"Users"**
   - This is the table being referenced

4. **FK Column Name**: Type **"userId"**
   - This is the column name you want

5. **Preview** shows:
   ```
   posts.userId → users.id
   ```

6. **Click** "✓ Create Relationship"

7. **Result**:
   - Yellow line connects Posts → Users in 3D view
   - Relationship appears in list:
     ```
     🔗 Posts → Users
        Table "Posts" references table "Users"
        FK Column: userId
        Will create: posts.userId → users.id
     ```

---

## 🎨 Form Features

### 1. **Dropdowns for Table Selection**
- Shows all your tables
- Easy to select without clicking cuboids
- Clear labels: "FROM Table (source)" and "TO Table (target/reference)"

### 2. **Text Input for FK Column**
- Type any name you want
- Examples shown: `userId`, `testId`, `author_id`
- Flexible naming (camelCase, snake_case, etc.)

### 3. **Live Preview**
Shows the exact SQL relationship:
```
posts.userId → users.id
```

Automatically converts table names to lowercase with underscores for SQL.

### 4. **Validation**
Checks before creating:
- ✅ FROM table selected
- ✅ TO table selected
- ✅ FK column name entered

Error messages if something is missing:
```
❌ Please select both FROM and TO tables
❌ Please enter a foreign key column name
```

### 5. **Success Confirmation**
```
✅ Relationship created: Posts → Users (FK: userId)
```

### 6. **Easy Cancel**
Click **"✕ Cancel"** to close the form without creating anything.

---

## 💡 Use Cases

### Example 1: Blog System

**Create 3 relationships:**

**Relationship 1: Posts → Users**
- FROM: Posts
- TO: Users
- FK: `authorId`
- Preview: `posts.authorId → users.id`

**Relationship 2: Comments → Posts**
- FROM: Comments
- TO: Posts
- FK: `postId`
- Preview: `comments.postId → posts.id`

**Relationship 3: Comments → Users**
- FROM: Comments
- TO: Users
- FK: `userId`
- Preview: `comments.userId → users.id`

### Example 2: E-commerce

**Relationship 1: Orders → Users**
- FROM: Orders
- TO: Users
- FK: `customerId`
- Preview: `orders.customerId → users.id`

**Relationship 2: Orders → Products**
- FROM: Orders
- TO: Products
- FK: `productId`
- Preview: `orders.productId → products.id`

### Example 3: Your Custom Names

**Relationship: TestTable → AnotherTable**
- FROM: TestTable
- TO: AnotherTable
- FK: `testId` (your example!)
- Preview: `testtable.testId → anothertable.id`

---

## 🔄 Comparison: Form vs Click Method

### Form Method (📝 Create Custom):

**Pros:**
- ✅ Type exact table names
- ✅ Set FK name immediately
- ✅ See preview before creating
- ✅ All details in one step
- ✅ No need to find cuboids in 3D view

**Best for:**
- When you know exactly what you want
- Creating multiple relationships quickly
- When cuboids are hard to click (overlapping, far apart)

### Click Method (🔗 Click to Connect):

**Pros:**
- ✅ Visual/interactive
- ✅ See which cuboids you're connecting
- ✅ Good for exploring relationships

**Best for:**
- Visual learners
- Exploring relationships visually
- When you're not sure which tables to connect

---

## 🎯 Best Practices

### 1. **Descriptive FK Names**

Good examples:
- `userId` - Clear it's a user ID
- `authorId` - Describes the role (author)
- `customerId` - Describes the role (customer)
- `post_id` - Clear it references a post

Avoid:
- `id` - Confusing with primary key
- `fk` - Not descriptive
- `ref` - Too vague

### 2. **Consistent Naming**

Pick a style and stick to it:

**camelCase:**
- `userId`
- `postId`
- `authorId`

**snake_case:**
- `user_id`
- `post_id`
- `author_id`

### 3. **Check the Preview**

Always review the preview before clicking "Create":
```
Preview:
posts.userId → users.id
```

Make sure it matches what you want!

### 4. **Create FROM → TO Correctly**

**Rule**: The FROM table gets the FK column.

Example:
- Posts reference Users
- FROM: Posts (gets the FK)
- TO: Users (is referenced)
- Result: `posts.userId` column created

---

## 💾 What Gets Created

### In VisuBase:
1. Relationship entry in store
2. Yellow line in 3D view
3. Entry in Relationships list

### In Supabase (after sync):
```sql
-- Column added to FROM table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS userId INTEGER;

-- Foreign key constraint
ALTER TABLE posts
  ADD CONSTRAINT posts_userId_fkey
  FOREIGN KEY (userId)
  REFERENCES users(id)
  ON DELETE CASCADE;
```

### In Supabase Schema Visualizer:
- Visual line from Posts to Users
- Constraint name: `posts_userId_fkey`
- Hover shows: FROM posts.userId TO users.id

---

## 🐛 Troubleshooting

### Form doesn't appear:
- Make sure you clicked "📝 Create Custom"
- Should see green background form
- Try scrolling down

### "Could not find selected tables" error:
- Make sure tables exist
- Check table names match exactly
- Refresh the page if needed

### Preview shows wrong table names:
- Preview converts to SQL format (lowercase, underscores)
- This is correct - it's how it will appear in database
- Example: "Test Table" → "test_table"

### Relationship doesn't appear in 3D view:
- Check that both tables have cuboids
- Yellow line should appear immediately
- Try rotating camera view

### Want to change FK name after creating:
- Click ✏️ (pencil) icon in relationship list
- Enter new FK name
- Click ✓ to save

---

## 🚀 Advanced Tips

### Creating Multiple Relationships Quickly

Use the form to batch-create relationships:

1. Click "📝 Create Custom"
2. Fill: Posts → Users, FK: `authorId`
3. Click "✓ Create"
4. Form closes
5. Click "📝 Create Custom" again
6. Fill: Comments → Posts, FK: `postId`
7. Click "✓ Create"
8. Repeat for all relationships!

### Self-Referencing Relationships

Create relationships where a table references itself:

- FROM: Users
- TO: Users
- FK: `parentId`
- Result: `users.parentId → users.id`

Useful for hierarchical data (e.g., user reports to manager).

### Multiple FKs to Same Table

Create multiple relationships to the same table with different FK names:

**Relationship 1:**
- FROM: Posts, TO: Users, FK: `authorId`

**Relationship 2:**
- FROM: Posts, TO: Users, FK: `editorId`

Result: Posts has both `authorId` and `editorId` referencing Users!

---

## 📊 Summary

**Form-Based Relationship Creation:**
1. Click "📝 Create Custom"
2. Select FROM table (dropdown)
3. Select TO table (dropdown)
4. Enter FK column name (text input)
5. Review preview
6. Click "✓ Create Relationship"

**Benefits:**
- ✅ Type exact names
- ✅ Immediate FK column naming
- ✅ Preview before creating
- ✅ Faster than clicking cuboids
- ✅ No visual hunting required

**Perfect for:**
- Quick relationship creation
- Custom FK names like `userId`, `testId`
- Batch creating multiple relationships
- When you know exactly what you want

---

**Now you can create relationships by typing table names and custom FK column names like `userId` and `testId`!** 📝✨
