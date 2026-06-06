# Goal: Mobile Support, Journaling, and Monthly Heatmap Editing

To improve the usability of the application, we will overhaul the interface to fully support mobile touch interactions, add a 1-line daily journal, convert the heatmap into an interactive monthly calendar, and allow for editing past days.

## User Review Required

> [!WARNING]
> **Database Migration**: This plan introduces a new `note` column to the `daily_logs` database table. I will provide the SQL migration file. Since you are using a local Supabase Docker instance, applying this migration will be straightforward (`supabase db reset` or restarting).

## Proposed Changes

### 1. Database Schema Update
- **Migration**: Create a new SQL migration file to alter the `daily_logs` table.
- **Action**: `ALTER TABLE daily_logs ADD COLUMN note TEXT;`

### 2. Mobile Touch Integration
Currently, the UI relies heavily on physical keyboard bindings (`h-j-k-l`).
- **Clickable Sliders**: I will modify the `<SliderTick>` components in the Mood and Energy sections to accept `onClick` events. 
- **Action**: Tapping the 4th block on a mobile phone will instantly update the score to 4. Tapping a section will focus it.

### 3. One-Line Journal Addition
- **Input Field**: Add a minimalist text `<Input>` below the Mood and Energy sections.
- **State**: Bind this to a `note` state variable. 
- **Vim Compatibility**: Our existing `useVimNavigation` hook already temporarily suspends itself when a user is typing in a text field, ensuring they can type "j" or "k" inside their journal note without accidentally navigating the form!

### 4. Monthly Heatmap & Interactive Editing
The 90-day static heatmap will be replaced with an interactive monthly calendar view.
- **Pagination**: Add `< Previous Month` and `Next Month >` buttons above the heatmap.
- **Calendar Grid**: Render a true calendar grid for the selected month (respecting the day of the week the 1st falls on).
- **Clickable Days**: Clicking any day on the heatmap will trigger an `onSelectDate` event.

### 5. Current Day vs. Past Day Visuals
When a user clicks a past date on the heatmap, the left-hand form will switch into "Historical Edit Mode".
- **State Hydration**: The form will auto-fill with the Mood, Energy, and Note for that specific past date.
- **Visual Distinction**: 
  - The card title will change from "Daily Log" to "Editing: [Date]".
  - The accent border color of the active sections and submit button will change (e.g., from White to an Amber/Orange) to clearly signal that they are modifying history, not logging today.
  - The submit button will say `UPDATE` instead of `SUBMIT`.

## Verification Plan
1. Apply the Supabase migration to add the `note` column.
2. Verify that clicking on slider ticks updates the score accurately (mobile simulation).
3. Test writing a text note and ensure "j/k/h/l" keystrokes register as text rather than vim commands.
4. Paginate through the new monthly heatmap to ensure accurate day alignments.
5. Click a past date, verify the UI shifts to Amber/Orange "Edit Mode", and ensure saving updates the specific historical record instead of today.
