import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type Expense, type FixedCost, type ExpenseCategory } from '../services/expenseService';
import { Plus, AlertCircle, X, Trash2, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
import { toast } from 'sonner';
import {
  Card,
  Button,
  ActionBtn,
  Input,
  Select,
  FormRow,
  InputWrapper,
  CostInput,
  CurrencySymbol,
  PageContainer,
  PageHeader,
  PageTitle,
  TabContainer,
  Tab
} from '../components/common';

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div`
  background: #18181b;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  border: 1px solid #27272a;

  .label { color: #a1a1aa; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .value { color: #fff; font-size: 1.8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  @media (max-width: 480px) {
    padding: 1rem;
    .label { font-size: 0.75rem; margin-bottom: 0.25rem; }
    .value { font-size: 1.25rem; }
  }
`;

const MissingDaysAlert = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  margin-bottom: 0.75rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #27272a;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => Math.min($percent, 100)}%;
  background: ${({ $color }) => $color};
`;



const getMonthRange = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${lastDay}`
  };
};

export function ExpenseTracker() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'expenses' | 'fixed'>('dashboard');
  
  // -- Form States --
  const [expenseForm, setExpenseForm] = useState({ name: '', amount: '', category_id: '', log_date: new Date().toISOString().split('T')[0] });
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#3b82f6', monthly_budget: '' });
  const [fixedForm, setFixedForm] = useState({ name: '', default_amount: '', category_id: '' });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any, field: string) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setter((prev: any) => ({ ...prev, [field]: '' }));
      return;
    }
    setter((prev: any) => ({ ...prev, [field]: parseInt(rawValue, 10).toLocaleString('en-US') }));
  };

  const monthRange = getMonthRange();

  // -- Queries --
  const { data: categories = [] } = useQuery({ queryKey: ['expense_categories'], queryFn: expenseService.getCategories });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses', monthRange.start, monthRange.end], queryFn: () => expenseService.getExpensesByDateRange(monthRange.start, monthRange.end) });
  const { data: fixedCosts = [] } = useQuery({ queryKey: ['fixed_costs'], queryFn: expenseService.getFixedCosts });

  // -- Mutations --
  const createExpense = useMutation({
    mutationFn: (data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'fixed_cost_id'>) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added');
      setExpenseForm({ ...expenseForm, name: '', amount: '' });
    }
  });

  const createCategory = useMutation({
    mutationFn: (data: { name: string, color: string, budget: number }) => expenseService.createCategory(data.name, data.color, data.budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
      toast.success('Category created');
      setCategoryForm({ name: '', color: '#3b82f6', monthly_budget: '' });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>> }) => expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
      setEditingExpenseId(null);
      setExpenseForm({ name: '', amount: '', category_id: '', log_date: new Date().toISOString().split('T')[0] });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Pick<ExpenseCategory, 'name' | 'color' | 'monthly_budget'>> }) => expenseService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Category updated');
      setEditingCategoryId(null);
      setCategoryForm({ name: '', color: '#3b82f6', monthly_budget: '' });
    }
  });

  const createFixedCost = useMutation({
    mutationFn: (data: { name: string, amount: number, categoryId: string | null }) => expenseService.createFixedCost(data.name, data.amount, data.categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_costs'] });
      toast.success('Fixed cost created');
      setFixedForm({ name: '', default_amount: '', category_id: '' });
    }
  });

  const payFixedCost = useMutation({
    mutationFn: (fc: FixedCost) => expenseService.createExpense({
      name: fc.name,
      amount: fc.default_amount || 0,
      log_date: new Date().toISOString().split('T')[0],
      category_id: fc.category_id,
      fixed_cost_id: fc.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Marked as paid');
    }
  });

  const deleteExpense = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense removed');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: expenseService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['fixed_costs'] });
      toast.success('Category removed');
    }
  });

  const deleteFixedCostMutation = useMutation({
    mutationFn: expenseService.deleteFixedCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed_costs'] });
      toast.success('Fixed cost removed');
    }
  });

  const handleExpenseSubmit = () => {
    const amount = parseInt(expenseForm.amount.replace(/\D/g, ''), 10);
    if (!expenseForm.name.trim()) return toast.error('Please enter an expense name');
    if (!amount || amount <= 0) return toast.error('Please enter a valid amount');
    if (editingExpenseId) {
      updateExpenseMutation.mutate({ id: editingExpenseId, data: { ...expenseForm, amount } });
    } else {
      createExpense.mutate({ ...expenseForm, amount });
    }
  };

  const handleCategorySubmit = () => {
    const budget = parseInt(categoryForm.monthly_budget.replace(/\D/g, ''), 10);
    if (!categoryForm.name.trim()) return toast.error('Please enter a category name');
    if (!budget || budget < 0) return toast.error('Please enter a valid budget');
    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, data: { ...categoryForm, monthly_budget: budget } });
    } else {
      createCategory.mutate({ ...categoryForm, budget });
    }
  };

  const editExpense = (e: Expense) => {
    setEditingExpenseId(e.id);
    setExpenseForm({ name: e.name, amount: e.amount.toString(), category_id: e.category_id || '', log_date: e.log_date });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({ name: '', amount: '', category_id: '', log_date: new Date().toISOString().split('T')[0] });
  };

  const editCategory = (c: ExpenseCategory) => {
    setEditingCategoryId(c.id);
    setCategoryForm({ name: c.name, color: c.color, monthly_budget: c.monthly_budget.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', color: '#3b82f6', monthly_budget: '' });
  };

  const handleFixedCostSubmit = () => {
    const amount = parseInt(fixedForm.default_amount.replace(/\D/g, ''), 10);
    if (!fixedForm.name.trim()) return toast.error('Please enter a bill name');
    if (!amount || amount <= 0) return toast.error('Please enter a valid amount');
    createFixedCost.mutate({ ...fixedForm, amount, categoryId: fixedForm.category_id || null });
  };

  // -- Computations --
  const totalBudget = useMemo(() => categories.reduce((s, c) => s + c.monthly_budget, 0), [categories]);
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const spent = expenses.filter(e => e.category_id === cat.id).reduce((s, e) => s + e.amount, 0);
      const percent = cat.monthly_budget > 0 ? (spent / cat.monthly_budget) * 100 : 0;
      return { ...cat, spent, percent };
    });
  }, [categories, expenses]);

  const missingDays = useMemo(() => {
    // Check current week (Mon-Sun)
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // 1-7 (Mon-Sun)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
    
    const missing = [];
    for (let i = 0; i < dayOfWeek; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hasLogs = expenses.some(e => e.log_date === dateStr);
      if (!hasLogs) {
        missing.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    }
    return missing;
  }, [expenses]);

  const recentExpenses = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const filtered = expenses.filter(e => new Date(e.log_date) >= sevenDaysAgo);

    const grouped: Record<string, Expense[]> = {};
    filtered.forEach(e => {
      if (!grouped[e.log_date]) grouped[e.log_date] = [];
      grouped[e.log_date].push(e);
    });
    
    return Object.entries(grouped).sort(([d1], [d2]) => d2.localeCompare(d1));
  }, [expenses]);

  const pieData = useMemo(() => {
    return categoryStats.filter(c => c.spent > 0).map(c => ({
      name: c.name,
      value: c.spent,
      color: c.color
    }));
  }, [categoryStats]);

  const weeklyBarData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTotal = expenses.filter(e => e.log_date === dateStr).reduce((sum, e) => sum + e.amount, 0);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayTotal
      });
    }
    return data;
  }, [expenses]);

  const formatter = new Intl.NumberFormat('en-US');

  return (
    <PageContainer style={{ maxWidth: '800px' }}>
      <PageHeader>
        <PageTitle>Expense <span>Tracker</span></PageTitle>
      </PageHeader>

      <TabContainer>
        <Tab $active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</Tab>
        <Tab $active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')}>Logs</Tab>
        <Tab $active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>Categories</Tab>
        <Tab $active={activeTab === 'fixed'} onClick={() => setActiveTab('fixed')}>Fixed Costs</Tab>
      </TabContainer>

      {activeTab === 'dashboard' && (
        <>
          <SummaryGrid>
            <StatBox>
              <div className="label">Total Spent this Month</div>
              <div className="value">{formatter.format(totalSpent)} ₫</div>
            </StatBox>
            <StatBox>
              <div className="label">Monthly Budget</div>
              <div className="value">{formatter.format(totalBudget)} ₫</div>
            </StatBox>
          </SummaryGrid>

          {missingDays.length > 0 && (
            <MissingDaysAlert>
              <AlertCircle size={20} />
              <div>You haven't logged any expenses for: <strong>{missingDays.join(', ')}</strong></div>
            </MissingDaysAlert>
          )}

          <ChartGrid>
            <Card style={{ marginBottom: 0 }}>
              <h2>Expenses by Category</h2>
              {pieData.length > 0 ? (
                <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `${formatter.format(value)} ₫`}
                        contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ color: '#a1a1aa', marginTop: '1rem' }}>No expenses to chart.</div>
              )}
            </Card>

            <Card style={{ marginBottom: 0 }}>
              <h2>Weekly Review</h2>
              <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyBarData}>
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(val) => val > 0 ? `${(val/1000)}k` : '0'} tickLine={false} axisLine={false} width={40} />
                    <Tooltip 
                      formatter={(value: any) => `${formatter.format(value)} ₫`}
                      cursor={{ fill: '#27272a' }}
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </ChartGrid>

          <Card>
            <h2>Category Breakdown</h2>
            <div style={{ marginTop: '1.5rem' }}>
              {categoryStats.map(cat => (
                <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
                      <span style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</span>
                    </div>
                    <span style={{ color: '#a1a1aa' }}>{formatter.format(cat.spent)} / {formatter.format(cat.monthly_budget)} ₫</span>
                  </div>
                  <ProgressBar>
                    <ProgressFill 
                      $percent={cat.percent} 
                      $color={cat.percent >= 100 ? '#ef4444' : cat.percent >= 70 ? '#f59e0b' : cat.color} 
                    />
                  </ProgressBar>
                  {cat.percent >= 70 && cat.percent < 100 && (
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.25rem' }}>Approaching budget limit ({(cat.percent).toFixed(0)}%)</div>
                  )}
                  {cat.percent >= 100 && (
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>Budget exceeded!</div>
                  )}
                </div>
              ))}
              {categoryStats.length === 0 && <div style={{ color: '#a1a1aa' }}>No categories created yet.</div>}
            </div>
          </Card>
        </>
      )}

      {activeTab === 'expenses' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: 0 }}>{editingExpenseId ? 'Edit Expense' : 'Log Expense'}</h2>
            {editingExpenseId && (
              <Button $variant="outline" onClick={cancelEditExpense} style={{ padding: '0.5rem 1rem' }}>Cancel Edit</Button>
            )}
          </div>
          <FormRow>
            <Input 
              style={{ flex: 1 }} type="text" placeholder="What did you spend?" 
              value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})} 
            />
            <InputWrapper>
              <CostInput 
                type="text" inputMode="numeric" placeholder="Amount" 
                value={expenseForm.amount} onChange={e => handleAmountChange(e, setExpenseForm, 'amount')} 
              />
              <CurrencySymbol>VND</CurrencySymbol>
            </InputWrapper>
          </FormRow>
          <FormRow style={{ marginTop: 0, marginBottom: '1rem' }}>
            <Select 
              style={{ flex: 1 }}
              value={expenseForm.category_id} onChange={e => setExpenseForm({...expenseForm, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input 
              style={{ flex: 1, marginBottom: 0 }} type="date" 
              value={expenseForm.log_date} onChange={e => setExpenseForm({...expenseForm, log_date: e.target.value})} 
            />
          </FormRow>
          <Button style={{ width: '100%', padding: '1rem' }} $variant="primary" onClick={handleExpenseSubmit}>
            {editingExpenseId ? 'Update Expense' : <><Plus size={18} /> Add Expense</>}
          </Button>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Recent Logs</h3>
          {recentExpenses.map(([date, dayExpenses]) => (
            <div key={date} style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              {dayExpenses.map(e => {
                const cat = categories.find(c => c.id === e.category_id);
                return (
                  <CategoryItem key={e.id} style={{ background: cat ? `${cat.color}15` : '#18181b', borderColor: cat ? `${cat.color}30` : '#27272a' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{e.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: cat ? cat.color : '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{formatter.format(e.amount)} ₫</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ActionBtn onClick={() => editExpense(e)}><Edit2 size={16} /></ActionBtn>
                        <ActionBtn onClick={() => {
                          if (window.confirm('Delete this expense?')) deleteExpense.mutate(e.id);
                        }}><Trash2 size={16} /></ActionBtn>
                      </div>
                    </div>
                  </CategoryItem>
                );
              })}
            </div>
          ))}
          {recentExpenses.length === 0 && <div style={{ color: '#a1a1aa' }}>No recent logs in the last 7 days.</div>}
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: 0 }}>{editingCategoryId ? 'Edit Category' : 'Manage Categories'}</h2>
            {editingCategoryId && (
              <Button $variant="outline" onClick={cancelEditCategory} style={{ padding: '0.5rem 1rem' }}>Cancel Edit</Button>
            )}
          </div>
          <FormRow>
            <Input 
              style={{ flex: 2 }} type="text" placeholder="Category Name" 
              value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
            />
            <InputWrapper>
              <CostInput 
                type="text" inputMode="numeric" placeholder="Monthly Budget" 
                value={categoryForm.monthly_budget} onChange={e => handleAmountChange(e, setCategoryForm, 'monthly_budget')} 
              />
              <CurrencySymbol>VND</CurrencySymbol>
            </InputWrapper>
            <Input 
              style={{ flex: 1, padding: 0, height: '46px' }} type="color" 
              value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} 
            />
            <Button $variant="primary" style={{ flex: 'none' }} onClick={handleCategorySubmit}>
              {editingCategoryId ? 'Update' : 'Add'}
            </Button>
          </FormRow>

          <div style={{ marginTop: '2rem' }}>
            {categories.map(c => (
              <CategoryItem key={c.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '4px', background: c.color }} />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Budget: {formatter.format(c.monthly_budget)} ₫</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionBtn onClick={() => editCategory(c)}><Edit2 size={16} /></ActionBtn>
                  <ActionBtn onClick={() => {
                    if (window.confirm('Delete this category? Related expenses will become uncategorized.')) {
                      deleteCategoryMutation.mutate(c.id);
                    }
                  }}><Trash2 size={16} /></ActionBtn>
                </div>
              </CategoryItem>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'fixed' && (
        <Card>
          <h2>Fixed Costs</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Manage recurring bills. Marking a bill as paid adds it to your expenses for this month.</p>
          
          <FormRow>
            <Input 
              style={{ flex: 2 }} type="text" placeholder="Bill Name (e.g. Rent)" 
              value={fixedForm.name} onChange={e => setFixedForm({...fixedForm, name: e.target.value})} 
            />
            <InputWrapper>
              <CostInput 
                type="text" inputMode="numeric" placeholder="Default Amount" 
                value={fixedForm.default_amount} onChange={e => handleAmountChange(e, setFixedForm, 'default_amount')} 
              />
              <CurrencySymbol>VND</CurrencySymbol>
            </InputWrapper>
            <Select 
              style={{ flex: 1 }} 
              value={fixedForm.category_id} onChange={e => setFixedForm({...fixedForm, category_id: e.target.value})}
            >
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button $variant="primary" style={{ flex: 'none' }} onClick={handleFixedCostSubmit}>
              Add
            </Button>
          </FormRow>

          <div>
            {fixedCosts.map(fc => {
              const linkedExpense = expenses.find(e => e.fixed_cost_id === fc.id);
              const isPaid = !!linkedExpense;
              return (
                <CategoryItem key={fc.id}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{fc.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{formatter.format(fc.default_amount || 0)} ₫</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button 
                      $variant={isPaid ? 'danger' : 'primary'} 
                      onClick={() => isPaid ? deleteExpense.mutate(linkedExpense.id) : payFixedCost.mutate(fc)}
                    >
                      {isPaid ? <><X size={16} /> Unpay</> : 'Mark Paid'}
                    </Button>
                    <ActionBtn onClick={() => {
                      if (window.confirm('Delete this fixed cost?')) {
                        deleteFixedCostMutation.mutate(fc.id);
                      }
                    }}><Trash2 size={16} /></ActionBtn>
                  </div>
                </CategoryItem>
              );
            })}
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
