# Mosa Features

Mosa is designed to be a frictionless, all-in-one personal life tracker. It currently consists of three major feature modules: Daily Logs, Habits, and Meals.

---

## 1. Daily Logs (Mood & Energy)

The foundation of Mosa is the Daily Log, allowing you to quantify your mental and physical state every day.

- **Mood & Energy Scoring:** Rate your mood and energy on a scale from 1 to 10.
- **Contextual Notes:** Add text notes to explain *why* you felt a certain way (e.g., "Slept poorly", "Great workout").
- **Vim Navigation:** Power users can navigate the scoring interface entirely with the keyboard (`j`, `k`, `h`, `l`) and submit with `Enter`.
- **Visual Heatmap:** View your history through a beautiful, GitHub-style contribution heatmap that intensifies based on your mood/energy scores.

---

## 2. Habit Tracker

Build consistency by tracking daily actions over time.

- **Custom Habits:** Create unlimited personalized habits (e.g., "Read 30 mins", "Drink Water", "Workout").
- **Color Coding:** Assign custom HEX colors to each habit so they stand out in your dashboard.
- **Daily Check-ins:** A simple toggle interface lets you instantly log whether you completed a habit on a given day.
- **Streak Visualization:** The habit dashboard renders a grid showing your consistency over the past weeks.

---

## 3. Premium Meal & Finance Tracker

A robust module dedicated to tracking what you eat and how much you spend on it.

- **Detailed Logging:**
  - **Meal Name:** Explicitly name your meals (e.g., "Phở", "Oatmeal").
  - **Meal Type:** Categorize as Breakfast, Lunch, Dinner, or Snack using quick-select pills.
  - **Location Type:** Differentiate between "Eat at Home" and "Eat Out".
  - **Cost Tracking (VND):** Input exactly how much you spent on the meal. The UI automatically formats inputs with comma separators for readability (e.g., `150,000`).
  - **Tags:** Add custom, comma-separated tags (e.g., "Healthy", "Cheat Meal").
- **Edit & Delete:** Hover over any logged meal in the history list to quickly edit typos, adjust costs, or delete accidental entries.
- **Budget Management:** 
  - Set a **Total Monthly Food Budget** via the settings gear.
  - A dynamic progress bar visualizes how much of your budget you've consumed, turning red if you approach your limit.
- **Spending Analytics:** A Recharts-powered Bar Chart visualizes your spending over the last 7 days, stacking "Eat Home" and "Eat Out" costs for easy visual comparison.
