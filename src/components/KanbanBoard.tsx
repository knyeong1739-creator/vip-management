import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, CheckCircle2, Circle, Loader2, ChevronRight } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { cn } from '../lib/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const columns: { id: TaskStatus; label: string; color: string; bg: string; border: string }[] = [
  { id: 'todo', label: '할 일', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { id: 'inprogress', label: '진행 중', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'done', label: '완료', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

export default function KanbanBoard({ tasks, onAddTask, onUpdateTaskStatus, onDeleteTask, isAdmin }: KanbanBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '' });
  const [addLoading, setAddLoading] = useState(false);

  const handleAdd = async () => {
    if (!addForm.title.trim()) return;
    setAddLoading(true);
    try {
      await onAddTask({ title: addForm.title, description: addForm.description, status: 'todo' });
      setAddForm({ title: '', description: '' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'todo') return 'inprogress';
    if (current === 'inprogress') return 'done';
    return 'todo';
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'done') return 'inprogress';
    if (current === 'inprogress') return 'todo';
    return 'done';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-2xl text-blue-950 uppercase tracking-tight">할 일 보드</h2>
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-1">Task Board · 대외선교부</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-700 text-white rounded-2xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={18} /> 할 일 추가
          </button>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl text-blue-950 uppercase tracking-tight">할 일 추가</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-blue-50 rounded-xl transition-all">
                  <X size={20} className="text-blue-300" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">제목</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="할 일 제목"
                    value={addForm.title}
                    onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 placeholder:text-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">설명 (선택)</label>
                  <textarea
                    placeholder="상세 내용을 입력하세요"
                    value={addForm.description}
                    onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 placeholder:text-blue-200 min-h-[100px] resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleAdd}
                    disabled={addLoading || !addForm.title.trim()}
                    className="flex-1 p-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all disabled:opacity-50"
                  >
                    {addLoading ? '추가 중...' : '추가하기'}
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-6 p-4 bg-blue-50 text-blue-700 rounded-2xl font-black hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    취소
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={cn('rounded-3xl border p-6 space-y-4 min-h-[400px]', col.bg, col.border)}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {col.id === 'todo' && <Circle size={18} className={col.color} />}
                  {col.id === 'inprogress' && <Loader2 size={18} className={cn(col.color, 'animate-spin')} />}
                  {col.id === 'done' && <CheckCircle2 size={18} className={col.color} />}
                  <h3 className={cn('font-black text-sm uppercase tracking-widest', col.color)}>{col.label}</h3>
                </div>
                <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-full', col.color, 'bg-white/70 border', col.border)}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <AnimatePresence>
                  {colTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-white/80 group hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-black text-sm text-blue-950 leading-snug',
                            task.status === 'done' && 'line-through text-blue-300'
                          )}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-blue-400 font-bold mt-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-blue-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Status Move Buttons - 관리자만 */}
                      {isAdmin && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-blue-50">
                          {task.status !== 'todo' && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, getPrevStatus(task.status))}
                              className="flex-1 py-2 text-[10px] font-black uppercase tracking-wide text-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all border border-blue-100 flex items-center justify-center gap-1"
                            >
                              <ChevronRight size={12} className="rotate-180" />
                              {task.status === 'inprogress' ? '할 일로' : '진행 중으로'}
                            </button>
                          )}
                          {task.status !== 'done' && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, getNextStatus(task.status))}
                              className="flex-1 py-2 text-[10px] font-black uppercase tracking-wide text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all border border-blue-200 flex items-center justify-center gap-1"
                            >
                              {task.status === 'todo' ? '진행 중으로' : '완료로'}
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div className="py-12 text-center">
                    <p className={cn('text-[10px] font-black uppercase tracking-widest', col.color, 'opacity-30')}>비어 있음</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
