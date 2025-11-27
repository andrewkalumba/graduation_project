# Custom Relationship Column Guide

## ✅ Feature Already Implemented!

Visubase **already supports** custom column selection for relationships! You can reference any column to any other column - not just "id".

---

## How to Create Custom Relationships

### Step 1: Click "Add Relationship"
In the Relationships section, click the **"+ Add Relationship"** button.

### Step 2: Fill in the Form

The relationship form has **5 fields**:

#### 1. **FROM Table** (Required)
Select the source table (e.g., `kampala`)

#### 2. **TO Table** (Required)
Select the target table (e.g., `entebbe`)

#### 3. **Foreign Key Column Name** (Required)
Name for the FK column that will be created
Example: `entebbe_location_id`

#### 4. **FROM Column** (Optional) ⭐ **This is what you asked for!**
- **Leave empty**: Creates a new FK column automatically
- **Select existing column**: Use an existing column as the FK

**Example**: If `kampala` table already has a column called `kampalaId`, select it here!

#### 5. **TO Column** (Optional) ⭐ **This too!**
- **Leave empty**: References the `id` column (default)
- **Select existing column**: Reference a specific column

**Example**: If `entebbe` table has a column called `entebbeId`, select it here!

---

## Example Scenario (Your Use Case)

### Tables:
**Table 1: kampala**
- `kampalaId` (integer, primary key)
- `name` (text)
- `location` (text)

**Table 2: entebbe**
- `entebbeId` (integer, primary key)
- `airport_name` (text)

### Creating Relationship:
```
FROM Table: kampala
TO Table: entebbe
FK Column Name: entebbe_ref
FROM Column: kampalaId  ← Select this!
TO Column: entebbeId     ← Select this!
```

### Result:
- Uses existing `kampalaId` column from `kampala` table
- References `entebbeId` column in `entebbe` table
- Creates foreign key constraint: `kampala.kampalaId → entebbe.entebbeId`

### Generated SQL:
```sql
-- Relationship: kampala -> entebbe
-- Foreign Key: kampala.kampalaId -> entebbe.entebbeId

ALTER TABLE kampala
  ADD CONSTRAINT kampala_kampalaId_fkey
  FOREIGN KEY (kampalaId)
  REFERENCES entebbe(entebbeId)
  ON DELETE CASCADE;
```

---

## Preview Feature

The form shows a **live preview** as you fill it in:

```
Preview:
kampala.kampalaId → entebbe.entebbeId

ℹ️ Using existing column "kampalaId" as FK
ℹ️ Referencing "entebbeId" instead of "id"
```

This confirms exactly what will be created!

---

## Default Behavior (if you don't select columns)

### If you leave both dropdowns empty:
```
FROM Table: users
TO Table: posts
FK Column Name: user_id
FROM Column: (empty)
TO Column: (empty)
```

**Result**:
- Creates new `user_id` column in `users` table
- References `id` column in `posts` table
- SQL: `users.user_id → posts.id`

---

## Advanced Examples

### Example 1: Use Custom Primary Key
```
FROM Table: orders
TO Table: customers
FK Column Name: customer_ref
FROM Column: (empty) - creates new column
TO Column: customer_code - reference custom PK
```
Result: `orders.customer_ref → customers.customer_code`

### Example 2: Reuse Existing FK Column
```
FROM Table: products
TO Table: categories
FK Column Name: category_id
FROM Column: existing_category_col - use existing column
TO Column: (empty) - use default id
```
Result: `products.existing_category_col → categories.id`

### Example 3: Full Custom (Your Use Case)
```
FROM Table: kampala
TO Table: entebbe
FK Column Name: entebbe_link
FROM Column: kampalaId
TO Column: entebbeId
```
Result: `kampala.kampalaId → entebbe.entebbeId`

---

## How It Works Technically

### In the Code:

**Relationship Object Stores:**
```typescript
{
  from: "table1_id",
  to: "table2_id",
  foreignKeyColumn: "fk_name",
  fromColumn: "kampalaId",     // ← Your custom FROM column
  toColumn: "entebbeId"        // ← Your custom TO column
}
```

**SQL Generation** (lib/supabaseSync.ts:310-330):
```typescript
// Determine which column to use as FK
const fromColumnName = rel.fromColumn || rel.foreignKeyColumn || `${toTableName}_id`;

// Determine which column to reference
const toColumnName = rel.toColumn || "id";

// Generate SQL
ALTER TABLE ${fromTableName}
  ADD CONSTRAINT ${constraintName}
  FOREIGN KEY (${fromColumnName})
  REFERENCES ${toTableName}(${toColumnName})
  ON DELETE CASCADE;
```

---

## Tips

1. **Create columns first**: Make sure the columns you want to reference already exist in your tables
2. **Check the preview**: Always verify the preview shows the correct relationship
3. **Use meaningful FK names**: Name your FK columns clearly (e.g., `author_user_id`, `parent_category_id`)
4. **Watch for types**: Make sure the FROM and TO columns have compatible types (both integer, both UUID, etc.)

---

## Troubleshooting

### "No columns available in dropdown"
**Problem**: The table doesn't have any columns yet.
**Solution**: Add columns to the table first, then create the relationship.

### "Relationship not showing in 3D"
**Problem**: Relationship was created but not visible.
**Solution**: Check the Relationships section in the editor - it should be listed there.

### "Foreign key constraint error"
**Problem**: Column types don't match.
**Solution**: Make sure both columns are the same type (e.g., both `integer` or both `uuid`).

---

## Summary

✅ **The feature you requested is already built!**

You can:
- Choose which column to use as FK (FROM column)
- Choose which column to reference (TO column)
- See a live preview before creating
- Use any columns, not just "id"

Just click **"Add Relationship"** and use the **FROM Column** and **TO Column** dropdowns! 🎉
