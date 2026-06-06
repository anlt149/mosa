# Mood & Energy Tracker

A lightweight, keyboard-centric web application for tracking your daily mood and energy levels.

## Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS (v4), styled-components
* **Backend:** Supabase (Auth & Database) via Docker

## Prerequisites
- Node.js (v18 or higher recommended)
- **Docker Desktop** or **OrbStack** running on your machine (required for local Supabase)

## Local Development Setup

### 1. Clone & Install Dependencies
First, clone the repository and install the required npm packages:

```bash
npm install
```

### 2. Start Local Supabase
Ensure Docker is running, then spin up the local Supabase stack. This automatically applies database migrations (creates your `daily_logs` table and sets up RLS).

```bash
npm run supabase:start
```

Once started, the CLI will output your local API URL and `anon` key. It will also provide the URL to your local Supabase Studio (usually `http://127.0.0.1:54323`).

### 3. Configure Environment Variables
Create a file named `.env.local` in the root of the project:

```bash
touch .env.local
```

Add your local Supabase credentials (from the `supabase:start` output):

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

### 4. Start the Application
Run the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.
*Note: Do not use `npm start`, as Vite uses `npm run dev`.*

## Production Build
To create an optimized production build:

```bash
npm run build
```
You can preview the build using:
```bash
npm run preview
```

## Vim-Style Keyboard Navigation
The application features fast data entry using standard vim keys:
- `j` / `k` : Move vertically between Mood and Energy selections.
- `h` / `l` : Adjust the score left or right (decrease/increase).
- `Enter` : Submit the daily log when the submit button is active.
