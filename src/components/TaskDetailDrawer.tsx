import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { TaskPriority, TaskStatus } from '../types/task';
import {
  calculateTaskProgress,
  getDeadlineDisplay,
  getSubtaskStats,
  STATUS_LABELS,
} from '../utils/progress';

export function TaskDetailDrawer() {
  const {
    activeTask,
    setActiveTaskId,
    projects,
    updateTask,
    moveTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    updateSubtaskTitle,
    deleteSubtask,
    moveSubtask,
  } = useTasks();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    setEditingSubtaskId(null);
    setNewSubtaskTitle('');
  }, [activeTask?.id]);

  useEffect(() => {
    if (!activeTask) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTaskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTask, setActiveTaskId]);

  if (!activeTask) return null;

  const progress = calculateTaskProgress(activeTask);
  const { completed, total, hasSubtasks } = getSubtaskStats(activeTask);
  const deadline = getDeadlineDisplay(activeTask.dueDate, activeTask.status);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(activeTask.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const commitSubtaskEdit = (subtaskId: string) => {
    if (editingSubtaskText.trim()) {
      updateSubtaskTitle(activeTask.id, subtaskId, editingSubtaskText);
    }
    setEditingSubtaskId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết công việc"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={() => setActiveTaskId(null)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-lg h-full bg-[#121620] border-l border-white/[0.08] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Chi tiết công việc</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-mono tabular-nums font-medium ${
                progress === 100 ? 'text-emerald-400' : 'text-blue-400'
              }`}
            >
              {progress}% hoàn thành
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTaskId(null)}
            aria-label="Đóng chi tiết công việc"
            className="p-2 -mr-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Editable Title */}
          <div>
            <label htmlFor="drawer-task-title" className="sr-only">
              Tiêu đề công việc
            </label>
            <input
              id="drawer-task-title"
              type="text"
              value={activeTask.title}
              onChange={(e) => updateTask(activeTask.id, { title: e.target.value })}
              className="w-full font-display text-lg font-semibold text-slate-100 bg-transparent border border-transparent hover:border-white/[0.08] focus:border-blue-500 focus:bg-[#0B0E14] rounded-md px-2.5 py-1.5 -mx-2.5 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-400">Trạng thái</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0E14] border border-white/[0.08] rounded-md">
              {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((st) => {
                const isActive = activeTask.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => moveTaskStatus(activeTask.id, st)}
                    className={`py-2 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      isActive
                        ? st === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : st === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-[#1E2638] text-slate-100'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {STATUS_LABELS[st]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="drawer-project" className="block text-xs font-medium text-slate-400">
                Nhóm công việc
              </label>
              <select
                id="drawer-project"
                value={activeTask.projectId}
                onChange={(e) => updateTask(activeTask.id, { projectId: e.target.value })}
                className="w-full h-10 px-2.5 text-sm bg-[#0B0E14] border border-white/[0.08] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drawer-priority" className="block text-xs font-medium text-slate-400">
                Mức ưu tiên
              </label>
              <select
                id="drawer-priority"
                value={activeTask.priority}
                onChange={(e) =>
                  updateTask(activeTask.id, { priority: e.target.value as TaskPriority })
                }
                className="w-full h-10 px-2.5 text-sm bg-[#0B0E14] border border-white/[0.08] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drawer-due-date" className="block text-xs font-medium text-slate-400">
                Hạn chót
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="drawer-due-date"
                  type="date"
                  value={activeTask.dueDate || ''}
                  onChange={(e) =>
                    updateTask(activeTask.id, { dueDate: e.target.value || null })
                  }
                  className="w-full h-10 px-2.5 text-sm font-mono bg-[#0B0E14] border border-white/[0.08] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
                />
                {activeTask.dueDate && (
                  <button
                    type="button"
                    onClick={() => updateTask(activeTask.id, { dueDate: null })}
                    aria-label="Xóa hạn chót"
                    title="Xóa hạn chót"
                    className="p-2 text-slate-400 hover:text-slate-100 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {activeTask.dueDate && (
            <p
              className={`text-xs font-mono tabular-nums -mt-3 ${
                deadline.tone === 'overdue'
                  ? 'text-red-400'
                  : deadline.tone === 'soon'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              Trạng thái hạn: {deadline.label}
            </p>
          )}

          {/* Progress & Subtask Section */}
          <div className="pt-4 border-t border-white/[0.08] space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Tiến độ &amp; Danh sách việc con
                </h3>
                <span
                  className={`font-mono tabular-nums text-sm font-semibold ${
                    progress === 100 ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  {progress}%
                </span>
              </div>

              <div className="w-full h-2 bg-[#0B0E14] rounded-sm overflow-hidden border border-white/[0.06]">
                <div
                  className={`h-full transition-[width] duration-200 ${
                    progress === 100
                      ? 'bg-emerald-500'
                      : progress > 0
                      ? 'bg-blue-500'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-slate-400">
                {hasSubtasks
                  ? `Tự động tính từ ${completed}/${total} việc con đã hoàn thành.`
                  : activeTask.status === 'in_progress'
                  ? 'Chưa có việc con — có thể kéo thanh bên dưới hoặc thêm việc con để tính tự động.'
                  : 'Thêm các việc con bên dưới để hệ thống tự động tính phần trăm tiến độ.'}
              </p>

              {/* Manual Progress Slider only when no subtasks and in_progress */}
              {!hasSubtasks && activeTask.status === 'in_progress' && (
                <div className="pt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={95}
                    step={5}
                    value={activeTask.manualProgress || 50}
                    onChange={(e) =>
                      updateTask(activeTask.id, { manualProgress: Number(e.target.value) })
                    }
                    aria-label="Điều chỉnh tiến độ thủ công"
                    className="flex-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="font-mono tabular-nums text-xs text-slate-300 w-10 text-right">
                    {activeTask.manualProgress || 50}%
                  </span>
                </div>
              )}
            </div>

            {/* Subtasks List */}
            {activeTask.subtasks.length > 0 && (
              <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-md bg-[#0B0E14]">
                {activeTask.subtasks.map((sub, index) => (
                  <div
                    key={sub.id}
                    className="group flex items-center gap-2.5 px-3 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtask(activeTask.id, sub.id)}
                      aria-label={
                        sub.completed
                          ? `Bỏ đánh dấu ${sub.title}`
                          : `Đánh dấu xong ${sub.title}`
                      }
                      className={`w-4 h-4 rounded-[3px] flex items-center justify-center border transition-colors shrink-0 ${
                        sub.completed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-[#121620] border-white/[0.2] hover:border-blue-400'
                      }`}
                    >
                      {sub.completed && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>

                    {editingSubtaskId === sub.id ? (
                      <input
                        type="text"
                        value={editingSubtaskText}
                        onChange={(e) => setEditingSubtaskText(e.target.value)}
                        onBlur={() => commitSubtaskEdit(sub.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitSubtaskEdit(sub.id);
                          if (e.key === 'Escape') setEditingSubtaskId(null);
                        }}
                        autoFocus
                        className="flex-1 min-w-0 px-2 py-0.5 text-sm bg-[#121620] border border-blue-500 rounded text-slate-100 focus:outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubtaskId(sub.id);
                          setEditingSubtaskText(sub.title);
                        }}
                        className={`flex-1 min-w-0 text-left text-sm leading-snug ${
                          sub.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-200 hover:text-white'
                        }`}
                      >
                        {sub.title}
                      </button>
                    )}

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSubtask(activeTask.id, index, 'up')}
                        aria-label="Di chuyển việc con lên"
                        className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 rounded"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === activeTask.subtasks.length - 1}
                        onClick={() => moveSubtask(activeTask.id, index, 'down')}
                        aria-label="Di chuyển việc con xuống"
                        className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 rounded"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubtask(activeTask.id, sub.id)}
                        aria-label={`Xóa việc con ${sub.title}`}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Nhập việc con mới và nhấn Enter..."
                aria-label="Thêm việc con mới"
                className="flex-1 h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.08] rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-10 px-3.5 text-sm font-medium bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </form>
          </div>

          {/* Description / Notes */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <label htmlFor="drawer-description" className="block text-xs font-medium text-slate-400">
              Mô tả &amp; Ghi chú
            </label>
            <textarea
              id="drawer-description"
              rows={4}
              value={activeTask.description}
              onChange={(e) => updateTask(activeTask.id, { description: e.target.value })}
              placeholder="Ghi chú thêm ngữ cảnh, đường dẫn hoặc tiêu chí hoàn thành..."
              className="w-full p-3 text-sm bg-[#0B0E14] border border-white/[0.08] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] flex items-center justify-between gap-4 shrink-0 bg-[#0F131C]">
          <span className="text-xs font-mono tabular-nums text-slate-500">
            Cập nhật {new Date(activeTask.updatedAt).toLocaleDateString('vi-VN')}
          </span>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa công việc</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-md"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteTask(activeTask.id)}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-md whitespace-nowrap"
              >
                Xác nhận xóa
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
