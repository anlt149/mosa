import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type Expense, type FixedCost } from '../services/expenseService';
import { Plus, AlertCircle, X, Trash2, Receipt } from 'lucide-react';
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
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: #ef4444;
    background: #27272a;
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  > * {
    margin-bottom: 0 !important;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 1;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  right: 1rem;
  color: #a1a1aa;
  font-weight: 500;
  pointer-events: none;
`;

const CostInput = styled(Input)`
  padding-right: 3rem;
  margin-bottom: 0 !important;
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

  const handleExpenseSubmit = () => {
    const amount = parseInt(expenseForm.amount.replace(/\D/g, ''), 10);
    if (!expenseForm.name.trim()) return toast.error('Please enter an expense name');
    if (!amount || amount <= 0) return toast.error('Please enter a valid amount');
    createExpense.mutate({ ...expenseForm, amount });
  };

  const handleCategorySubmit = () => {
    const budget = parseInt(categoryForm.monthly_budget.replace(/\D/g, ''), 10);
    if (!categoryForm.name.trim()) return toast.error('Please enter a category name');
    if (!budget || budget < 0) return toast.error('Please enter a valid budget');
    createCategory.mutate({ ...categoryForm, budget });
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
          <FormRow>
            <Input 
              style={{ flex: 1 }} type="text" placeholder="What did you buy?" 
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
            <Plus size={18} /> Add Expense
          </Button>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Recent Logs</h3>
          {expenses.map(e => {
            const cat = categories.find(c => c.id === e.category_id);
            return (
              <CategoryItem key={e.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: cat ? `${cat.color}20` : '#27272a', color: cat?.color || '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt size={20} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{e.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{e.log_date}</span>
                      {cat && (
                        <>
                          <span>•</span>
                          <span style={{ color: cat.color }}>{cat.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{formatter.format(e.amount)} ₫</div>
                  <ActionBtn onClick={() => deleteExpense.mutate(e.id)}><Trash2 size={16} /></ActionBtn>
                </div>
              </CategoryItem>
            );
          })}
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card>
          <h2>Manage Categories</h2>
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
              Add
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
                  <Button 
                    $variant={isPaid ? 'danger' : 'primary'} 
                    onClick={() => isPaid ? deleteExpense.mutate(linkedExpense.id) : payFixedCost.mutate(fc)}
                  >
                    {isPaid ? <><X size={16} /> Unpay</> : 'Mark Paid'}
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
