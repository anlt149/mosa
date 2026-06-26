import { supabase } from '../lib/supabaseClient';

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  monthly_budget: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  fixed_cost_id: string | null;
  name: string;
  amount: number;
  log_date: string;
  created_at: string;
}

export interface FixedCost {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  default_amount: number | null;
  created_at: string;
}

export const expenseService = {
  // --- Categories ---
  async getCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as ExpenseCategory[];
  },

  async createCategory(name: string, color: string, monthlyBudget: number): Promise<ExpenseCategory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        user_id: user.id,
        name,
        color,
        monthly_budget: monthlyBudget
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  },

  async updateCategory(id: string, updates: Partial<Pick<ExpenseCategory, 'name' | 'color' | 'monthly_budget'>>): Promise<ExpenseCategory> {
    const { data, error } = await supabase
      .from('expense_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Expenses ---
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false });
    
    if (error) throw error;
    return data as Expense[];
  },

  async createExpense(data: { name: string, amount: number, log_date: string, category_id?: string | null, fixed_cost_id?: string | null }): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single();

    if (error) throw error;
    return result as Expense;
  },

  async updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Fixed Costs ---
  async getFixedCosts(): Promise<FixedCost[]> {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as FixedCost[];
  },

  async createFixedCost(name: string, defaultAmount: number | null, categoryId: string | null = null): Promise<FixedCost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fixed_costs')
      .insert({
        user_id: user.id,
        name,
        default_amount: defaultAmount,
        category_id: categoryId
      })
      .select()
      .single();

    if (error) throw error;
    return data as FixedCost;
  },

  async updateFixedCost(id: string, updates: Partial<Pick<FixedCost, 'name' | 'default_amount' | 'category_id'>>): Promise<FixedCost> {
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
  }
};
