# Database Schema

Mosa uses a PostgreSQL database hosted by Supabase. All tables enforce strict **Row Level Security (RLS)**, ensuring that a user can only query, insert, update, or delete rows where the `user_id` matches their own authentication token (`auth.uid()`).

---

## `daily_logs`
Stores the daily mood, energy, and notes.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `auth.users`)
- `log_date` (DATE)
- `mood_score` (INT2)
- `energy_level` (INT2)
- `tags` (TEXT[])
- `note` (TEXT)
- `created_at` (TIMESTAMPTZ)
- *Constraint:* Unique index on `(user_id, log_date)` to prevent duplicate logs per day.

---

## `habits`
Stores the user-defined habits.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `auth.users`)
- `name` (TEXT)
- `color` (TEXT) - Hex code for UI rendering.
- `created_at` (TIMESTAMPTZ)

## `habit_logs`
Stores the daily check-ins for the habits.
- `id` (UUID, Primary Key)
- `habit_id` (UUID, Foreign Key -> `habits`)
- `log_date` (DATE)
- `created_at` (TIMESTAMPTZ)
- *Constraint:* Unique index on `(habit_id, log_date)`.

---

## `meals`
Stores granular data about dietary intake and food expenditure.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `auth.users`)
- `meal_name` (TEXT)
- `location_type` (TEXT) - Enum: `'eat_out'`, `'eat_home'`.
- `meal_type` (TEXT) - Enum: `'Breakfast'`, `'Lunch'`, `'Dinner'`, `'Snack'`.
- `cost_vnd` (INTEGER) - Cost of the meal in Vietnamese Dong (nullable).
- `tags` (TEXT[]) - e.g., `['Healthy', 'Spicy']`.
- `created_at` (TIMESTAMPTZ)

---

## `user_settings`
Stores account-level preferences and goals.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `auth.users`)
- `monthly_food_budget_vnd` (INTEGER) - Monthly budget target.
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- *Constraint:* Unique index on `user_id`.
