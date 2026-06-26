import { supabase } from '../lib/supabaseClient';

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood_score: number;
  energy_level: number;
  note: string | null;
  created_at: string;
}

export const moodService = {
  async getRecentLogs(days: number = 90): Promise<DailyLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    const pastDateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', pastDateStr)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data as DailyLog[];
  },

  async upsertLog(dateStr: string, mood: number, energy: number, note: string | null): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('log_date', dateStr)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('daily_logs')
        .update({ mood_score: mood, energy_level: energy, note })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          log_date: dateStr,
          mood_score: mood,
          energy_level: energy,
          note
        });
      if (error) throw error;
    }
  }
};
