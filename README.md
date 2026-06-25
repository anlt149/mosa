# Mosa — Personal Life Tracker

A lightweight, visually stunning web application for tracking your daily life. Mosa allows you to quantify your mood, track your daily habits, and manage your dietary and financial habits with an intuitive, premium dark-mode interface.

## Core Features

- **Daily Logs:** Track your mood, energy levels, and daily notes with Vim-style keyboard navigation.
- **Habits:** Build custom habits, color-code them, and visualize your daily streaks.
- **Meals & Finance:** Log what you eat, categorize meals, and track your food expenditures (VND) with a dynamic monthly budget and daily analytics.

*For a detailed breakdown, please see the [Documentation](#documentation).*

## Documentation

Dive deeper into how Mosa is built and functions:
- [Architecture & Tech Stack](./docs/ARCHITECTURE.md)
- [Detailed Features](./docs/FEATURES.md)
- [Database Schema & Security](./docs/DATABASE.md)

---

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
Ensure Docker is running, then spin up the local Supabase stack. This automatically applies database migrations (creates your tables and sets up RLS).

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
