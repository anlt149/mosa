# Agent Project Guide: Mood & Energy Tracker

This document provides project-level context, standards, and rules for AI coding agents working on the Mood & Energy Tracker application.

---

## 1. Project Overview & Tech Stack
* **Project Owner:** An Lê
* **Application Goal:** A fast, lightweight, keyboard-centric web application for daily logging of mood and energy levels.
* **Tech Stack:**
  * **Frontend:** React + Vite (Single Page Application, static asset output)
  * **Language:** TypeScript (Strict mode enabled)
  * **Styling:** Tailwind CSS (Minimalist, high-contrast, retro-utility style)
  * **Backend & Auth:** Supabase (Database, Auth GoTrue module, Row Level Security)
  * **Hosting/Deployment:** Vercel

---

## 2. Core Coding & Quality Standards

### TypeScript
* Enforce strict type checking (`strict: true`).
* Avoid `any` types. Define explicit interfaces or types for all components, custom hooks, and API responses.
* Use functional components and React Hooks exclusively.

### Styling & Aesthetics
* Follow a **minimalist, high-contrast, retro-utility visual style**.
* Focus on maximum utility, fast load times, and data clarity rather than heavy transitions/animations.
* Use Tailwind CSS for rapid styling. Maintain consistent padding, margin, and typography.
* Ensure accessibility (correct contrast ratios, aria-labels for buttons).

### Database Security
* Row Level Security (RLS) is **mandatory** for all Supabase tables.
* Every query on `daily_logs` must be scope-constrained using `auth.uid()`.
* Direct client writes must go through security policies.

---

## 3. Database Schema
Ensure any database schema modifications or queries align with the following structure:

### Table: `daily_logs`
* `id` (`uuid`, primary key, default: `gen_random_uuid()`)
* `user_id` (`uuid`, foreign key to `auth.users`, default: `auth.uid()`)
* `log_date` (`date`, defaults to current date)
* `mood_score` (`int2`, range: 1 to 5)
* `energy_level` (`int2`, range: 1 to 10)
* `tags` (`text[]`, e.g., `['coding', 'workout', 'poor-sleep']`)
* `created_at` (`timestamptz`, default: `now()`)

---

## 4. Key UX Rules (Keyboard-Centric Interface)
* **Vim-style navigation binds (`h-j-k-l`)** must be implemented in the data entry flow:
  * `j` / `k`: Navigate vertically between input fields (e.g., mood score selection vs energy level selection).
  * `h` / `l`: Move horizontal sliders or values left/right (decrease/increase score).
* The goal is to allow the user to complete their daily check-in within seconds without needing to use a mouse/trackpad.
* Implement clear visual indicators for which element is currently focused/active.

---

## 5. Development & Deployment Environments
We separate environments completely to prevent testing from polluting production data:

* **Production:**
  * Supabase project: `mood-tracker-prod`
  * Vercel branch/environment: `main` (Production)
* **Development/Staging:**
  * Supabase project: `mood-tracker-dev`
  * Vercel branch/environment: Preview deployments & Local dev server
* **Variables:**
  * Frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 6. Common Development Commands
Use the following commands for managing and verifying the project:

* **Local Dev Server:** `npm run dev`
* **Production Build:** `npm run build`
* **Linting:** `npm run lint`
