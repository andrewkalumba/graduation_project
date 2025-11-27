# 🔗 Column-to-Column Relationships Guide

Complete guide to creating relationships between specific columns in different tables, not just using `id`.

## ✨ What's New

You can now specify:
1. **FROM Column** - Which existing column in the source table to use as FK (or create new)
2. **TO Column** - Which specific column in the target table to reference (not just `id`)

### Example:
Connect `users.email` → `profiles.user_email` instead of just `users.id` → `profiles.id`

---

## 🎯 Creating Column-to-Column Relationships

### Step 1: Open Custom Relationship Form

1. Go to **Schema Editor**
2. Scroll to **Relationships** section
3. Click **"📝 Create Custom"**

### Step 2: Fill Out the Form

The form now has 5 fields:

#### **1. FROM Table (source)**
Select the table that will contain the FK:
- Example: `Orders`

#### **2. TO Table (target/reference)**
Select the table being referenced:
- Example: `Products`

#### **3. Foreign Key Column Name**
Name for the FK column:
- Example: `product_sku`

#### **4. FROM Column (Optional)**
Choose which column to use as FK:
- **Leave empty** → Creates new FK column
- **Select column** → Uses existing column as FK

Example: Select `sku` if Orders already has a `sku` column

#### **5. TO Column (Optional)**
Choose which column to reference:
- **Leave empty** → References `id` column (default)
- **Select column** → References specific column

Example: Select `sku` to reference Products.sku instead of Products.id

### Step 3: Review Preview

The preview shows exactly what will be created:

```
Preview:
orders.product_sku → products.sku

ℹ️ Referencing "sku" instead of "id"
```

### Step 4: Create Relationship

Click **"✓ Create Relationship"**

Success message:
```
✅ Relationship created: Orders → Products.sku (FK: product_sku)
```

---

## 📋 Complete Examples

### Example 1: Reference Non-ID Column

**Scenario**: Orders should reference Products by SKU, not ID.

**Tables**:
- `Orders`: columns [`id`, `customer_id`, `quantity`]
- `Products`: columns [`id`, `name`, `sku`, `price`]

**Setup**:
1. FROM Table: **Orders**
2. TO Table: **Products**
3. FK Column Name: **product_sku**
4. FROM Column: *(leave empty - create new)*
5. TO Column: **sku** *(select from dropdown)*

**Preview**:
```
orders.product_sku → products.sku
ℹ️ Referencing "sku" instead of "id"
```

**Generated SQL**:
```sql
-- Add FK column
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_sku INTEGER;

-- Add FK constraint
ALTER TABLE orders
  ADD CONSTRAINT orders_product_sku_fkey
  FOREIGN KEY (product_sku)
  REFERENCES products(sku)
  ON DELETE CASCADE;
```

**In Supabase Schema Visualizer**:
- Line from `orders` to `products`
- Shows: `orders.product_sku` → `products.sku`

---

### Example 2: Use Existing Column as FK

**Scenario**: Users table already has `email` column. Profiles should use it to reference Users.

**Tables**:
- `Profiles`: columns [`id`, `name`, `bio`, `user_email`]
- `Users`: columns [`id`, `username`, `email`]

**Setup**:
1. FROM Table: **Profiles**
2. TO Table: **Users**
3. FK Column Name: **user_email** *(just for reference)*
4. FROM Column: **user_email** *(select existing column)*
5. TO Column: **email** *(select email column)*

**Preview**:
```
profiles.user_email → users.email
ℹ️ Using existing column "user_email" as FK
ℹ️ Referencing "email" instead of "id"
```

**Generated SQL**:
```sql
-- No column creation (using existing)

-- Add FK constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_email_fkey
  FOREIGN KEY (user_email)
  REFERENCES users(email)
  ON DELETE CASCADE;
```

**Result**: `profiles.user_email` references `users.email` directly!

---

### Example 3: Your Use Case (userId → testId)

**Scenario**: Connect `TestTable.userId` → `AnotherBox.testId`

**Tables**:
- `TestTable`: columns [`id`, `name`, `userId`]
- `AnotherBox`: columns [`testId`, `value`, `status`]

**Setup**:
1. FROM Table: **TestTable**
2. TO Table: **AnotherBox**
3. FK Column Name: **userId**
4. FROM Column: **userId** *(select existing column)*
5. TO Column: **testId** *(select testId column)*

**Preview**:
```
testtable.userId → anotherbox.testId
ℹ️ Using existing column "userId" as FK
ℹ️ Referencing "testId" instead of "id"
```

**Generated SQL**:
```sql
-- No column creation (using existing userId)

-- Add FK constraint
ALTER TABLE testtable
  ADD CONSTRAINT testtable_userId_fkey
  FOREIGN KEY (userId)
  REFERENCES anotherbox(testId)
  ON DELETE CASCADE;
```

**In Supabase Schema Visualizer**:
- Visual line from `TestTable` to `AnotherBox`
- Constraint: `testtable_userId_fkey`
- Shows: `testtable.userId` → `anotherbox.testId`

---

## 🎨 Form UI Guide

### Field States:

**FROM Column Dropdown:**
- **Disabled** until you select FROM Table
- Shows all columns from FROM Table
- Option to create new column (default)

**TO Column Dropdown:**
- **Disabled** until you select TO Table
- Shows all columns from TO Table
- Defaults to `id` column

### Preview Indicators:

**Blue ℹ️ icon**: Using existing column as FK
```
ℹ️ Using existing column "userId" as FK
```

**Purple ℹ️ icon**: Referencing non-id column
```
ℹ️ Referencing "testId" instead of "id"
```

---

## 💾 What Gets Created in Supabase

### Case 1: Create New FK Column

**Setup**: FROM Column = empty

**SQL**:
```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_sku INTEGER;

ALTER TABLE orders
  ADD CONSTRAINT orders_product_sku_fkey
  FOREIGN KEY (product_sku)
  REFERENCES products(sku);
```

### Case 2: Use Existing Column

**Setup**: FROM Column = `userId`

**SQL**:
```sql
-- No column creation

ALTER TABLE testtable
  ADD CONSTRAINT testtable_userId_fkey
  FOREIGN KEY (userId)
  REFERENCES anotherbox(testId);
```

### Case 3: Reference Non-ID Column

**Setup**: TO Column = `sku`

**SQL**:
```sql
ALTER TABLE orders
  FOREIGN KEY (product_sku)
  REFERENCES products(sku)  -- ← References sku, not id
```

---

## 📊 Supabase Schema Visualizer

### What You'll See:

**Connection Line:**
- Visual line from source table to target table
- Labeled with constraint name

**Constraint Details (on hover):**
```
Constraint: testtable_userId_fkey
Type: FOREIGN KEY
From: testtable.userId
To: anotherbox.testId
On Delete: CASCADE
```

**Important**: The Schema Visualizer shows the EXACT columns being connected, not just table→table!

---

## 🔍 Use Cases

### 1. **Natural Keys**
Connect using business keys instead of surrogate IDs:
- Orders → Products by `sku`
- Students → Classes by `course_code`
- Employees → Departments by `dept_code`

### 2. **Email-Based References**
Use email as natural key:
- Profiles → Users by `email`
- Subscriptions → Customers by `email`

### 3. **Composite References**
Build complex relationships:
- OrderItems → Products by `product_sku`
- OrderItems → Warehouses by `warehouse_code`

### 4. **Legacy Database Migration**
Match existing schema patterns:
- Keep original column names
- Maintain business logic relationships

---

## ⚙️ Technical Details

### Constraint Naming:
```
{from_table}_{from_column}_fkey
```

Examples:
- `orders_product_sku_fkey`
- `profiles_user_email_fkey`
- `testtable_userId_fkey`

### Column Data Types:
The FK column and reference column should have compatible types:
- ✅ `integer` → `integer`
- ✅ `text` → `text`
- ✅ `uuid` → `uuid`
- ❌ `integer` → `text` (will fail)

### CASCADE Behavior:
All relationships use `ON DELETE CASCADE`:
- Delete from TO table → Deletes rows in FROM table
- Example: Delete `products.sku='ABC'` → Deletes all orders with `product_sku='ABC'`

---

## 🐛 Troubleshooting

### FROM Column dropdown is empty:
- Make sure you've added columns to the FROM Table
- Select FROM Table first
- Check that table has columns defined

### TO Column dropdown is empty:
- Make sure you've added columns to the TO Table
- Select TO Table first
- Default option (`id`) should always be available

### "Column does not exist" error in Supabase:
- Make sure column exists before creating relationship
- If using existing column (FROM Column selected), verify it exists
- Sync tables first, then add relationships

### Type mismatch error:
- FROM Column and TO Column must have compatible types
- Check column types in table definitions
- Example: Can't reference `text` column with `integer` FK

### Relationship doesn't appear in Schema Visualizer:
- Click "Sync & Create Tables" to apply
- Refresh Supabase dashboard
- Check SQL Editor for constraint creation

---

## 💡 Best Practices

### 1. **Use Natural Keys When Appropriate**
If your data has natural unique identifiers (SKU, email, code), use them!

Good:
```
orders.product_sku → products.sku
```

Instead of:
```
orders.product_id → products.id
(then manually join on sku)
```

### 2. **Ensure Uniqueness**
The TO Column should be unique or a primary key:
- ✅ `products.sku` (unique constraint)
- ✅ `users.email` (unique constraint)
- ❌ `products.name` (not unique - multiple products can have same name)

### 3. **Match Data Types**
Always use matching data types:
```sql
-- Good
orders.product_sku VARCHAR(50) → products.sku VARCHAR(50)

-- Bad
orders.product_sku INTEGER → products.sku VARCHAR(50)
```

### 4. **Document Custom Relationships**
When using non-id references, add comments or documentation explaining why.

---

## 🚀 Advanced Examples

### Self-Referencing with Custom Column

**Scenario**: Employees report to manager by `employee_code`

**Setup**:
- FROM Table: **Employees**
- TO Table: **Employees** *(same table)*
- FK Column Name: **manager_code**
- FROM Column: *(leave empty)*
- TO Column: **employee_code**

**Result**:
```sql
ALTER TABLE employees
  ADD COLUMN manager_code VARCHAR(10);

ALTER TABLE employees
  ADD CONSTRAINT employees_manager_code_fkey
  FOREIGN KEY (manager_code)
  REFERENCES employees(employee_code);
```

### Multi-Column Relationship Pattern

Create multiple relationships to same table using different columns:

**Relationship 1**:
- FROM: Messages, TO: Users
- FK: sender_id, TO Column: id

**Relationship 2**:
- FROM: Messages, TO: Users
- FK: recipient_email, TO Column: email

**Result**: Messages reference Users by both ID and email!

---

## 📚 Summary

**New Capabilities:**
1. ✅ Reference any column, not just `id`
2. ✅ Use existing columns as FK
3. ✅ Connect column-to-column
4. ✅ See exact connections in Supabase Schema Visualizer

**Workflow:**
1. Select FROM and TO tables
2. Enter FK column name
3. **(Optional)** Select FROM Column (existing)
4. **(Optional)** Select TO Column (target)
5. Review preview
6. Create and sync to Supabase

**Example (Your Request)**:
```
TestTable.userId → AnotherBox.testId
✅ Done!
```

---

**Now you can connect any column to any column across tables and see the exact relationships in Supabase!** 🔗✨
