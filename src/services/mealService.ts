import { supabase } from '../lib/supabaseClient';

export interface Meal {
  id: string;
  user_id: string;
  meal_name: string;
  location_type: 'eat_out' | 'eat_home';
  cost_vnd: number | null;
  created_at: string;
}

export const mealService = {
  async logMeal(
    mealName: string,
    locationType: 'eat_out' | 'eat_home',
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
  }
};
