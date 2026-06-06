---
name: mood-tracker-development
description: Recipes and workflows for initializing the React project, setting up the Supabase database with RLS policies, implementing keyboard navigation, and deploying to Vercel.
---

# Development Recipes: Mood & Energy Tracker

This document contains step-by-step recipes and checklists for building, configuring, and verifying components of the Mood & Energy Tracker.

---

## Recipe 1: Project Initialization & Configuration
Follow these steps to spin up the codebase:

1. **Create the React+Vite app**:
   ```bash
   npm create vite@latest ./ -- --template react-ts
   ```
2. **Install dependencies**:
   ```bash
   npm install @supabase/supabase-js react-router-dom lucide-react
   npm install -D tailwindcss postcss autoprefixer
   ```
3. **Initialize Tailwind CSS**:
   ```bash
   npx tailwindcss init -p
   ```
4. **Tailwind Config (`tailwind.config.js`)**:
   Ensure it includes paths to all components:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         fontFamily: {
           mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
         },
       },
     },
     plugins: [],
   }
   ```
5. **Base CSS (`src/index.css`)**:
   Add the Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## Recipe 2: Database Setup & RLS Configuration
Run the following SQL in your Supabase SQL editor (`mood-tracker-dev` and `mood-tracker-prod` projects):

### 1. Table Creation
```sql
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INT2 NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  energy_level INT2 NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate logs per user per day
CREATE UNIQUE INDEX unique_user_daily_log ON daily_logs (user_id, log_date);
```

### 2. Enable Row Level Security (RLS)
```sql
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
```

### 3. Setup RLS Policies
```sql
-- Select policy: users can only see their own logs
CREATE POLICY "Users can view their own logs" ON daily_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert policy: users can only insert their own logs
CREATE POLICY "Users can insert their own logs" ON daily_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update policy: users can only update their own logs
CREATE POLICY "Users can update their own logs" ON daily_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Delete policy: users can only delete their own logs
CREATE POLICY "Users can delete their own logs" ON daily_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

---

## Recipe 3: Keyboard Navigation Hook (H-J-K-L)
Here is the recommended implementation pattern for the Vim-style keyboard navigation in React.

### Implementation: `useVimNavigation.ts`
```typescript
import { useEffect } from 'react';

interface VimNavConfig {
  activeSection: 'mood' | 'energy';
  setActiveSection: (section: 'mood' | 'energy') => void;
  mood: number;
  setMood: (val: number | ((prev: number) => number)) => void;
  energy: number;
  setEnergy: (val: number | ((prev: number) => number)) => void;
  onSubmit: () => void;
}

export function useVimNavigation({
  activeSection,
  setActiveSection,
  mood,
  setMood,
  energy,
  setEnergy,
  onSubmit
}: VimNavConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering navigation if the user is typing in a text field
      if (document.activeElement?.tagName === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'text') {
        return;
      }

      switch (e.key) {
        // Vertical movement
        case 'j':
          setActiveSection('energy');
          break;
        case 'k':
          setActiveSection('mood');
          break;

        // Horizontal movement (adjusting levels)
        case 'h':
          if (activeSection === 'mood') {
            setMood(prev => Math.max(1, prev - 1));
          } else {
            setEnergy(prev => Math.max(1, prev - 1));
          }
          break;
        case 'l':
          if (activeSection === 'mood') {
            setMood(prev => Math.min(5, prev + 1));
          } else {
            setEnergy(prev => Math.min(10, prev + 1));
          }
          break;

        // Submit form
        case 'Enter':
          onSubmit();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, mood, energy, setMood, setEnergy, setActiveSection, onSubmit]);
}
```

---

## Recipe 4: Supabase Authentication Client Setup
Use this standard pattern for Supabase client configuration and Auth Router Guards.

### Client: `src/lib/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Route Guard: `src/components/AuthGuard.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">Loading session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Recipe 5: Verification & Testing
Before committing or submitting a pull request, run the verification workflow:

1. **Typecheck & Lints**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
2. **Local Integration Verification**:
   * Navigate to `http://localhost:5173`.
   * Clear local storage / session token and verify redirection to `/login`.
   * Log in using test credentials and verify redirects to the input dashboard.
   * Press `j` and `k` to swap focus between mood selection and energy levels. Check visual border state switches.
   * Press `h` and `l` to adjust scores.
   * Press `Enter` to submit a daily log, and verify a record is inserted in Supabase with current date and correct `user_id`.
   * Attempt to modify page query inputs to view another user's data; verify that Supabase's RLS blocks this access.
