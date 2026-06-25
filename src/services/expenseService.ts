import { supabase } from '../lib/supabaseClient';

export interface FixedCost {
  id: string;
  user_id: string;
  name: string;
  default_amount: number | null;
  created_at: string;
}

export interface CostRecord {
  id: string;
  user_id: string;
  fixed_cost_id: string;
  month_key: string;
  actual_amount: number | null;
  is_paid: boolean;
  created_at: string;
}

export const expenseService = {
  async getFixedCosts(): Promise<FixedCost[]> {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as FixedCost[];
  },

  async createFixedCost(name: string, defaultAmount: number | null): Promise<FixedCost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fixed_costs')
      .insert({
        user_id: user.id,
        name,
        default_amount: defaultAmount,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FixedCost;
  },

  async updateFixedCost(id: string, updates: Partial<Pick<FixedCost, 'name' | 'default_amount'>>): Promise<FixedCost> {
    const { data, error } = await supabase
      .from('fixed_costs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FixedCost;
  },

  async deleteFixedCost(id: string): Promise<void> {
    const { error } = await supabase
      .from('fixed_costs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCostRecords(monthKey: string): Promise<CostRecord[]> {
    const { data, error } = await supabase
      .from('cost_records')
      .select('*')
      .eq('month_key', monthKey);
    
    if (error) throw error;
    return data as CostRecord[];
  },

  async upsertCostRecord(fixedCostId: string, monthKey: string, actualAmount: number | null, isPaid: boolean): Promise<CostRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cost_records')
      .upsert({
        user_id: user.id,
        fixed_cost_id: fixedCostId,
        month_key: monthKey,
        actual_amount: actualAmount,
        is_paid: isPaid,
      }, { onConflict: 'fixed_cost_id, month_key' })
      .select()
      .single();

    if (error) throw error;
    return data as CostRecord;
  }
};
