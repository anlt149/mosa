import { supabase } from '../lib/supabaseClient';

export interface DailyTask {
  id: string;
  name: string;
  is_done: boolean;
  task_date: string;
  created_at?: string;
}

export const taskService = {
  async getTasks(dateStr: string): Promise<DailyTask[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('task_date', dateStr)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as DailyTask[];
  },

  async createTask(name: string, dateStr: string): Promise<DailyTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({ user_id: user.id, name, task_date: dateStr, is_done: false })
      .select()
      .single();

    if (error) throw error;
    return data as DailyTask;
  },

  async updateTaskName(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
  },

  async toggleTaskDone(id: string, isDone: boolean): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ is_done: isDone })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
    if (error) throw error;
  }
};
