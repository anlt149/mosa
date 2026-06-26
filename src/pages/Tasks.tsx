import { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskService } from '../services/taskService';
import { Plus, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight, Edit2, X, Check } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Layout ─────────────────────────── */
const PageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.25rem;
`;

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: #27272a;
  }
`;

const DateLabel = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 1rem;
  min-width: 140px;
  text-align: center;
`;

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent);
  }
`;

const AddTaskForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  flex: 1;
  background: #18181b;
  border: 1px solid #3f3f46;
  color: #fff;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  border-radius: 12px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const AddButton = styled.button`
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TaskItem = styled.div<{ $isDone: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: #3f3f46;
    background: #27272a;
  }

  opacity: ${props => props.$isDone ? 0.6 : 1};
`;

const TaskContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const CheckButton = styled.button<{ $isDone: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.$isDone ? '#10b981' : '#52525b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.$isDone ? '#059669' : '#10b981'};
    transform: scale(1.1);
  }
`;

const TaskText = styled.span<{ $isDone: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDone ? '#a1a1aa' : '#fff'};
  text-decoration: ${props => props.$isDone ? 'line-through' : 'none'};
  transition: all 0.2s;
`;

const TaskActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  background: transparent;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${props => props.$danger ? '#ef4444' : '#fff'};
  }
`;

const EditInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid #3b82f6;
  color: #fff;
  font-size: 1rem;
  padding: 0.25rem 0;
  outline: none;
  font-family: inherit;
`;

export function Tasks() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTaskName, setNewTaskName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const queryClient = useQueryClient();

  const dateStr = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  }, [currentDate]);

  const dateLabel = useMemo(() => {
    const today = new Date();
    const isToday = currentDate.getDate() === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear();
    
    if (isToday) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = currentDate.getDate() === yesterday.getDate() && 
                        currentDate.getMonth() === yesterday.getMonth() && 
                        currentDate.getFullYear() === yesterday.getFullYear();
                        
    if (isYesterday) return 'Yesterday';

    return currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [currentDate]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['daily_tasks', dateStr],
    queryFn: () => taskService.getTasks(dateStr)
  });

  const handlePrevDay = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  const handleNextDay = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));

  const createMutation = useMutation({
    mutationFn: (name: string) => taskService.createTask(name, dateStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_tasks', dateStr] });
      setNewTaskName('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => taskService.updateTaskName(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_tasks', dateStr] });
      setEditingId(null);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string, isDone: boolean }) => taskService.toggleTaskDone(id, isDone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_tasks', dateStr] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_tasks', dateStr] });
      toast.success('Task deleted');
    }
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    createMutation.mutate(newTaskName.trim());
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateMutation.mutate({ id: editingId, name: editName.trim() });
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.is_done === b.is_done) return 0;
      return a.is_done ? 1 : -1;
    });
  }, [tasks]);

  return (
    <PageContainer>
      <Header>
        <Title>Daily <span>Tasks</span></Title>
        <DateSelector>
          <NavButton onClick={handlePrevDay} aria-label="Previous day"><ChevronLeft size={16} /></NavButton>
          <DateLabel>{dateLabel}</DateLabel>
          <NavButton onClick={handleNextDay} aria-label="Next day"><ChevronRight size={16} /></NavButton>
        </DateSelector>
      </Header>

      <Card>
        <AddTaskForm onSubmit={handleAddTask}>
          <Input 
            type="text" 
            placeholder="What do you need to do?" 
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            disabled={createMutation.isPending}
          />
          <AddButton type="submit" disabled={!newTaskName.trim() || createMutation.isPending}>
            <Plus size={20} /> Add
          </AddButton>
        </AddTaskForm>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '2rem' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#52525b', padding: '3rem 1rem', border: '1px dashed #27272a', borderRadius: '12px' }}>
            No tasks for this day. Get started by adding one above!
          </div>
        ) : (
          <TaskList>
            {sortedTasks.map(task => (
              <TaskItem key={task.id} $isDone={task.is_done}>
                <TaskContent>
                  <CheckButton 
                    $isDone={task.is_done} 
                    onClick={() => toggleMutation.mutate({ id: task.id, isDone: !task.is_done })}
                  >
                    {task.is_done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </CheckButton>

                  {editingId === task.id ? (
                    <EditInput
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={handleSaveEdit}
                    />
                  ) : (
                    <TaskText $isDone={task.is_done}>{task.name}</TaskText>
                  )}
                </TaskContent>

                <TaskActions>
                  {editingId === task.id ? (
                    <>
                      <IconButton onClick={handleSaveEdit}><Check size={18} color="#10b981" /></IconButton>
                      <IconButton onClick={() => setEditingId(null)}><X size={18} /></IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => {
                        setEditingId(task.id);
                        setEditName(task.name);
                      }}>
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton $danger onClick={() => deleteMutation.mutate(task.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </>
                  )}
                </TaskActions>
              </TaskItem>
            ))}
          </TaskList>
        )}
      </Card>
    </PageContainer>
  );
}
