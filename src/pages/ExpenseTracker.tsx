import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type Expense, type FixedCost } from '../services/expenseService';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
    span { color: #3b82f6; }
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: #18181b;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? '#27272a' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : '#a1a1aa'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatBox = styled.div`
  background: #18181b;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  border: 1px solid #27272a;

  .label { color: #a1a1aa; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .value { color: #fff; font-size: 1.8rem; font-weight: 700; }
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

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  background: ${({ $variant }) => $variant === 'primary' ? '#3b82f6' : $variant === 'danger' ? '#ef4444' : '#27272a'};
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const Input = styled.input`
  width: 100%;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  margin-bottom: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  width: 100%;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  margin-bottom: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
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

  const formatter = new Intl.NumberFormat('en-US');

  return (
    <PageContainer>
      <Header>
        <h1>Expense <span>Tracker</span></h1>
      </Header>

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
          <h2>Log Expense</h2>
          <div style={{ marginTop: '1rem' }}>
            <Input 
              type="text" placeholder="What did you buy?" 
              value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})} 
            />
            <Input 
              type="number" placeholder="Amount (₫)" 
              value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} 
            />
            <Select 
              value={expenseForm.category_id} onChange={e => setExpenseForm({...expenseForm, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input 
              type="date" 
              value={expenseForm.log_date} onChange={e => setExpenseForm({...expenseForm, log_date: e.target.value})} 
            />
            <Button $variant="primary" onClick={() => createExpense.mutate({ ...expenseForm, amount: parseInt(expenseForm.amount, 10) })}>
              <Plus size={18} /> Add Expense
            </Button>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Recent Logs</h3>
          {expenses.map(e => (
            <CategoryItem key={e.id}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600 }}>{e.name}</div>
                <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{e.log_date} • {categories.find(c => c.id === e.category_id)?.name || 'Uncategorized'}</div>
              </div>
              <div style={{ color: '#fff', fontWeight: 700 }}>{formatter.format(e.amount)} ₫</div>
            </CategoryItem>
          ))}
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card>
          <h2>Manage Categories</h2>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input 
              style={{ flex: 2, marginBottom: 0 }} type="text" placeholder="Category Name" 
              value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
            />
            <Input 
              style={{ flex: 1, marginBottom: 0 }} type="number" placeholder="Monthly Budget" 
              value={categoryForm.monthly_budget} onChange={e => setCategoryForm({...categoryForm, monthly_budget: e.target.value})} 
            />
            <Input 
              style={{ flex: 1, marginBottom: 0, padding: 0, height: '46px' }} type="color" 
              value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} 
            />
            <Button $variant="primary" style={{ flex: 'none' }} onClick={() => createCategory.mutate({ ...categoryForm, budget: parseInt(categoryForm.monthly_budget, 10) })}>
              Add
            </Button>
          </div>

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
              </CategoryItem>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'fixed' && (
        <Card>
          <h2>Fixed Costs</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Manage recurring bills. Marking a bill as paid adds it to your expenses for this month.</p>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Input 
              style={{ flex: 2, marginBottom: 0 }} type="text" placeholder="Bill Name (e.g. Rent)" 
              value={fixedForm.name} onChange={e => setFixedForm({...fixedForm, name: e.target.value})} 
            />
            <Input 
              style={{ flex: 1, marginBottom: 0 }} type="number" placeholder="Default Amount" 
              value={fixedForm.default_amount} onChange={e => setFixedForm({...fixedForm, default_amount: e.target.value})} 
            />
            <Select 
              style={{ flex: 1, marginBottom: 0 }} 
              value={fixedForm.category_id} onChange={e => setFixedForm({...fixedForm, category_id: e.target.value})}
            >
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button $variant="primary" onClick={() => createFixedCost.mutate({ ...fixedForm, amount: parseInt(fixedForm.default_amount, 10), categoryId: fixedForm.category_id || null })}>
              Add
            </Button>
          </div>

          <div>
            {fixedCosts.map(fc => {
              // check if paid this month
              const isPaid = expenses.some(e => e.fixed_cost_id === fc.id);
              return (
                <CategoryItem key={fc.id}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{fc.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{formatter.format(fc.default_amount || 0)} ₫</div>
                  </div>
                  <Button $variant={isPaid ? undefined : 'primary'} onClick={() => !isPaid && payFixedCost.mutate(fc)} disabled={isPaid}>
                    {isPaid ? <><CheckCircle2 size={16} /> Paid</> : 'Mark Paid'}
                  </Button>
                </CategoryItem>
              );
            })}
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
