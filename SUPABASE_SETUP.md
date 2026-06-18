# 🟢 Supabase & React SaaS Integration Guide ("Consistency Tracker")

Welcome to the definitive backend integration and setup guide for developers. This sequential playbook guides you from raw credentials to fully operational production authentication, resilient local server state synchronization, relational table schemas, and custom Row-Level Security (RLS) configurations.

---

## 📁 1. Vite & Supabase Integration Directory Architecture

To support clean maintenance as the application scales, keep all files organized by distinct concerns:

```text
/src
 ├── lib/
 │    └── supabaseClient.ts      # Thread-safe client instance initialization
 ├── hooks/
 │    └── useSupabaseAuth.ts     # Global authentication handlers & synchronization
 ├── components/
 │    └── Auth.tsx               # Signup, Login, Password Reset, and verify forms
 ├── App.tsx                     # Routing gatekeeper, app initialization & session validation
 └── types.ts                    # Global Type Definitions & interfaces
```

---

## ⚡ 2. Installation & Credentials Configuration

### Step A: Install SDK Packages
Run the following clean command at the workspace root of your React/Vite project:
```bash
npm install @supabase/supabase-js
```

### Step B: Setup Environment Variables
Save your credentials inside your `.env.local` or `.env` file using Vite's required exposure suffix:

```env
# .env.local
VITE_SUPABASE_URL="https://cwnkgmxssmjkqkyvzqnp.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_A6oljSlKv6yu1BK0Jl57eg_YNmoXsBx"
SUPABASE_PROJECT_ID="cwnkgmxssmjkqkyvzqnp"
```

---

## ⚙️ 3. Client Initialization (`src/lib/supabaseClient.ts`)

This thread-safe export configures automated JWT token refresh cycles and stores user login state in local storage:

```typescript
import { createClient } from "@supabase/supabase-js";

// Retrieve clean environment variables safely
const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || "https://cwnkgmxssmjkqkyvzqnp.supabase.co";
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || "sb_publishable_A6oljSlKv6yu1BK0Jl57eg_YNmoXsBx";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Critical Error: Supabase credentials are missing from the configuration. " +
    "Verify your environment files match .env.example"
  );
}

/**
 * Global shared Supabase client.
 * Using the publishable 'Anon' key is safe on public browsers because 
 * database access control restrictions are rigorously enforced at the
 * database core using Row-Level Security (RLS) policies.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
```

---

## 🔒 4. Production Security Guidelines & RLS

### Key Strategy: Publishable vs Service Role Secret Keys
- **The Publishable (`anon`) Key is Safe:** This is designed to be exposed in frontend bundles. It serves as your database's entrance coordinator. No table is accessible through this unless a custom, matching **Row-Level Security (RLS) Policy** approves the request.
- **The Service Role Key (`service_role`) IS DANGEROUS:** It bypasses all RLS filters entirely, acting as database superuser admin. **Never** include a service role key in frontend bundles under any circumstances! Keep it as a server-retained variable.

### Core Database RLS Implementation (Sample)
To enforce that a user only manages tasks they own:
```sql
-- Enable security core on the table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Establish custom restricted access policy
CREATE POLICY "Users can edit their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 📊 5. Relational SQL Setup Sequence
To register the base profiles trigger, game tables, and seed mission milestones immediately, open the **Supabase Dashboard**, select your project (`cwnkgmxssmjkqkyvzqnp`), navigate to the **SQL Editor**, click **New Query**, and copy-paste the contents of `/supabase_schema.sql` located at the root of this workspace.

---

## 🐛 6. Standard Dev Pitfalls & Resilient Fixes

### 1. Verification Login Redirect Loop
- **Cause:** When you trigger `supabase.auth.signUp()`, verification emails provide callback links directing back to port `3000` or production URLs (`auth.users` schema redirects configuration). If URLs mismatch or routes fail to handle callback query params, it might loop.
- **Fix:** Register `http://localhost:3000` and project custom host addresses into **URL Redirect Allowed Configuration** inside Supabase Auth Settings.

### 2. Session Disappears when Page Reloads
- **Cause:** The client initializes with `persistSession: false` or browser cookies / localStorage are fully disabled for parent frames.
- **Fix:** Initialize client with `persistSession: true` in your config (already handled inside `/src/lib/supabaseClient.ts`).

### 3. Server CORS Policy Restrictions
- **Cause:** Local development servers try querying API endpoints on mismatched domains or ports.
- **Fix:** Add allowed Origin CORS headers to API routes or utilize custom API proxies inside your `vite.config.ts`.
