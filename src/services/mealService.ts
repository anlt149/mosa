import { supabase } from '../lib/supabaseClient';

export interface Meal {
  id: string;
  user_id: string;
  meal_name: string;
  location_type: 'eat_out' | 'eat_home';
  cost_vnd: number | null;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  tags: string[];
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  monthly_food_budget_vnd: number | null;
}

export const mealService = {
  async logMeal(
    mealName: string,
    locationType: 'eat_out' | 'eat_home',
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    tags: string[],
    costVnd?: number
  ): Promise<Meal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: mealData, error: dbError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        meal_name: mealName,
        location_type: locationType,
        meal_type: mealType,
        tags: tags,
        cost_vnd: costVnd || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to log meal');
    }

    return mealData as Meal;
  },

  async updateMeal(
    id: string,
    updates: Partial<Omit<Meal, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Meal> {
    const { data: mealData, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Failed to update meal');
    return mealData as Meal;
  },

  async deleteMeal(id: string): Promise<void> {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (error) throw new Error('Failed to delete meal');
  },

  async getRecentMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as Meal[];
  },

  async getAllMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Meal[];
  },

  async getUserSettings(): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(error);
      return null;
    }
    return data;
  },

  async updateUserSettings(monthlyBudget: number | null): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        monthly_food_budget_vnd: monthlyBudget,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error('Failed to update settings');
    return data as UserSettings;
  }
};
