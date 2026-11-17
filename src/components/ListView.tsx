import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Plus,
} from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { Task, TaskStatus } from '../types/task';
import {
  calculateTaskProgress,
  getDeadlineDisplay,
  getSubtaskStats,
  PRIORITY_SHORT_LABELS,
  STATUS_LABELS,
} from '../utils/progress';

export function ListView() {
  const {
    filteredTasks,
    tasks,
    projects,
    selectedProjectId,
    setActiveTaskId,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    addTask,
    openCreateModal,
    resetAllFilters,
  } = useTasks();

  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    // Expand first active task with subtasks by default for immediate clarity
    const firstWithSubtasks = tasks.find((t) => t.subtasks.length > 0 && t.status !== 'done');
    if (firstWithSubtasks) initial[firstWithSubtasks.id] = true;
    return initial;
  });
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTaskTitle.trim();
    if (!trimmed) return;
    const defaultProjId =
      selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj_product';
    const created = addTask({
      title: trimmed,
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: defaultProjId,
      dueDate: null,
      subtaskTitles: [],
    });
    setQuickTaskTitle('');
    setExpandedTaskIds((prev) => ({ ...prev, [created.id]: true }));
  };

  const handleAddInlineSubtask = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    const val = (inlineSubtaskInputs[taskId] || '').trim();
    if (!val) return;
    addSubtask(taskId, val);
    setInlineSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const renderStatusIcon = (task: Task) => {
    if (task.status === 'done') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (task.status === 'in_progress') {
      return <Clock className="w-4 h-4 text-blue-400" />;
    }
    return <Circle className="w-4 h-4 text-slate-500 group-hover/status:text-slate-300" />;
  };

  const cycleQuickStatus = (task: Task) => {
    const next: TaskStatus =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'done'
        : 'todo';
    moveTaskStatus(task.id, next);
  };

  if (filteredTasks.length === 0) {
    const hasAnyTasks = tasks.length > 0;
    return (
      <div className="bg-[#121620] border border-white/[0.08] rounded-lg p-10 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="font-display text-base font-semibold text-slate-100">
            {hasAnyTasks
              ? 'Không có công việc nào khớp với bộ lọc hiện tại'
              : 'Danh sách công việc đang trống'}
          </h2>
          <p className="text-sm text-slate-400">
            {hasAnyTasks
              ? 'Thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem toàn bộ danh sách công việc.'
              : 'Tạo công việc đầu tiên và thêm các việc con để hệ thống tự động tính phần trăm tiến độ.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          {hasAnyTasks && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 min-h-[40px] text-sm font-medium text-slate-200 bg-[#0B0E14] hover:bg-white/[0.06] border border-white/[0.08] rounded-md transition-colors whitespace-nowrap"
            >
              Đặt lại bộ lọc
            </button>
          )}
          <button
            type="button"
            onClick={() => openCreateModal('todo')}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo công việc mới</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121620] border border-white/[0.08] rounded-lg overflow-hidden">
      {/* Quick Add Task Row */}
      <form
        onSubmit={handleQuickAddTask}
        className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-white/[0.08] bg-[#0F131C]"
      >
        <Plus className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
          placeholder="Thêm nhanh công việc mới rồi nhấn Enter..."
          aria-label="Thêm nhanh công việc mới"
          className="flex-1 min-w-0 py-1.5 text-sm bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {quickTaskTitle.trim() && (
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
          >
            Thêm việc
          </button>
        )}
      </form>

      {/* Desktop Column Headers */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_140px_170px_140px] gap-4 px-5 py-2.5 border-b border-white/[0.08] text-xs font-medium text-slate-400">
        <span>Công việc &amp; việc con</span>
        <span>Hạn chót</span>
        <span>Tiến độ</span>
        <span className="text-right">Trạng thái</span>
      </div>

      {/* Task Rows */}
      <div className="divide-y divide-white/[0.06]">
        {filteredTasks.map((task) => {
          const progress = calculateTaskProgress(task);
          const { completed, total, hasSubtasks } = getSubtaskStats(task);
          const deadline = getDeadlineDisplay(task.dueDate, task.status);
          const project = projectMap[task.projectId];
          const isExpanded = Boolean(expandedTaskIds[task.id]);

          const deadlineColorClass =
            deadline.tone === 'overdue'
              ? 'text-red-400'
              : deadline.tone === 'soon'
              ? 'text-amber-400'
              : deadline.tone === 'done'
              ? 'text-slate-500'
              : 'text-slate-400';

          const priorityColorClass =
            task.priority === 'high'
              ? 'text-red-400'
              : task.priority === 'medium'
              ? 'text-amber-400'
              : 'text-slate-400';

          return (
            <div key={task.id} className="transition-colors hover:bg-white/[0.02]">
              {/* Primary Row */}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_170px_140px] gap-3 md:gap-4 items-center px-4 sm:px-5 py-3.5">
                {/* Col 1: Toggle + Expand + Title + Inline Unboxed Metadata */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => cycleQuickStatus(task)}
                    aria-label={`Đổi trạng thái công việc ${task.title}`}
                    title="Nhấn để chuyển nhanh trạng thái"
                    className="group/status mt-0.5 p-1 -ml-1 rounded hover:bg-white/[0.06] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {renderStatusIcon(task)}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(task.id)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Thu gọn việc con' : 'Mở rộng việc con'}
                    title={isExpanded ? 'Thu gọn việc con' : 'Xem và thêm việc con'}
                    className="mt-0.5 p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveTaskId(task.id)}
                      className={`text-left text-sm font-medium leading-snug transition-colors hover:text-blue-400 focus-visible:outline-none focus-visible:underline ${
                        task.status === 'done'
                          ? 'text-slate-400 line-through'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </button>

                    {/* Clean Unboxed Metadata with middot separators */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                      {project && (
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          <span
                            className="w-2 h-2 rounded-[2px] shrink-0"
                            style={{ backgroundColor: project.color }}
                            aria-hidden="true"
                          />
                          <span>{project.name}</span>
                        </span>
                      )}
                      {project && <span aria-hidden="true">·</span>}
                      <span className={priorityColorClass}>
                        Ưu tiên {PRIORITY_SHORT_LABELS[task.priority].toLowerCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {hasSubtasks ? `${completed}/${total} việc con` : 'Chưa có việc con'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Deadline */}
                <div className="flex items-center gap-1.5 pl-14 md:pl-0 text-xs">
                  {deadline.tone === 'overdue' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : (
                    <Calendar className={`w-3.5 h-3.5 shrink-0 ${deadlineColorClass}`} />
                  )}
                  <span className={`font-mono tabular-nums truncate ${deadlineColorClass}`}>
                    {deadline.label}
                  </span>
                </div>

                {/* Col 3: Auto Progress Bar + % */}
                <div className="flex items-center gap-2.5 pl-14 md:pl-0">
                  <div
                    className="flex-1 h-1.5 bg-[#0B0E14] rounded-sm overflow-hidden border border-white/[0.06]"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Tiến độ ${task.title}`}
                  >
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
                  <span
                    className={`font-mono tabular-nums text-xs font-medium w-9 text-right shrink-0 ${
                      progress === 100 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {progress}%
                  </span>
                </div>

                {/* Col 4: Inline Status Selector */}
                <div className="flex items-center justify-end pl-14 md:pl-0">
                  <select
                    value={task.status}
                    onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                    aria-label={`Trạng thái của ${task.title}`}
                    className={`h-8 px-2.5 text-xs font-medium bg-[#0B0E14] border border-white/[0.08] rounded focus:outline-none focus:border-blue-500 cursor-pointer ${
                      task.status === 'done'
                        ? 'text-emerald-400'
                        : task.status === 'in_progress'
                        ? 'text-blue-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <option value="todo">{STATUS_LABELS.todo}</option>
                    <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                    <option value="done">{STATUS_LABELS.done}</option>
                  </select>
                </div>
              </div>

              {/* Expandable Inline Subtask Checklist */}
              {isExpanded && (
                <div className="pl-12 sm:pl-14 pr-4 sm:pr-5 pb-4 pt-1 space-y-1.5">
                  {task.subtasks.length > 0 && (
                    <div className="border-l border-white/[0.08] pl-4 space-y-1">
                      {task.subtasks.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded hover:bg-white/[0.03] cursor-pointer group/sub"
                        >
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleSubtask(task.id, sub.id)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`w-4 h-4 rounded-[3px] flex items-center justify-center border transition-colors shrink-0 ${
                              sub.completed
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-[#0B0E14] border-white/[0.2] group-hover/sub:border-blue-400'
                            }`}
                          >
                            {sub.completed && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </span>
                          <span
                            className={`text-sm leading-snug ${
                              sub.completed
                                ? 'text-slate-500 line-through'
                                : 'text-slate-200'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Inline Add Subtask */}
                  <form
                    onSubmit={(e) => handleAddInlineSubtask(e, task.id)}
                    className="border-l border-white/[0.08] pl-4 flex items-center gap-2 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={inlineSubtaskInputs[task.id] || ''}
                      onChange={(e) =>
                        setInlineSubtaskInputs((prev) => ({
                          ...prev,
                          [task.id]: e.target.value,
                        }))
                      }
                      placeholder="Thêm việc con để tự động tính % (nhấn Enter)..."
                      aria-label={`Thêm việc con cho ${task.title}`}
                      className="flex-1 min-w-0 py-1 text-xs bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none"
                    />
                    {(inlineSubtaskInputs[task.id] || '').trim() && (
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 rounded transition-colors whitespace-nowrap"
                      >
                        Thêm
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
