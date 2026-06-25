import { useEffect, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { expenseService, type FixedCost, type CostRecord } from '../services/expenseService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;

  span {
    color: #3b82f6;
  }
`;

const MonthNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 999px;
  padding: 0.5rem;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  
  &:hover {
    color: #fff;
    background: #27272a;
  }
`;

const MonthLabel = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  min-width: 120px;
  text-align: center;
`;

const SummaryBanner = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SummaryStat = styled.div<{ $color?: string }>`
  flex: 1;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${({ $color }) => $color || 'rgba(255,255,255,0.1)'}, transparent);
  }
  
  h3 {
    margin: 0;
    color: #a1a1aa;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0;
    color: ${({ $color }) => $color || '#fff'};
    font-size: 1.75rem;
    font-weight: 700;
  }
`;

const ExpensesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ExpenseCard = styled.div<{ $isPaid: boolean }>`
  background: #09090b;
  border: 1px solid ${({ $isPaid }) => $isPaid ? '#064e3b' : '#27272a'};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ $isPaid }) => $isPaid ? '#059669' : '#3f3f46'};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const ToggleSwitch = styled.button<{ $isPaid: boolean }>`
  background: ${({ $isPaid }) => $isPaid ? '#10b981' : '#3f3f46'};
  border: none;
  border-radius: 999px;
  width: 52px;
  height: 28px;
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: background 0.3s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $isPaid }) => $isPaid ? '26px' : '2px'};
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

const DesktopToggleWrapper = styled.div`
  display: block;
  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileToggleWrapper = styled.div<{ $isPaid: boolean }>`
  display: none;
  @media (max-width: 640px) {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    background: ${({ $isPaid }) => $isPaid ? 'rgba(16, 185, 129, 0.1)' : '#18181b'};
    border: 1px solid ${({ $isPaid }) => $isPaid ? '#10b981' : '#27272a'};
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    cursor: pointer;
    box-sizing: border-box;
    
    span {
      font-weight: 600;
      color: ${({ $isPaid }) => $isPaid ? '#10b981' : '#a1a1aa'};
    }
  }
`;

const ExpenseInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
  }

  span {
    color: #a1a1aa;
    font-size: 0.85rem;
  }
`;

const CostInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;

  input {
    background: none;
    border: none;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    min-width: 140px;
    text-align: right;
    outline: none;

    &::placeholder {
      color: #52525b;
    }
  }

  span {
    color: #a1a1aa;
    font-size: 0.9rem;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    width: 100%;
    box-sizing: border-box;
    input {
      flex: 1;
      text-align: left;
    }
  }
`;

const CostActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  background: #18181b;
  border: 1px solid #3f3f46;
  color: #a1a1aa;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #fff;
    border-color: #52525b;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    justify-content: flex-end;
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
  border-radius: 6px;

  &:hover {
    color: #fff;
    background: #27272a;
  }
`;

const AddButton = styled.button`
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);

  h2 {
    color: #fff;
    margin-top: 0;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  label {
    color: #a1a1aa;
    font-size: 0.9rem;
  }

  input {
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 0.75rem;
    color: #fff;
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: #3b82f6;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  .cancel {
    background: transparent;
    color: #a1a1aa;
    &:hover { color: #fff; background: #27272a; }
  }

  .save {
    background: #3b82f6;
    color: #fff;
    &:hover { background: #2563eb; }
  }
`;

// Helper for 'YYYY-MM'
const formatMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const formatter = new Intl.NumberFormat('en-US');

function ExpenseItem({ 
  fc, 
  record, 
  onTogglePaid, 
  onCostChange, 
  onEdit, 
  onDelete 
}: { 
  fc: FixedCost; 
  record?: CostRecord; 
  onTogglePaid: (id: string, isPaid: boolean, amount: number | null) => void; 
  onCostChange: (id: string, newCostStr: string, isPaid: boolean) => void;
  onEdit: (fc: FixedCost) => void;
  onDelete: (id: string) => void;
}) {
  const isPaid = record?.is_paid ?? false;
  const initialAmount = record?.actual_amount ?? fc.default_amount;
  
  const [localInput, setLocalInput] = useState(initialAmount ? formatter.format(initialAmount) : '');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setLocalInput(initialAmount ? formatter.format(initialAmount) : '');
  }, [initialAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setLocalInput(raw ? parseInt(raw, 10).toLocaleString('en-US') : '');
  };

  const handleBlur = () => {
    onCostChange(fc.id, localInput, isPaid);
  };

  const handleSameAsPlanned = () => {
    const planStr = fc.default_amount ? fc.default_amount.toString() : '';
    setLocalInput(fc.default_amount ? formatter.format(fc.default_amount) : '');
    onCostChange(fc.id, planStr, true);
  };

  const isCustomized = record?.actual_amount != null && record.actual_amount !== fc.default_amount;
  const displayInput = showInput || isCustomized || !fc.default_amount;

  return (
    <ExpenseCard $isPaid={isPaid}>
      <DesktopToggleWrapper>
        <ToggleSwitch 
          $isPaid={isPaid}
          onClick={() => onTogglePaid(fc.id, isPaid, initialAmount)}
        />
      </DesktopToggleWrapper>
      
      <ExpenseInfo>
        <h3>{fc.name}</h3>
        <span>Plan: {fc.default_amount ? formatter.format(fc.default_amount) : '0'} ₫</span>
      </ExpenseInfo>

      {displayInput ? (
        <CostInputWrapper>
          <input 
            type="text"
            inputMode="numeric"
            placeholder="Actual Cost"
            value={localInput}
            onChange={handleInputChange}
            onBlur={handleBlur}
            autoFocus={showInput}
          />
          <span>₫</span>
        </CostInputWrapper>
      ) : (
        <CostActions>
          <QuickActionButton onClick={handleSameAsPlanned}>
            Same as Planned
          </QuickActionButton>
          <QuickActionButton onClick={() => setShowInput(true)}>
            Custom Amount
          </QuickActionButton>
        </CostActions>
      )}

      <ActionButtons>
        <ActionBtn onClick={() => onEdit(fc)}>
          <Edit2 size={18} />
        </ActionBtn>
        <ActionBtn onClick={() => onDelete(fc.id)}>
          <Trash2 size={18} />
        </ActionBtn>
      </ActionButtons>

      <MobileToggleWrapper 
        $isPaid={isPaid} 
        onClick={() => onTogglePaid(fc.id, isPaid, initialAmount)}
      >
        <span>{isPaid ? 'Paid' : 'Unpaid'}</span>
        <ToggleSwitch $isPaid={isPaid} as="div" />
      </MobileToggleWrapper>
    </ExpenseCard>
  );
}

export function FixedCosts() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [currentRecords, setCurrentRecords] = useState<CostRecord[]>([]);
  const [prevRecords, setPrevRecords] = useState<CostRecord[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FixedCost | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalCost, setModalCost] = useState('');

  const currentMonthKey = formatMonthKey(currentDate);
  
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = formatMonthKey(prevDate);

  const fetchData = async () => {
    try {
      const [costs, currRecs, prevRecs] = await Promise.all([
        expenseService.getFixedCosts(),
        expenseService.getCostRecords(currentMonthKey),
        expenseService.getCostRecords(prevMonthKey)
      ]);
      setFixedCosts(costs);
      setCurrentRecords(currRecs);
      setPrevRecords(prevRecs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonthKey, prevMonthKey]);

  const handlePrevMonth = () => {
    setCurrentDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() - 1);
      return nd;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + 1);
      return nd;
    });
  };

  const handleSaveTemplate = async () => {
    try {
      const amount = modalCost ? parseInt(modalCost.replace(/\D/g, ''), 10) : null;
      if (editingTemplate) {
        await expenseService.updateFixedCost(editingTemplate.id, {
          name: modalName,
          default_amount: amount
        });
      } else {
        await expenseService.createFixedCost(modalName, amount);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Delete this recurring expense permanently?')) {
      try {
        await expenseService.deleteFixedCost(id);
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleTogglePaid = async (fixedCostId: string, currentPaidState: boolean, actualAmount: number | null) => {
    try {
      await expenseService.upsertCostRecord(fixedCostId, currentMonthKey, actualAmount, !currentPaidState);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleActualCostChange = async (fixedCostId: string, newCostStr: string, isPaid: boolean) => {
    const amount = newCostStr ? parseInt(newCostStr.replace(/\D/g, ''), 10) : null;
    try {
      await expenseService.upsertCostRecord(fixedCostId, currentMonthKey, amount, isPaid);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Summaries
  const { totalPlanned, totalActual, totalPaid } = useMemo(() => {
    let p = 0, a = 0, paid = 0;
    fixedCosts.forEach(fc => {
      p += fc.default_amount || 0;
      
      const record = currentRecords.find(r => r.fixed_cost_id === fc.id);
      const actualVal = record?.actual_amount ?? fc.default_amount ?? 0;
      
      a += actualVal;
      if (record?.is_paid) {
        paid += actualVal;
      }
    });
    return { totalPlanned: p, totalActual: a, totalPaid: paid };
  }, [fixedCosts, currentRecords]);

  const totalPrevActual = useMemo(() => {
    let a = 0;
    fixedCosts.forEach(fc => {
      const record = prevRecords.find(r => r.fixed_cost_id === fc.id);
      a += record?.actual_amount ?? fc.default_amount ?? 0;
    });
    return a;
  }, [fixedCosts, prevRecords]);

  const diff = totalActual - totalPrevActual;
  const isHigher = diff > 0;
  
  const formatter = new Intl.NumberFormat('en-US');

  return (
    <PageContainer>
      <Header>
        <Title>
          Fixed <span>Costs</span>
        </Title>
        <MonthNavigator>
          <NavButton onClick={handlePrevMonth}><ChevronLeft size={20} /></NavButton>
          <MonthLabel>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </MonthLabel>
          <NavButton onClick={handleNextMonth}><ChevronRight size={20} /></NavButton>
        </MonthNavigator>
      </Header>

      <SummaryBanner>
        <SummaryStat $color="rgba(255,255,255,0.2)">
          <h3>Plan</h3>
          <p>{formatter.format(totalPlanned)} ₫</p>
        </SummaryStat>
        <SummaryStat $color="rgba(59, 130, 246, 0.4)">
          <h3>Actual</h3>
          <p>{formatter.format(totalActual)} ₫</p>
        </SummaryStat>
        <SummaryStat $color="rgba(16, 185, 129, 0.4)">
          <h3>Paid</h3>
          <p>{formatter.format(totalPaid)} ₫</p>
        </SummaryStat>
        <SummaryStat $color="rgba(161, 161, 170, 0.2)">
          <h3>Vs Last Month</h3>
          <p style={{ color: diff === 0 ? '#a1a1aa' : (isHigher ? '#ef4444' : '#10b981'), display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            {diff === 0 ? '-' : (isHigher ? <><TrendingUp size={20}/> +{formatter.format(diff)}</> : <><TrendingDown size={20}/> {formatter.format(Math.abs(diff))}</>)}
          </p>
        </SummaryStat>
      </SummaryBanner>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <AddButton onClick={() => {
          setEditingTemplate(null);
          setModalName('');
          setModalCost('');
          setIsModalOpen(true);
        }}>
          <Plus size={18} /> Add Fixed Cost
        </AddButton>
      </div>

      <ExpensesGrid>
        {fixedCosts.map(fc => (
          <ExpenseItem 
            key={fc.id}
            fc={fc}
            record={currentRecords.find(r => r.fixed_cost_id === fc.id)}
            onTogglePaid={handleTogglePaid}
            onCostChange={handleActualCostChange}
            onEdit={(template) => {
              setEditingTemplate(template);
              setModalName(template.name);
              setModalCost(template.default_amount ? formatter.format(template.default_amount) : '');
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTemplate}
          />
        ))}
        {fixedCosts.length === 0 && (
          <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '3rem' }}>
            No fixed costs defined. Click "Add Fixed Cost" to start planning your bills!
          </div>
        )}
      </ExpensesGrid>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{editingTemplate ? 'Edit Fixed Cost' : 'New Fixed Cost'}</h2>
            <FormGroup>
              <label>Name (e.g. Rent, Electricity)</label>
              <input 
                type="text" 
                value={modalName} 
                onChange={e => setModalName(e.target.value)} 
                autoFocus
              />
            </FormGroup>
            <FormGroup>
              <label>Planned Cost (VND)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={modalCost} 
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setModalCost(raw ? parseInt(raw, 10).toLocaleString('en-US') : '');
                }} 
              />
            </FormGroup>
            <ModalActions>
              <button className="cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="save" onClick={handleSaveTemplate}>Save</button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
