import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { TaskPriority, TaskStatus } from '../types/task';
import { STATUS_LABELS } from '../utils/progress';

export function CreateTaskModal() {
  const {
    createModalOpen,
    createModalDefaultStatus,
    closeCreateModal,
    projects,
    selectedProjectId,
    addTask,
    showToast,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtaskTitles, setSubtaskTitles] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!createModalOpen) return;
    setTitle('');
    setDescription('');
    setStatus(createModalDefaultStatus);
    setPriority('medium');
    setProjectId(
      selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj_product'
    );
    setDueDate('');
    setSubtaskDraft('');
    setSubtaskTitles([]);
    setErrorMsg('');
  }, [createModalOpen, createModalDefaultStatus, selectedProjectId, projects]);

  useEffect(() => {
    if (!createModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [createModalOpen, closeCreateModal]);

  if (!createModalOpen) return null;

  const handleAddQueuedSubtask = () => {
    const clean = subtaskDraft.trim();
    if (!clean) return;
    setSubtaskTitles((prev) => [...prev, clean]);
    setSubtaskDraft('');
  };

  const handleRemoveQueuedSubtask = (index: number) => {
    setSubtaskTitles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề công việc.');
      return;
    }

    const finalSubtasks = subtaskDraft.trim()
      ? [...subtaskTitles, subtaskDraft.trim()]
      : subtaskTitles;

    addTask({
      title,
      description,
      status,
      priority,
      projectId: projectId || projects[0]?.id || 'proj_product',
      dueDate: dueDate || null,
      subtaskTitles: finalSubtasks,
    });

    closeCreateModal();
    showToast({ message: 'Đã tạo công việc mới', tone: 'success' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tạo công việc mới"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={closeCreateModal}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg bg-[#121620] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="font-display text-base font-semibold text-slate-100">
            Tạo công việc mới
          </h2>
          <button
            type="button"
            onClick={closeCreateModal}
            aria-label="Đóng hộp thoại"
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label htmlFor="create-title" className="block text-xs font-medium text-slate-300">
              Tiêu đề công việc <span className="text-red-400">*</span>
            </label>
            <input
              id="create-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ví dụ: Hoàn thiện báo cáo tiến độ tuần 3"
              autoFocus
              className="w-full h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="create-project" className="block text-xs font-medium text-slate-300">
                Nhóm công việc
              </label>
              <select
                id="create-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-status" className="block text-xs font-medium text-slate-300">
                Cột trạng thái
              </label>
              <select
                id="create-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="todo">{STATUS_LABELS.todo}</option>
                <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                <option value="done">{STATUS_LABELS.done}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-priority" className="block text-xs font-medium text-slate-300">
                Mức ưu tiên
              </label>
              <select
                id="create-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-due-date" className="block text-xs font-medium text-slate-300">
                Hạn chót
              </label>
              <input
                id="create-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Initial Subtasks */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-medium text-slate-300">
              Việc con ban đầu (tự động tính % tiến độ)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQueuedSubtask();
                  }
                }}
                placeholder="Nhập việc con rồi nhấn Enter..."
                className="flex-1 h-10 px-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddQueuedSubtask}
                className="inline-flex items-center gap-1 h-10 px-3 text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 rounded-md whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            {subtaskTitles.length > 0 && (
              <ul className="border border-white/[0.08] rounded-md bg-[#0B0E14] divide-y divide-white/[0.06]">
                {subtaskTitles.map((item, idx) => (
                  <li
                    key={`${item}-${idx}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-200"
                  >
                    <span className="truncate">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQueuedSubtask(idx)}
                      aria-label={`Bỏ việc con ${item}`}
                      className="p-1 text-slate-500 hover:text-red-400 rounded shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="create-desc" className="block text-xs font-medium text-slate-300">
              Mô tả chi tiết
            </label>
            <textarea
              id="create-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm thông tin hoặc tiêu chí cần đạt..."
              className="w-full p-3 text-sm bg-[#0B0E14] border border-white/[0.1] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 min-h-[40px] text-sm font-medium text-slate-300 hover:text-white rounded-md transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 min-h-[40px] text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors whitespace-nowrap"
            >
              Lưu công việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
