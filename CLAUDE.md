# Visubase - Architecture & Codebase Guide

## Project Overview

**Visubase** is a modern web application that allows users to visually design database schemas in 3D space and synchronize them with Supabase. It combines interactive 3D visualization with a responsive schema editor interface, enabling users to design, manage, and deploy database structures through an intuitive graphical interface.

### Key Value Propositions
- **Visual 3D Schema Design**: Interactive 3D scene showing database tables as rotating cuboids
- **Drag-and-Drop Table Positioning**: Rearrange tables in 3D space for intuitive organization
- **Relationship Management**: Create and manage foreign key relationships visually
- **Supabase Integration**: Directly sync schemas to Supabase and generate real database tables
- **Responsive UI**: Works seamlessly on desktop, tablet, and mobile devices
- **Authentication**: User authentication via Supabase

---

## Technology Stack

### Core Framework & Runtime
- **Next.js 16.0.3** - React-based framework with App Router (RSC)
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5** - Full static type checking
- **Node.js LTS** - Runtime environment

### 3D Visualization
- **Three.js 0.181.2** - 3D graphics library
- **react-three/fiber 9.4.0** - React renderer for Three.js
- **react-three/drei 10.7.7** - Useful 3D components (Line, OrbitControls, Html)

### State Management & Data Fetching
- **Zustand** - Lightweight client-side state management with persistence
- **TanStack React Query 5.90.11** - Server state management & async operations
- **localStorage** - Client-side persistence for schemas and credentials

### Backend & Database
- **Supabase JS SDK 2.84.0** - PostgreSQL BaaS with authentication
- **PostgreSQL** - Underlying database (managed by Supabase)

### Form & Validation
- **React Hook Form 7.67.0** - Performant form management
- **Zod 4.1.13** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration with React Hook Form

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Sonner 2.0.7** - Toast notifications library
- **PostCSS 4** - CSS processing

### Development Tools
- **ESLint 9** - Code linting
- **Sharp 0.34.5** - Image optimization for Next.js

---

## High-Level Architecture

### Application Flow

```
User Access
    ↓
Auth System (Supabase)
    ↓
  ├─ Not Authenticated → Setup/Login/Signup Pages
  │       ↓
  │   SetupGuide (Credentials Configuration)
  │       ↓
  │   LoginPage or SignupPage
  │       ↓
  └─ Authenticated → Main Application
        ↓
    [3D Scene] + [Schema Editor] (Split View)
        ↓
    State Management (Zustand Store)
        ↓
    ├─ Local Persistence (localStorage)
    └─ Supabase Sync (Cloud Backend)
```

### Component Architecture

#### Layout Hierarchy
```
RootLayout (Server + Client Hydration)
  ├─ QueryClientProvider (React Query)
  ├─ AuthProvider (Auth Context)
  ├─ Toaster (Notifications)
  └─ Page Content
      ├─ [If Authenticated]
      │   └─ Home (Main App)
      │       ├─ RotatingCuboids/Scene (3D Visualization - 60% on desktop)
      │       └─ SchemaEditor (UI Control Panel - 40% on desktop)
      └─ [If Not Authenticated]
          ├─ SetupPage (First-time Supabase setup)
          ├─ LoginPage (Existing users)
          └─ SignupPage (New users)
```

---

## Key Directories & File Organization

### `/app` - Next.js App Router (Client Components)
- **`layout.tsx`** - Root layout with providers (QueryClient, Auth, Toaster)
- **`page.tsx`** - Main home page with auth state and split-view layout
- **`globals.css`** - Global styles using Tailwind

### `/app/components` - React UI Components
- **Auth/** - Authentication flow
  - `LoginPage.tsx` - Login form with email/password
  - `SignupPage.tsx` - User registration with validation
  - `SetupPage.tsx` - Initial Supabase connection setup

- **SchemaEditor/** - Main editor panel (1832 lines)
  - Table/column CRUD operations
  - Relationship management
  - Sync to Supabase
  - Data persistence controls
  - Geometric position calculation for new tables

- **RotatingCuboids/** - 3D table visualization
  - Interactive rotating boxes representing tables
  - Drag-and-drop positioning
  - Selection and connection mode handling
  - Context menu integration

- **visuBaseScene/** - Canvas setup and scene management
  - Three.js Canvas initialization
  - Table and relationship line rendering
  - Camera and lighting configuration

- **InteractiveBox/** - Individual 3D box component
  - Mesh with color changes on hover
  - Label rendering
  - Draggable behavior
  - Click handlers for selection/relationship

- **RelationshipLine/** - 3D line visualization
  - White lines connecting related tables
  - Dynamic updates based on store changes

- **DraggableTables/** - Drag gesture handling
  - Uses `@use-gesture/react` for smooth drag interactions
  - Position update callbacks

- **ContextMenu/** - Right-click context menu
  - Table deletion
  - Relationship creation
  - Table renaming

- **Label/** - 3D text label rendering
- **SetupGuide/** - Step-by-step Supabase connection wizard

### `/contexts` - React Context Providers
- **`AuthContext.tsx`** (148 lines)
  - User authentication state management
  - Supabase client initialization
  - Credential persistence in localStorage
  - signUp, signIn, signOut operations
  - Custom Supabase client support for multi-project scenarios

### `/store` - Zustand State Management
- **`schemaStore.tsx`** (157 lines)
  - **Tables**: List of table objects with position, color, columns
  - **Relationships**: Array of foreign key relationships
  - **Selection State**: Selected table and connect mode
  - **Actions**: Add/update/delete tables, columns, and relationships
  - **Persistence**: localStorage persistence with `persist` middleware
  - **Storage Key**: `"visubase-storage"`

### `/lib` - Utility Functions & Business Logic
- **`supabase.ts`** - Supabase client initialization from env vars
- **`supabaseSync.ts`** (517+ lines) - Data synchronization
  - `syncSchemaToSupabase()` - Save schema design to cloud
  - `createTablesInSupabase()` - Execute SQL to create real tables
  - `generateSQL()` - Convert visual schema to PostgreSQL
  - `loadSchemaFromSupabase()` - Retrieve saved designs
  - `listSchemasFromSupabase()` - List all saved schemas
  - `initializeSupabaseStorage()` - Create schemas table on first use
  - `exportSchemaAsJSON()` - Export for backup
  - `fetchTablesFromSupabase()` - Import existing tables
  - `SETUP_SQL` - SQL template for initial setup

- **validations/auth.ts** - Zod schemas for form validation
  - `loginSchema` - Email + password validation
  - `signupSchema` - Full name + email + password + confirmation
  - `supabaseCredentialsSchema` - URL + API key validation

### `/types` - TypeScript Type Definitions
- **`schema.ts`** - TableSchema interface
- **`authContext.ts`** - AuthContextType interface
- **`rotatingCuboidProps.ts`** - 3D component props
- **`contextMenuProps.ts`** - Context menu props

### `/actions` - Server Actions (RSC)
- **`SaveSchema.ts`** - Placeholder for potential server-side persistence

### `/public` - Static Assets
- Database background images (database.jpg, database2.jpg, database3.jpg)

---

## Core State Management

### Zustand Schema Store (`/store/schemaStore.tsx`)

The centralized state for the entire application:

```typescript
interface Schema {
  // Data
  tables: Table[]              // Array of database tables
  relationships: Relationship[] // Foreign key connections

  // UI State
  selected: string | null      // Currently selected table
  connectMode: string | null   // Table awaiting relationship target

  // Mutations
  setSelected()
  setConnectMode()
  addTable()
  renameTable()
  deleteTable()
  updateTablePosition()       // 3D positioning
  addColumn()
  updateColumn()
  deleteColumn()
  addRelationship()
  updateRelationship()
  deleteRelationship()
}
```

**Key Design Pattern**: Zustand with `persist` middleware writes to `localStorage:visubase-storage`

---

## Authentication Flow

### System Architecture
```
AuthContext (Global State)
    ↓
Supabase Client (Lazy Initialization)
    ↓
3 Scenarios:
1. No credentials → SetupPage (Credential input)
2. Invalid credentials → Error messages
3. Valid credentials → User auth management
```

### Key Implementation Details

**AuthContext.tsx** features:
- Dual-client support: Environment variables + localStorage
- Session persistence via Supabase SDK listener
- Auto-signup to auto-login flow with session detection
- Credentials stored in localStorage as `visubase_url` and `visubase_key`

**Authentication Methods**:
- Email/Password signup (with validation)
- Email/Password login
- Automatic session detection on app load

**Notable Behavior**:
```typescript
// Sign up flow handles two scenarios:
1. Email confirmation disabled → Instant session
2. Email confirmation enabled → Immediate sign-in attempt
   (Allows users to access app without email verification)
```

---

## 3D Visualization Architecture

### Three.js Canvas Setup (`/app/components/visuBaseScene/index.tsx`)
```typescript
<Canvas camera={{ position: [6, 6, 6], fov: 40 }}>
  {/* Lighting */}
  <ambientLight intensity={0.8} />
  <pointLight position={[10, 10, 10]} />
  <directionalLight position={[-5, 5, 5]} intensity={0.5} />

  {/* Dynamic Content */}
  {tables.map(table => <InteractiveBox table={table} />)}
  {relationships.map(rel => <RelationshipLine {...rel} />)}

  {/* Controls */}
  <OrbitControls /> {/* Mouse-based camera control */}
</Canvas>
```

### Interactive Table Rendering (`/app/components/RotatingCuboids/index.tsx`)

**RotatingCuboid Component** provides:
- Continuous rotation via `useFrame` hook
- Drag-and-drop positioning in 3D space
- Context menu on right-click
- Selection highlighting (changes cuboid color)
- Connection mode visual feedback
- Relationship creation by clicking two tables

**Interactions**:
| Action | Result |
|--------|--------|
| Click | Select/deselect table |
| Right-click | Context menu (delete, rename, connect) |
| Drag | Move table in 3D space |
| Click (connect mode) | Create relationship to another table |

---

## Data Persistence Strategy

### Multi-Layer Persistence

```
Layer 1: In-Memory Store (Zustand)
    ↓ (Automatic sync)
Layer 2: Browser localStorage (persistence across sessions)
    Key: "visubase-storage"
    ↓ (Manual sync via UI button)
Layer 3: Supabase Cloud (Schemas table)
    URL: {supabase-project}.supabase.co
    Table: public.schemas (JSON storage)
    ↓ (Generate SQL via button)
Layer 4: Actual Database Tables (SQL execution)
    PostgreSQL tables created in user's Supabase project
```

### Synchronization Methods

**Save Locally**:
- Automatic via Zustand's `persist` middleware
- No user action required
- Survives browser refresh

**Sync to Cloud**:
- User clicks "Sync Schema" button
- Calls `syncSchemaToSupabase()`
- Upserts to `public.schemas` table as JSONB
- Credential validation before upload

**Create Real Tables**:
- User clicks "Create Tables" button
- Generates PostgreSQL DDL via `generateSQL()`
- Calls Supabase RPC function `exec_sql()`
- Creates actual tables with columns and constraints

---

## Configuration & Environment

### Environment Variables (`.env.local`)
```bash
# Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Optional service role key (server-side only)
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Next.js Configuration (`next.config.ts`)
```typescript
{
  transpilePackages: ['three'],      // Required for Three.js
  reactStrictMode: true              // Development safety checks
}
```

### TypeScript Configuration
- Target: ES2017
- Module: esnext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` → root directory
- JSX: react-jsx (React 17+ syntax)

---

## Build & Development Commands

### Available Scripts

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm start         # Run production build
npm run lint      # Run ESLint
```

### Build Characteristics
- **Build time**: ~2.2 seconds
- **Output**: `.next` directory with optimized bundle
- **Type checking**: Zero TypeScript errors
- **Performance**: 60 FPS 3D rendering target

---

## Key Architectural Patterns

### 1. **Client Component Strategy**
- Root layout is `"use client"` for provider setup
- All components use client-side rendering
- No server-side persistence (by design)

### 2. **State Management Hierarchy**
```
Global State (Zustand) ← Source of Truth
    ↓
React Components (read + dispatch actions)
    ↓
localStorage (automatic persistence)
    ↓
Supabase (manual sync)
```

### 3. **Reactive 3D Updates**
- Zustand store changes trigger re-renders
- Three.js meshes update automatically via dependencies
- Position, color, and relationship changes propagate instantly

### 4. **Form Validation Strategy**
- Zod schemas define validation rules
- React Hook Form manages form state
- Automatic error message display
- Strong type inference from schemas

### 5. **Async Operation Handling**
- React Query for server state management
- useMutation for auth operations (login/signup)
- Toast notifications for user feedback
- Error boundaries for graceful failures

---

## Unique/Non-Standard Architectural Decisions

### 1. **Dual-Client Supabase Support**
The app supports two ways to connect to Supabase:
- **Environment variables**: For deployment
- **Runtime credentials**: For multi-project flexibility

This unusual design choice allows users to dynamically switch between Supabase projects without rebuilding the app.

**Implementation**:
```typescript
// AuthContext stores runtime credentials
const [supabaseUrl, setSupabaseUrl] = useState("");
const [supabaseKey, setSupabaseKey] = useState("");

// Lazy creates client on first use
const client = customUrl && customKey
  ? createClient(customUrl, customKey)
  : supabase; // Falls back to env vars
```

### 2. **Geometric Position Calculation**
Tables are automatically positioned in expanding geometric patterns:
```typescript
// Tables 1-3: Equilateral triangle
// Tables 4-6: Square around triangle
// Tables 7-12: Hexagon
// Tables 13+: Expanding circles
```
This ensures visual clarity without manual positioning.

### 3. **JSONB Schema Storage**
Instead of normalizing schema data, the entire design is stored as JSONB:
```sql
CREATE TABLE public.schemas (
  id UUID,
  name TEXT UNIQUE,
  data JSONB,  -- { tables: [...], relationships: [...] }
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Rationale**: Flexibility for evolving schema structure without migrations.

### 4. **RPC-Based SQL Execution**
The app executes arbitrary SQL through Supabase RPC:
```typescript
const { data, error } = await client.rpc('exec_sql', {
  sql_query: generateSQL(schema)
});
```

**Security Note**: Requires users to manually create the `exec_sql` function with SECURITY DEFINER. This design trades convenience for explicit user control.

### 5. **Auto Sign-In After Signup**
The signup flow attempts automatic login even if email confirmation is required:
```typescript
// Step 1: Sign up
const { data } = await signUp(email, password, fullName);

// Step 2: If no session, try immediate sign-in
if (!data.session) {
  await signInWithPassword(email, password);
}
```

This provides a seamless UX even with email confirmation enabled.

---

## Notable Implementation Details

### 3D Drag Handling
```typescript
// Plane-based constraint for smooth dragging
const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
const dragOffset = useRef(new THREE.Vector3());

// Position updated during frame to prevent visual lag
useFrame(() => {
  if (isDragging) {
    // Update position from pointer intersection with plane
  }
});
```

### Relationship Visualization
```typescript
// Two-step connection process
1. Click "Connect" on source table → connectMode = sourceTableId
2. Click target table → addRelationship(sourceId, targetId)

// Rendered as white lines between table positions
<Line points={[fromPos, toPos]} color="white" lineWidth={2} />
```

### Mobile Responsiveness
```typescript
// Desktop: 3D scene 60% left, editor 40% right
// Mobile: Toggle between 3D (35vh) and editor (scrollable)
// Tablet: Flexible split with scroll
```

---

## Error Handling Strategy

### Authentication Errors
```
Invalid credentials → Show warning banner with Setup link
Missing Supabase → Prevent login, suggest setup
```

### Sync Errors
```
Missing schemas table → Auto-create or show SQL instructions
Invalid table data → Validation before sync attempt
SQL execution errors → Display error with SQL preview
```

### UI Error Messaging
- Sonner toast for notifications
- Inline validation errors with React Hook Form
- Console logging for debugging

---

## Performance Optimizations

### 3D Rendering
- Three.js uses WebGL (GPU-accelerated)
- Rotation only updates when not dragging
- Conditional rendering of relationship lines
- OrbitControls uses event throttling

### React Performance
- Zustand for minimal re-renders (only affected components)
- React Query DevTools for debugging
- No unnecessary dependencies in useEffect
- Memoization not needed (Zustand provides granular updates)

### Bundle Optimization
- Next.js automatic code splitting
- Tree-shaking enabled
- Sharp for image optimization
- Tailwind JIT mode

---

## Supabase Database Schema

### Public Tables

**`schemas`** - User-created visual designs
```sql
CREATE TABLE public.schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,  -- { tables, relationships }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policy**: All operations allowed (can be restricted per user)

### Required Functions

**`exec_sql(sql_query TEXT)`** - Execute arbitrary SQL
```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
END;
$$;
```

⚠️ **Security**: Only create this function in development or with proper access controls.

---

## Testing & Debugging

### Browser DevTools
- **Console**: Check auth logs and sync errors
- **Application > localStorage**: Verify credential persistence
- **Network tab**: Monitor Supabase API calls
- **React Query DevTools**: Enabled in development

### Common Issues & Solutions

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| Not logging in after signup | Session not created | Disable email confirmation in Supabase |
| "schemas table not found" | Initial setup not run | Run SETUP_SQL or use auto-create |
| Credentials not persisting | localStorage disabled | Check browser privacy settings |
| 3D scene not rendering | WebGL not supported | Use modern browser or check GPU |

---

## Future Enhancement Opportunities

### High Priority
1. **Row-Level Security (RLS)**: Restrict access per authenticated user
2. **Undo/Redo**: For schema editing
3. **SQL Export Formats**: MySQL, PostgreSQL variants
4. **Schema Diff Viewer**: Show changes before syncing

### Medium Priority
1. **Keyboard Shortcuts**: Faster workflow
2. **Dark Mode**: Long session comfort
3. **Schema Templates**: Pre-built patterns
4. **Reverse Engineering**: Import existing tables

### Nice to Have
1. **Collaboration**: Multi-user real-time editing
2. **Version History**: Track all schema changes
3. **AI Suggestions**: Auto-generate schemas
4. **Performance Monitoring**: Track render FPS

---

## Development Workflow

### Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env.local` with Supabase credentials
4. Run `npm run dev`
5. Open http://localhost:3000
6. First time: Use SetupGuide to configure Supabase

### Making Changes
- **3D Logic**: Edit `/app/components/RotatingCuboids/`
- **Schema Editor**: Edit `/app/components/SchemaEditor/`
- **State Logic**: Edit `/store/schemaStore.tsx`
- **Sync Logic**: Edit `/lib/supabaseSync.ts`
- **Auth Flow**: Edit `/contexts/AuthContext.tsx`

### Type Safety
- Run `npm run lint` to check TypeScript
- All components require proper type annotations
- Zod schemas validate form data

---

## Summary

Visubase is a sophisticated web application demonstrating modern React patterns combined with innovative use of 3D visualization. Its architecture separates concerns effectively:

- **UI Layer**: Tailwind + Sonner for responsive, accessible interfaces
- **State Management**: Zustand with localStorage persistence
- **3D Rendering**: Three.js + React Three Fiber for interactive visualization
- **Backend Integration**: Supabase for authentication and data storage
- **Type Safety**: Full TypeScript coverage with Zod validation

The dual-client Supabase support and RPC-based SQL execution are notable architectural decisions that prioritize user flexibility over framework constraints. The combination of persistent local state and cloud synchronization provides a seamless offline-first experience with optional cloud backup.

