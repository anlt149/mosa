-- Add meal_name column
ALTER TABLE meals ADD COLUMN meal_name TEXT;

-- For existing records, set a generic name based on location type
UPDATE meals SET meal_name = 'Meal at Home' WHERE location_type = 'eat_home' AND meal_name IS NULL;
UPDATE meals SET meal_name = 'Meal Out' WHERE location_type = 'eat_out' AND meal_name IS NULL;

-- Now make it NOT NULL to enforce it going forward
ALTER TABLE meals ALTER COLUMN meal_name SET NOT NULL;
