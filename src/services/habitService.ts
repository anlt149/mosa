import { supabase } from '../lib/supabaseClient';

export interface Habit {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
}

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as Habit[];
  },

  async getHabitLogs(days: number = 180): Promise<HabitLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startRange = new Date();
    startRange.setDate(startRange.getDate() - days);
    const startStr = `${startRange.getFullYear()}-${String(startRange.getMonth() + 1).padStart(2, '0')}-${String(startRange.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('habit_logs')
      .select('id, habit_id, log_date')
      .gte('log_date', startStr);

    if (error) throw error;
    return data as HabitLog[];
  },

  async createHabit(name: string, color: string): Promise<Habit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name, color })
      .select()
      .single();

    if (error) throw error;
    return data as Habit;
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleHabitLog(habitId: string, dateStr: string, existingLogId?: string): Promise<void> {
    if (existingLogId) {
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLogId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, log_date: dateStr });
      if (error) throw error;
    }
  }
};
