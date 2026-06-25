# Mosa Architecture

Mosa is designed as a modern, lightweight, and highly responsive single-page application (SPA). It uses a React frontend powered by Vite for rapid development and a Supabase backend for secure, scalable data management.

## Technology Stack

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) - Chosen for its extremely fast HMR (Hot Module Replacement) and optimized production builds.
- **Language:** TypeScript - Ensures type safety across components and services.
- **Styling:** [styled-components](https://styled-components.com/) - Allows for scoped, component-level CSS-in-JS, making it easy to implement dynamic themes (like our dark mode glassmorphism UI).
- **Icons:** [Lucide React](https://lucide.dev/) - A clean, consistent icon library.
- **Data Visualization:** [Recharts](https://recharts.org/) - Used for rendering the responsive spending analytics charts in the Meal Tracker.

### Backend (BaaS)
- **Database:** PostgreSQL (hosted via [Supabase](https://supabase.com/)).
- **Authentication:** Supabase Auth (Email/Password).
- **Security:** Row Level Security (RLS) is strictly enforced on all tables, ensuring users can only read and write their own data.

## Directory Structure

```text
mosa/
├── docs/                  # Project documentation (Architecture, Database, Features)
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components (Trackers, Heatmaps, Charts)
│   ├── lib/               # Core libraries (Supabase client configuration)
│   ├── pages/             # Route-level components (Daily Logs, Habits, Meals)
│   ├── services/          # API abstraction layer (e.g., mealService.ts, habitService.ts)
│   ├── App.tsx            # Main application shell and routing logic
│   └── main.tsx           # React entry point
└── supabase/
    └── migrations/        # Database schema definitions and SQL migrations
```

## Design Philosophy

1. **Vim-Centric Navigation:** Power users shouldn't have to reach for their mouse. We implement custom React hooks to capture keyboard events (`j`, `k`, `h`, `l`, `Enter`) to rapidly fill out daily logs.
2. **Dark Mode by Default:** The UI utilizes a premium dark aesthetic (`#09090b` backgrounds) accented with vibrant semantic colors (Emerald Green for health, Orange for spending/eating out).
3. **Service Abstraction:** The frontend components never write raw SQL or call Supabase directly. Instead, they call strongly-typed asynchronous methods in the `services/` directory, keeping the components clean and focused purely on rendering.
